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

  // Track which order IDs have had review requests sent this session
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
    if (!record.email) { message.warning('No email on record'); return; }
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
      message.success(`Review request sent to ${record.email}`);
    } catch (err) {
      message.error('Send failed: ' + err.message);
    } finally {
      setLoadingIds(prev => ({ ...prev, [record.id]: false }));
    }
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
        <Table.Column dataIndex="order_id" title="Order ID" />
        <Table.Column dataIndex="customer_name" title="Customer" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column dataIndex="phone" title="Phone" />
        <Table.Column dataIndex="amount" title="Amount" render={(v) => `$${v}`} />
        <Table.Column dataIndex="product_name" title="Product" />
        <Table.Column
          dataIndex="status"
          title="Status"
          render={(value) => {
            let color = 'blue';
            if (value === 'Paid') color = 'green';
            if (value === 'Shipped') color = 'orange';
            if (value === 'Delivered') color = 'cyan';
            return <Tag color={color}>{value}</Tag>;
          }}
        />
        <Table.Column dataIndex="shipping_city" title="City" />
        <Table.Column dataIndex="shipping_state" title="State" />
        <Table.Column
          title="Actions"
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
                  <Tooltip title={alreadySent ? 'Review request already sent' : 'Send review request email'}>
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
                      {alreadySent ? 'Sent' : 'Review'}
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
