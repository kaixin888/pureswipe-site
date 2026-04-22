'use client';

import React from 'react';
import { Create, useForm } from '@refinedev/antd';
import { Form, Input, InputNumber, Switch } from 'antd';

export default function DiscountCreate() {
  const { formProps, saveButtonProps } = useForm({ resource: 'discount_codes', redirect: 'list' });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Discount Code" name="code" rules={[{ required: true }]}
          normalize={(v) => v?.toUpperCase().trim()}>
          <Input placeholder="e.g. CLOWAND10" style={{ fontWeight: 700, letterSpacing: 2 }} />
        </Form.Item>
        <Form.Item label="Discount %" name="discount_percent" rules={[{ required: true }]}>
          <InputNumber min={1} max={100} suffix="%" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Max Usage (leave blank = unlimited)" name="max_usage">
          <InputNumber min={1} style={{ width: '100%' }} placeholder="Unlimited" />
        </Form.Item>
        <Form.Item label="Active" name="is_active" valuePropName="checked" initialValue={true}>
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
}
