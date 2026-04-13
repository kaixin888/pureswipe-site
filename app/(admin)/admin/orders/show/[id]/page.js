'use client';

import React from 'react';
import { useShow } from '@refinedev/core';
import { Show, TextField, TagField, NumberField, EmailField } from '@refinedev/antd';
import { Typography, Tag, Space, Descriptions, Divider } from 'antd';

const { Title, Text } = Typography;

export default function OrderShow() {
  const { queryResult } = useShow({
    resource: 'orders',
  });
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={4}>Order Details: {record?.order_id}</Title>
      
      <Divider />

      <Descriptions bordered column={2} size="middle">
        <Descriptions.Item label="Customer">
          <TextField value={record?.customer_name} />
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          <EmailField value={record?.email} />
        </Descriptions.Item>
        <Descriptions.Item label="Phone">
          <TextField value={record?.phone} />
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color="blue">{record?.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Product">
          <TextField value={record?.product_name} />
        </Descriptions.Item>
        <Descriptions.Item label="Total Amount">
          <NumberField value={record?.amount} options={{ style: "currency", currency: "USD" }} />
        </Descriptions.Item>
        <Descriptions.Item label="Tracking Number">
          <TextField value={record?.tracking_number || "Not available"} />
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          <Text>{record?.created_at ? new Date(record.created_at).toLocaleString() : 'N/A'}</Text>
        </Descriptions.Item>
      </Descriptions>

      <Title level={5} style={{ marginTop: '24px' }}>Shipping Information</Title>
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Full Address">
          <TextField value={record?.shipping_address} />
        </Descriptions.Item>
        <Descriptions.Item label="City">
          <TextField value={record?.shipping_city} />
        </Descriptions.Item>
        <Descriptions.Item label="State">
          <TextField value={record?.shipping_state} />
        </Descriptions.Item>
        <Descriptions.Item label="Zip Code">
          <TextField value={record?.shipping_zip} />
        </Descriptions.Item>
        <Descriptions.Item label="Country">
          <TextField value={record?.shipping_country} />
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
}
