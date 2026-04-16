'use client';

import { useOne, useUpdate, useGo } from '@refinedev/core';
import { Button, Form, Input, InputNumber, Switch, message, Spin } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function FaqEditPage() {
  const { id } = useParams();
  const [form] = Form.useForm();
  const go = useGo();

  const { data, isLoading } = useOne({ resource: 'faqs', id });
  const { mutate: updateFaq, isLoading: isSaving } = useUpdate();

  useEffect(() => {
    if (data?.data) form.setFieldsValue(data.data);
  }, [data]);

  function onFinish(values) {
    updateFaq(
      { resource: 'faqs', id, values },
      {
        onSuccess: () => { message.success('Updated!'); go({ to: '/admin/faqs' }); },
        onError: () => message.error('Failed to update'),
      }
    );
  }

  if (isLoading) return <div style={{ padding: 40 }}><Spin /></div>;

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <Button icon={<ArrowLeft size={14} />} style={{ marginBottom: 20 }} onClick={() => go({ to: '/admin/faqs' })}>
        Back
      </Button>
      <h2 style={{ fontWeight: 900, fontSize: 20, marginBottom: 24 }}>Edit FAQ</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="question" label="Question" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="answer" label="Answer" rules={[{ required: true }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="sort_order" label="Sort Order">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="is_published" label="Published" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isSaving} block>Save Changes</Button>
        </Form.Item>
      </Form>
    </div>
  );
}
