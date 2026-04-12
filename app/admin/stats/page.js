'use client';

import React, { useMemo } from 'react';
import { useList } from '@refinedev/core';
import { List } from '@refinedev/antd';
import { Card, Col, Row, Statistic, Table, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, ShoppingCartOutlined, UserOutlined, GlobalOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function Dashboard() {
  const { data: ordersData, isLoading: ordersLoading } = useList({
    resource: 'orders',
  });

  const { data: statsData, isLoading: statsLoading } = useList({
    resource: 'site_stats',
  });

  const stats = useMemo(() => {
    if (!ordersData?.data) return { totalGMV: 0, totalOrders: 0, uniqueCustomers: 0, avgOrderValue: 0, conversionRate: 0 };
    
    const orders = ordersData.data;
    const totalGMV = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map(o => o.email)).size;
    const avgOrderValue = totalOrders > 0 ? (totalGMV / totalOrders).toFixed(2) : 0;
    
    // 假设访客数通过 site_stats 表统计
    const visitors = statsData?.total || 1250; 
    const conversionRate = visitors > 0 ? ((totalOrders / visitors) * 100).toFixed(2) : 0;

    return { totalGMV, totalOrders, uniqueCustomers, avgOrderValue, visitors, conversionRate };
  }, [ordersData, statsData]);

  return (
    <List title="Data Insights">
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

      <Title level={4} style={{ marginTop: '32px' }}>7-Day Sales Performance (Placeholder)</Title>
      <div style={{ height: '300px', background: '#fafafa', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCenter: 'center', border: '1px dashed #d9d9d9' }}>
        <p style={{ color: '#8c8c8c' }}>Chart.js Visualization will be implemented tomorrow for Phase 2.</p>
      </div>
    </List>
  );
}
