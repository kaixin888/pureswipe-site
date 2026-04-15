'use client';

import React, { useState } from 'react';
import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select, InputNumber, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

export default function ProductCreate() {
  const { formProps, saveButtonProps, form } = useForm({
    resource: 'products',
    redirect: 'list',
  });

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  // Upload file to Cloudflare R2 via server-side API route
  const handleUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      form.setFieldValue('image_url', data.url);
      setPreviewUrl(data.url);
      onSuccess(data.url);
      message.success(`Uploaded to R2 — saved ${data.savings ?? 0}% (compressed to WebP)`);
    } catch (err) {
      message.error('Upload failed: ' + err.message);
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} form={form} layout="vertical">
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

        <Form.Item label="Product Image">
          <Upload customRequest={handleUpload} showUploadList={false} accept="image/*">
            <Button icon={<UploadOutlined />} loading={uploading}>
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </Upload>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="preview"
              style={{ marginTop: 12, width: 120, height: 120, objectFit: 'cover', borderRadius: 6, border: '1px solid #d9d9d9' }}
            />
          )}
        </Form.Item>

        <Form.Item label="Image URL (auto-filled after upload)" name="image_url">
          <Input placeholder="Auto-filled after upload, or paste URL manually" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Create>
  );
}
