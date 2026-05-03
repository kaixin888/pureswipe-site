'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, Col, Row, Statistic, Typography, Spin, Tag, Table } from 'antd';
import {
  ApiOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend, Filler);

const { Title } = Typography;

const DAILY_LIMITS = {
  abuseipdb: 1000,
  safebrowsing: 10000,
};

const API_LABELS = {
  abuseipdb: 'AbuseIPDB',
  disify: 'Disify',
  'ip-api': 'IP-API',
  safebrowsing: 'Safe Browsing',
  linkpreview: 'Link Preview',
};

export default function ApiUsagePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(function () {
    fetch('/api/analytics/usage')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (json) {
        if (Array.isArray(json)) {
          setData(json);
        } else if (json.data && Array.isArray(json.data)) {
          setData(json.data);
        } else {
          setError('Unexpected response format');
        }
      })
      .catch(function (e) { setError(e.message); })
      .finally(function () { setLoading(false); });
  }, []);

  var stats = useMemo(function () {
    var total = data.length;
    var errorsCount = data.filter(function (r) {
      return r.status_code === 0 || (r.status_code >= 400 && r.status_code !== 0);
    }).length;
    var successCount = total - errorsCount;
    var avgDuration = total > 0
      ? data.reduce(function (sum, r) { return sum + (r.duration_ms || 0); }, 0) / total
      : 0;

    var byApi = {};
    data.forEach(function (r) {
      if (!byApi[r.api_name]) byApi[r.api_name] = { total: 0, errors: 0, avgMs: 0 };
      byApi[r.api_name].total++;
      if (r.status_code === 0 || (r.status_code >= 400 && r.status_code !== 0)) {
        byApi[r.api_name].errors++;
      }
    });
    Object.keys(byApi).forEach(function (k) {
      var rows = data.filter(function (r) { return r.api_name === k; });
      byApi[k].avgMs = rows.length > 0
        ? rows.reduce(function (s, r) { return s + (r.duration_ms || 0); }, 0) / rows.length
        : 0;
    });

    return { total: total, errors: errorsCount, success: successCount, avgDuration: avgDuration, byApi: byApi };
  }, [data]);

  var chartData = useMemo(function () {
    var labels = [];
    var callsPerDay = [];
    var now = new Date();

    for (var i = 6; i >= 0; i--) {
      var d = new Date(now);
      d.setDate(d.getDate() - i);
      var key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      labels.push(key);
      var count = data.filter(function (r) {
        var rowDate = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return rowDate === key;
      }).length;
      callsPerDay.push(count);
    }

    return {
      labels: labels,
      datasets: [{
        label: 'API Calls',
        data: callsPerDay,
        borderColor: '#1677ff',
        backgroundColor: 'rgba(22, 119, 255, 0.1)',
        tension: 0.3,
        fill: true,
      }],
    };
  }, [data]);

  var tableData = useMemo(function () {
    return Object.entries(stats.byApi).map(function (entry) {
      var name = entry[0];
      var s = entry[1];
      var limit = DAILY_LIMITS[name];
      var pctUsed = limit ? ((s.total / limit) * 100).toFixed(1) : null;
      return {
        key: name,
        name: API_LABELS[name] || name,
        total: s.total,
        errors: s.errors,
        successRate: s.total > 0 ? (((s.total - s.errors) / s.total) * 100).toFixed(1) + '%' : '-',
        avgMs: Math.round(s.avgMs) + 'ms',
        limit: limit,
        pctUsed: pctUsed ? pctUsed + '%' : '-',
        warning: pctUsed && parseFloat(pctUsed) >= 80,
      };
    });
  }, [stats.byApi]);

  if (loading) {
    return React.createElement('div', { style: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      React.createElement(Spin, { size: 'large', tip: 'Loading API usage data...' })
    );
  }

  if (error) {
    return React.createElement('div', { style: { padding: 24 } },
      React.createElement(Card, null,
        React.createElement(Title, { level: 4, style: { color: '#ef4444' } },
          React.createElement(WarningOutlined, { style: { marginRight: 8 } }),
          'Failed to load API usage data'
        ),
        React.createElement('p', { style: { color: '#94a3b8' } }, error)
      )
    );
  }

  var columns = [
    {
      title: 'API', dataIndex: 'name', key: 'name',
      render: function (t, r) {
        return React.createElement('span', null,
          r.warning && React.createElement(WarningOutlined, { style: { color: '#f59e0b', marginRight: 6 } }),
          t
        );
      }
    },
    { title: 'Calls', dataIndex: 'total', key: 'total' },
    { title: 'Success Rate', dataIndex: 'successRate', key: 'successRate' },
    {
      title: 'Errors', dataIndex: 'errors', key: 'errors',
      render: function (v) {
        return React.createElement('span', { style: { color: v > 0 ? '#ef4444' : '#22c55e' } }, v);
      }
    },
    { title: 'Avg Latency', dataIndex: 'avgMs', key: 'avgMs' },
    {
      title: 'Daily Limit', key: 'limit',
      render: function (_, r) {
        if (!r.limit) return '-';
        return React.createElement('span', null,
          r.total + '/' + r.limit,
          React.createElement(Tag, { color: r.warning ? 'orange' : 'default', style: { marginLeft: 8 } }, r.pctUsed)
        );
      },
    },
  ];

  return React.createElement('div', { style: { padding: '0 0 24px' } },
    React.createElement('div', { style: { marginBottom: 24 } },
      React.createElement(Title, { level: 3, style: { marginBottom: 4 } },
        React.createElement(ApiOutlined, { style: { marginRight: 8 } }),
        'API Usage Monitor'
      ),
      React.createElement('span', { style: { color: '#94a3b8', fontSize: 13 } },
        'Third-party API call tracking & free tier limit alerts'
      )
    ),
    React.createElement(Row, { gutter: 16, style: { marginBottom: 24 } },
      React.createElement(Col, { span: 6 },
        React.createElement(Card, { bordered: false, hoverable: true },
          React.createElement(Statistic, {
            title: 'Total API Calls', value: stats.total,
            prefix: React.createElement(ThunderboltOutlined),
            valueStyle: { color: '#1677ff', fontWeight: 'bold' },
          })
        )
      ),
      React.createElement(Col, { span: 6 },
        React.createElement(Card, { bordered: false, hoverable: true },
          React.createElement(Statistic, {
            title: 'Success Rate',
            value: stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : 0,
            suffix: '%',
            prefix: React.createElement(CheckCircleOutlined),
            valueStyle: { color: '#22c55e', fontWeight: 'bold' },
          })
        )
      ),
      React.createElement(Col, { span: 6 },
        React.createElement(Card, { bordered: false, hoverable: true },
          React.createElement(Statistic, {
            title: 'Errors', value: stats.errors,
            prefix: React.createElement(WarningOutlined),
            valueStyle: { color: stats.errors > 0 ? '#ef4444' : '#22c55e', fontWeight: 'bold' },
          })
        )
      ),
      React.createElement(Col, { span: 6 },
        React.createElement(Card, { bordered: false, hoverable: true },
          React.createElement(Statistic, {
            title: 'Avg Latency', value: Math.round(stats.avgDuration), suffix: 'ms',
            prefix: React.createElement(ClockCircleOutlined),
            valueStyle: { color: '#1677ff', fontWeight: 'bold' },
          })
        )
      )
    ),
    React.createElement(Row, { gutter: 16, style: { marginBottom: 24 } },
      React.createElement(Col, { span: 24 },
        React.createElement(Card, { title: '7-Day API Call Volume', bordered: false },
          React.createElement('div', { style: { height: 280 } },
            React.createElement(Line, {
              data: chartData,
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
              },
            })
          )
        )
      )
    ),
    React.createElement(Card, { title: 'Per-API Breakdown', bordered: false },
      React.createElement(Table, {
        dataSource: tableData, columns: columns, pagination: false, size: 'middle',
        locale: { emptyText: 'No API calls recorded yet.' },
      })
    )
  );
}
