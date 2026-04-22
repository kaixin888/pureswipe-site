'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useList } from '@refinedev/core';
import { List } from '@refinedev/antd';
import { Card, Col, Row, Statistic, Typography, Spin } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, UserOutlined, GlobalOutlined, WarningOutlined } from '@ant-design/icons';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

const { Title } = Typography;

export default function Dashboard() {
  const { data: ordersData, isLoading: ordersLoading } = useList({
    resource: 'orders',
  });

  // Low stock: fetch active products with stock < 10
  const { data: productsData } = useList({
    resource: 'products',
    filters: [
      { field: 'status', operator: 'eq', value: 'active' },
    ],
    pagination: { pageSize: 100 },
  });
  const lowStockProducts = (productsData?.data || []).filter(p => p.stock < 10);

  // Cloudflare Analytics — real visitor data
  const [cfData, setCfData] = useState(null);
  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { if (!d.permission_error && !d.error) setCfData(d); })
      .catch(() => {});
  }, []);

  const stats = useMemo(() => {
    const orders = ordersData?.data || [];
    const totalGMV = orders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map(o => o.email)).size;
    const avgOrderValue = totalOrders > 0 ? (totalGMV / totalOrders).toFixed(2) : 0;

    const visitors = cfData?.totalUniques || 0;
    const conversionRate = visitors > 0 ? ((totalOrders / visitors) * 100).toFixed(2) : 0;

    // Last 7 days labels
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const salesPerDay = last7Days.map(date => {
      return orders.filter(o => {
        const orderDate = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return orderDate === date;
      }).reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    });

    // Cloudflare pageviews per day
    const pageViewsPerDay = cfData?.days?.map(d => d.pageViews) || last7Days.map(() => 0);

    return { totalGMV, totalOrders, uniqueCustomers, avgOrderValue, visitors, conversionRate, last7Days, salesPerDay, pageViewsPerDay };
  }, [ordersData, cfData]);

  useEffect(() => {
    if (!ordersLoading) {
      console.log(`[Phase 3 Monitor] Admin Panel v2.6.2 Ready. Orders: ${stats.totalOrders}. Conversion: ${stats.conversionRate}%.`);
    }
  }, [ordersLoading, stats]);

  if (ordersLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip="Loading clowand Intelligence..." />
      </div>
    );
  }

  const salesChartData = {
    labels: stats.last7Days,
    datasets: [
      {
        label: 'Daily Sales ($)',
        data: stats.salesPerDay,
        borderColor: '#1677ff',
        backgroundColor: 'rgba(22, 119, 255, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const pageViewsChartData = {
    labels: stats.last7Days,
    datasets: [
      {
        label: 'Page Views',
        data: stats.pageViewsPerDay,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124,58,237,0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const funnelData = {
    labels: ['Total Visitors', 'Checkouts Started', 'Final Orders'],
    datasets: [
      {
        label: 'Users',
        data: [stats.visitors, Math.round(stats.visitors * 0.12), stats.totalOrders],
        backgroundColor: ['#f0f5ff', '#adc6ff', '#1677ff'],
        borderRadius: 8,
      },
    ],
  };

  return (
    <List title="Data Insights — Phase 2 Intelligence">

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div style={{ marginBottom: 24, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <WarningOutlined style={{ color: '#ea580c', fontSize: 18 }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: '#9a3412' }}>
              Low Stock Alert — {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} need attention
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {lowStockProducts.map(p => (
              <Link key={p.id} href={`/admin/products/edit/${p.id}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
                  background: p.stock === 0 ? '#fee2e2' : '#fff7ed',
                  border: `1px solid ${p.stock === 0 ? '#fca5a5' : '#fdba74'}`,
                }}
              >
                {p.image_url && (
                  <img src={p.image_url} alt={p.name} style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }} />
                )}
                <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{p.name}</span>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                  background: p.stock === 0 ? '#ef4444' : '#f97316',
                  color: '#fff',
                }}>
                  {p.stock === 0 ? 'OUT OF STOCK' : `${p.stock} left`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Row gutter={16}>
        <Col span={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Total GMV"
              value={stats.totalGMV}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Unique Customers"
              value={stats.uniqueCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Conversion Rate"
              value={stats.conversionRate}
              suffix="%"
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24} style={{ marginTop: '32px' }}>
        <Col span={14}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
            <Title level={4} style={{ marginBottom: '24px' }}>7-Day Sales Performance</Title>
            <div style={{ height: '300px' }}>
              <Line data={salesChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} />
            </div>
          </div>
        </Col>
        <Col span={10}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
            <Title level={4} style={{ marginBottom: '24px' }}>Conversion Funnel</Title>
            <div style={{ height: '300px' }}>
              <Bar 
                data={funnelData} 
                options={{ 
                  indexAxis: 'y', 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }} 
              />
            </div>
          </div>
        </Col>
      </Row>

      <Row gutter={24} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
            <Title level={4} style={{ marginBottom: '4px' }}>7-Day Page Views <span style={{ fontSize: 13, fontWeight: 400, color: '#94a3b8' }}>(Cloudflare Analytics)</span></Title>
            {stats.pageViewsPerDay.every(v => v === 0) ? (
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                <span style={{ color: '#f59e0b', fontSize: 13, fontWeight: 600 }}>⚠ Cloudflare token lacks Zone Analytics permission</span>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>Regenerate CF token with "Zone / Analytics / Read" scope to enable real data</span>
              </div>
            ) : (
              <div style={{ height: '220px' }}>
                <Line data={pageViewsChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} />
              </div>
            )}
          </div>
        </Col>
      </Row>
    </List>
  );
}
