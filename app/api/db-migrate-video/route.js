import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// One-time migration: add video_url and video_poster_url to reviews table
// DELETE this file after running!

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

export async function GET() {
  // Use Supabase REST API to check if columns exist
  const { data, error } = await supabase
    .from('reviews')
    .select('id, video_url, video_poster_url')
    .limit(1);

  if (error && error.code === '42703') {
    // Columns don't exist — need to create them via SQL
    // Supabase REST API doesn't support ALTER TABLE, so we use rpc
    const { error: sqlError } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE reviews ADD COLUMN IF NOT EXISTS video_url TEXT NULL;
        ALTER TABLE reviews ADD COLUMN IF NOT EXISTS video_poster_url TEXT NULL;
      `
    });

    if (sqlError) {
      // rpc not available — return instructions for manual SQL
      return NextResponse.json({
        status: 'needs_manual_sql',
        message: 'Supabase rpc not available. Run this SQL in Dashboard SQL Editor:',
        sql: `
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS video_url TEXT NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS video_poster_url TEXT NULL;
        `,
        dashboard_url: 'https://supabase.com/dashboard/project/olgfqcygqzuevaftmdja/sql',
      });
    }

    return NextResponse.json({ status: 'migration_complete', columns_added: ['video_url', 'video_poster_url'] });
  }

  if (!error) {
    return NextResponse.json({ status: 'columns_already_exist', columns: ['video_url', 'video_poster_url'] });
  }

  return NextResponse.json({ status: 'error', error }, { status: 500 });
}