'use client';

import { useCreate, useGo } from '@refinedev/core';
import { Button, Form, Input, InputNumber, Switch, message } from 'antd';
import { ArrowLeft } from 'lucide-react';

export default function FaqCreatePage() {
  const [form] = Form.useForm();
  const go = useGo();
  const { mutate: createFaq, isLoading } = useCreate();

  function onFinish(values) {
    createFaq(
      { resource: 'faqs', values: { ...values, is_published: values.is_published ?? true } },
      {
        onSuccess: () => { message.success('FAQ added!'); go({ to: '/admin/faqs' }); },
        onError: () => message.error('Failed to add FAQ'),
      }
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <Button icon={<ArrowLeft size={14} />} style={{ marginBottom: 20 }} onClick={() => go({ to: '/admin/faqs' })}>
        Back
      </Button>
      <h2 style={{ fontWeight: 900, fontSize: 20, marginBottom: 24 }}>Add FAQ</h2>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ sort_order: 0, is_published: true }}>
        <Form.Item name="question" label="Question" rules={[{ required: true }]}>
          <Input placeholder="e.g. How does free shipping work?" />
        </Form.Item>
        <Form.Item name="answer" label="Answer" rules={[{ required: true }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="sort_order" label="Sort Order (lower = first)">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="is_published" label="Published" valuePropName="checked">
          <Switch defaultChecked />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} block>Save</Button>
        </Form.Item>
      </Form>
    </div>
  );
}
