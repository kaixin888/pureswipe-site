'use client';

import React, { useState } from 'react';
import {
  List,
  useTable,
  EditButton,
  ShowButton,
  ExportButton,
} from '@refinedev/antd';
import { Table, Space, Tag, Button, Tooltip, message } from 'antd';
import { MailOutlined, CheckCircleOutlined } from '@ant-design/icons';

export default function OrderList() {
  const { tableProps } = useTable({
    resource: 'orders',
    sorters: {
      initial: [{ field: 'created_at', order: 'desc' }],
    },
  });

  const [sentIds, setSentIds] = useState({});
  const [loadingIds, setLoadingIds] = useState({});

  const mapExportData = (data) => {
    return data.map((item) => ({
      'Recipient Name': item.customer_name || '',
      'Shipping Address 1': item.shipping_address || '',
      'Shipping Address 2': '',
      'City': item.shipping_city || '',
      'State': item.shipping_state?.substring(0, 2).toUpperCase() || '',
      'Zip Code': item.shipping_zip ? `="\t${item.shipping_zip}"` : '',
      'Country': 'USA',
      'Phone Number': item.phone || '',
      'Product SKU': item.product_name || '',
      'Quantity': 1,
      'Order ID': item.order_id || '',
      'Order Date': item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
      'Internal Notes': item.status === 'Paid' ? 'Priority' : '',
    }));
  };

  const handleRequestReview = async (record) => {
    if (!record.email) { message.warning('该订单无邮箱地址'); return; }
    setLoadingIds(prev => ({ ...prev, [record.id]: true }));
    try {
      const res = await fetch('/api/send-review-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: record.id, email: record.email, orderData: record }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSentIds(prev => ({ ...prev, [record.id]: true }));
      message.success(`已向 ${record.email} 发送评价请求`);
    } catch (err) {
      message.error('发送失败: ' + err.message);
    } finally {
      setLoadingIds(prev => ({ ...prev, [record.id]: false }));
    }
  };

  // Phase E-4: localized status labels
  const statusLabel = (s) => {
    const map = {
      Pending: '待支付',
      Paid: '已支付',
      Shipped: '已发货',
      Delivered: '已送达',
      Cancelled: '已取消',
      Refunded: '已退款',
    };
    return map[s] || s;
  };

  return (
    <List
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <ExportButton mapData={mapExportData} filename={`clowand_Orders_${new Date().toISOString().split('T')[0]}`} />
        </>
      )}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="order_id" title="订单号" />
        <Table.Column dataIndex="customer_name" title="客户姓名" />
        <Table.Column dataIndex="email" title="邮箱" />
        <Table.Column dataIndex="phone" title="电话" />
        <Table.Column dataIndex="amount" title="金额" render={(v) => `$${v}`} />
        <Table.Column dataIndex="product_name" title="商品" />
        <Table.Column
          dataIndex="status"
          title="状态"
          render={(value) => {
            let color = 'blue';
            if (value === 'Paid') color = 'green';
            if (value === 'Shipped') color = 'orange';
            if (value === 'Delivered') color = 'cyan';
            if (value === 'Cancelled' || value === 'Refunded') color = 'red';
            return <Tag color={color}>{statusLabel(value)}</Tag>;
          }}
        />
        <Table.Column dataIndex="shipping_city" title="城市" />
        <Table.Column dataIndex="shipping_state" title="州" />
        <Table.Column
          title="操作"
          dataIndex="actions"
          render={(_, record) => {
            const alreadySent = sentIds[record.id] || !!record.review_requested_at;
            const isLoading = loadingIds[record.id];
            const canRequest = record.status === 'Shipped' || record.status === 'Delivered';
            return (
              <Space>
                <EditButton hideText size="small" recordItemId={record.id} />
                <ShowButton hideText size="small" recordItemId={record.id} />
                {canRequest && (
                  <Tooltip title={alreadySent ? '评价请求已发送' : '发送评价请求邮件'}>
                    <Button
                      size="small"
                      icon={alreadySent ? <CheckCircleOutlined /> : <MailOutlined />}
                      loading={isLoading}
                      disabled={alreadySent}
                      type={alreadySent ? 'default' : 'primary'}
                      ghost={!alreadySent}
                      onClick={() => handleRequestReview(record)}
                      style={alreadySent ? { color: '#52c41a', borderColor: '#52c41a' } : {}}
                    >
                      {alreadySent ? '已发送' : '邀评'}
                    </Button>
                  </Tooltip>
                )}
              </Space>
            );
          }}
        />
      </Table>
    </List>
  );
}
