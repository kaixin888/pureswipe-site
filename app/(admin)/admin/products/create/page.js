'use client';

import React from 'react';
import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select, InputNumber } from 'antd';

export default function ProductCreate() {
  const { formProps, saveButtonProps } = useForm({
    resource: 'products',
    redirect: 'list',
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Product Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="Enter product name" />
        </Form.Item>
        <Form.Item label="Price" name="price" rules={[{ required: true }]}>
          <InputNumber prefix="$" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Stock" name="stock" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Status" name="status" initialValue="active">
          <Select
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />
        </Form.Item>
        <Form.Item label="Image URL" name="image_url">
          <Input placeholder="Enter public image URL" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Create>
  );
}
