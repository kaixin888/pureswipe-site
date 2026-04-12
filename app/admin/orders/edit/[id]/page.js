'use client';

import React from 'react';
import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select, InputNumber } from 'antd';

export default function OrderEdit() {
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: 'orders',
    redirect: 'list',
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Order ID" name="order_id">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Customer Name" name="customer_name">
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input />
        </Form.Item>
        <Form.Item label="Phone" name="phone">
          <Input />
        </Form.Item>
        <Form.Item label="Status" name="status">
          <Select
            options={[
              { label: 'Paid', value: 'Paid' },
              { label: 'Processing', value: 'Processing' },
              { label: 'Shipped', value: 'Shipped' },
              { label: 'Delivered', value: 'Delivered' },
              { label: 'Cancelled', value: 'Cancelled' },
            ]}
          />
        </Form.Item>
        <Form.Item label="Tracking Number" name="tracking_number">
          <Input placeholder="Enter carrier tracking number" />
        </Form.Item>
        <Form.Item label="Amount" name="amount">
          <InputNumber prefix="$" />
        </Form.Item>
        <Form.Item label="Shipping Address" name="shipping_address">
          <Input.TextArea />
        </Form.Item>
        <Form.Item label="City" name="shipping_city">
          <Input />
        </Form.Item>
        <Form.Item label="State" name="shipping_state">
          <Input />
        </Form.Item>
        <Form.Item label="Zip Code" name="shipping_zip">
          <Input />
        </Form.Item>
      </Form>
    </Edit>
  );
}
