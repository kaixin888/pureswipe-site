'use client';

import React from 'react';
import {
  List,
  useTable,
  EditButton,
  ShowButton,
  ExportButton,
} from '@refinedev/antd';
import { Table, Space, Tag } from 'antd';

export default function OrderList() {
  const { tableProps } = useTable({
    resource: 'orders',
    sorters: {
      initial: [{ field: 'created_at', order: 'desc' }],
    },
  });

  // 映射物流导出字段 (匹配 PM 定义的 USPS/FedEx 标准)
  const mapExportData = (data) => {
    return data.map((item) => ({
      'Recipient Name': item.customer_name || '',
      'Shipping Address 1': item.shipping_address || '',
      'Shipping Address 2': '', 
      'City': item.shipping_city || '',
      'State': item.shipping_state?.substring(0, 2).toUpperCase() || '',
      'Zip Code': item.shipping_zip || '',
      'Country': 'USA',
      'Phone Number': item.phone || '',
      'Product SKU': item.product_name || '',
      'Quantity': 1,
      'Order ID': item.order_id || '',
      'Order Date': item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
      'Internal Notes': item.status === 'Paid' ? 'Priority' : '',
    }));
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
          render={(_, record) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
