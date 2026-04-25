'use client';

import { useCreate, useList, useGo } from '@refinedev/core';
import { Button, Form, Input, InputNumber, Select, Switch, message } from 'antd';
import { ArrowLeft } from 'lucide-react';

export default function ReviewCreatePage() {
  const [form] = Form.useForm();
  const go = useGo();

  const { data: productsData } = useList({ resource: 'products', pagination: { pageSize: 100 } });
  const products = productsData?.data || [];

  const { mutate: createReview, isLoading } = useCreate();

  function onFinish(values) {
    createReview(
      { resource: 'reviews', values: { ...values, is_published: values.is_published ?? true } },
      {
        onSuccess: () => {
          message.success('Review added!');
          go({ to: '/admin/reviews' });
        },
        onError: () => message.error('Failed to add review'),
      }
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <Button
        icon={<ArrowLeft size={14} />}
        style={{ marginBottom: 20 }}
        onClick={() => go({ to: '/admin/reviews' })}
      >
        Back to Reviews
      </Button>
      <h2 style={{ fontWeight: 900, fontSize: 20, marginBottom: 24 }}>Add Review</h2>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ rating: 5, is_published: true }}>
        <Form.Item name="author_name" label="Author Name" rules={[{ required: true }]}>
          <Input placeholder="e.g. Sarah J." />
        </Form.Item>
        <Form.Item name="author_location" label="Location">
          <Input placeholder="e.g. Houston, TX" />
        </Form.Item>
        <Form.Item name="rating" label="Rating" rules={[{ required: true }]}>
          <InputNumber min={1} max={5} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="content" label="Review Content" rules={[{ required: true }]}>
          <Input.TextArea rows={5} placeholder="Review text..." />
        </Form.Item>
        <Form.Item name="image_url" label="Customer Photo URL (optional)">
          <Input placeholder="https://..." />
        </Form.Item>
        <Form.Item name="video_url" label="Video Review URL (optional, MP4/WebM)">
          <Input placeholder="https://media.clowand.com/videos/..." />
        </Form.Item>
        <Form.Item name="video_poster_url" label="Video Cover Image URL (optional)">
          <Input placeholder="https://media.clowand.com/videos/poster/..." />
        </Form.Item>
        <Form.Item name="product_id" label="Product (optional)">
          <Select allowClear placeholder="Select product">
            {products.map(p => (
              <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="is_published" label="Published" valuePropName="checked">
          <Switch defaultChecked />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            Save Review
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
