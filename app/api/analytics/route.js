import { NextResponse } from 'next/server';
import { API_CACHE_HEADERS } from '../../../lib/api-helpers';

// Cloudflare Analytics GraphQL API - credentials via Vercel ENV
const CF_ZONE_ID = process.env.CF_ZONE_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;

export async function GET() {
  // Build date range: last 7 days
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  const fmt = (d) => d.toISOString().split('T')[0];

  const query = `{
    viewer {
      zones(filter: { zoneTag: "${CF_ZONE_ID}" }) {
        httpRequests1dGroups(
          limit: 7
          filter: { date_geq: "${fmt(start)}", date_leq: "${fmt(end)}" }
          orderBy: [date_ASC]
        ) {
          dimensions { date }
          sum { pageViews requests }
          uniq { uniques }
        }
      }
    }
  }`;

  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const json = await res.json();

    if (json.errors) {
      // Return 200 with permission_error flag so stats page can show a friendly message
      return NextResponse.json({ permission_error: true, error: json.errors[0]?.message }, {status: 200, headers: API_CACHE_HEADERS });
    }

    const rows = json?.data?.viewer?.zones?.[0]?.httpRequests1dGroups || [];

    // Build last 7 days labels (fill gaps with 0)
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return fmt(d);
    });

    const byDate = {};
    rows.forEach(r => {
      byDate[r.dimensions.date] = {
        pageViews: r.sum.pageViews,
        requests: r.sum.requests,
        uniques: r.uniq.uniques,
      };
    });

    const result = days.map(date => ({
      date,
      pageViews: byDate[date]?.pageViews || 0,
      requests: byDate[date]?.requests || 0,
      uniques: byDate[date]?.uniques || 0,
    }));

    const totalPageViews = result.reduce((s, r) => s + r.pageViews, 0);
    const totalUniques = result.reduce((s, r) => s + r.uniques, 0);

    return NextResponse.json({ days: result, totalPageViews, totalUniques }, { headers: API_CACHE_HEADERS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, {status: 500, headers: API_CACHE_HEADERS });
  }
}
