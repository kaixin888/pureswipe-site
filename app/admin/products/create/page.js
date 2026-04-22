'use client';

import React, { useState } from 'react';
import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select, InputNumber, Upload, Button, message, Card, Divider, Space, Typography } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function ProductCreate() {
  const { formProps, saveButtonProps, form } = useForm({
    resource: 'products',
    redirect: 'list',
  });

  const [uploading, setUploading] = useState(false);
  const [mainPreview, setMainPreview] = useState('');
  const [extraImages, setExtraImages] = useState([]);
  const [bullets, setBullets] = useState(['']);
  const [descLen, setDescLen] = useState(0);
  const [seoDescLen, setSeoDescLen] = useState(0);
  const [extraUploading, setExtraUploading] = useState(false);

  const syncExtraImages = (imgs) => {
    setExtraImages(imgs);
    form.setFieldValue('extra_images', JSON.stringify(imgs));
  };

  const syncBullets = (bts) => {
    setBullets(bts);
    form.setFieldValue('bullets', JSON.stringify(bts.filter(b => b.trim())));
  };

  const handleMainUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      form.setFieldValue('image_url', data.url);
      setMainPreview(data.url);
      onSuccess(data.url);
      message.success(`Main image uploaded — saved ${data.savings ?? 0}% (WebP)`);
    } catch (err) {
      message.error('Upload failed: ' + err.message);
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  const handleExtraUpload = async ({ file, onSuccess, onError }) => {
    if (extraImages.length >= 8) { message.warning('Max 8 extra images'); onError(new Error('max')); return; }
    setExtraUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      syncExtraImages([...extraImages, data.url]);
      onSuccess(data.url);
      message.success('Extra image uploaded');
    } catch (err) {
      message.error('Upload failed: ' + err.message);
      onError(err);
    } finally {
      setExtraUploading(false);
    }
  };

  const removeExtraImage = (idx) => syncExtraImages(extraImages.filter((_, i) => i !== idx));
  const moveExtraImage = (idx, dir) => {
    const imgs = [...extraImages];
    const target = idx + dir;
    if (target < 0 || target >= imgs.length) return;
    [imgs[idx], imgs[target]] = [imgs[target], imgs[idx]];
    syncExtraImages(imgs);
  };

  const addBullet = () => { if (bullets.length < 6) setBullets([...bullets, '']); };
  const updateBullet = (idx, val) => {
    const bts = [...bullets];
    bts[idx] = val;
    syncBullets(bts);
  };
  const removeBullet = (idx) => syncBullets(bullets.filter((_, i) => i !== idx));

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} form={form} layout="vertical">

        {/* ── Block 1: Basic Information ── */}
        <Card title="Basic Information" style={{ marginBottom: 16 }}>
          <Form.Item label="Product Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="Enter product name" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item label="Price (USD)" name="price" rules={[{ required: true }]}>
              <InputNumber prefix="$" min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Stock" name="stock" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Status" name="status" initialValue="active">
              <Select options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]} />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item label="Tag" name="tag">
              <Input placeholder="e.g. bestseller, new, sale" />
            </Form.Item>
            <Form.Item label="Rating" name="rating">
              <InputNumber min={1} max={5} step={0.1} style={{ width: '100%' }} placeholder="4.8" />
            </Form.Item>
          </div>
          <Form.Item label="ASIN" name="asin">
            <Input placeholder="Amazon ASIN (optional)" />
          </Form.Item>
        </Card>

        {/* ── Block 2: Images ── */}
        <Card title="Images" style={{ marginBottom: 16 }}>
          <Text strong>Main Image ★</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '12px 0 20px' }}>
            {mainPreview && (
              <img
                src={mainPreview}
                alt="main"
                style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 6, border: '1px solid #d9d9d9' }}
              />
            )}
            <Upload customRequest={handleMainUpload} showUploadList={false} accept="image/*">
              <Button icon={<UploadOutlined />} loading={uploading}>
                {uploading ? 'Uploading...' : 'Upload Main Image'}
              </Button>
            </Upload>
          </div>
          <Form.Item label="Main Image URL" name="image_url">
            <Input placeholder="Auto-filled after upload, or paste URL" />
          </Form.Item>

          <Divider />

          <Text strong>Additional Images (max 8)</Text>
          <Form.Item name="extra_images" hidden><Input /></Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
            {extraImages.map((url, idx) => (
              <div key={idx} style={{ position: 'relative', border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
                <img src={url} alt={`extra-${idx}`} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
                  <Button size="small" icon={<ArrowUpOutlined />} onClick={() => moveExtraImage(idx, -1)} disabled={idx === 0} />
                  <Button size="small" icon={<ArrowDownOutlined />} onClick={() => moveExtraImage(idx, 1)} disabled={idx === extraImages.length - 1} />
                  <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeExtraImage(idx)} />
                </div>
              </div>
            ))}
            {extraImages.length < 8 && (
              <Upload customRequest={handleExtraUpload} showUploadList={false} accept="image/*">
                <div style={{
                  border: '2px dashed #d9d9d9', borderRadius: 6, aspectRatio: '1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#8c8c8c', fontSize: 24, minHeight: 80
                }}>
                  {extraUploading ? '...' : <PlusOutlined />}
                </div>
              </Upload>
            )}
          </div>
        </Card>

        {/* ── Block 3: Bullet Points ── */}
        <Card title="Product Details — Bullet Points" style={{ marginBottom: 16 }}>
          <Form.Item name="bullets" hidden><Input /></Form.Item>
          <Space direction="vertical" style={{ width: '100%' }}>
            {bullets.map((b, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Input
                  value={b}
                  placeholder="e.g. Touch-free design"
                  onChange={e => updateBullet(idx, e.target.value)}
                  prefix={<Text type="secondary" style={{ fontSize: 12 }}>{idx + 1}.</Text>}
                />
                <Button danger icon={<DeleteOutlined />} onClick={() => removeBullet(idx)} disabled={bullets.length === 1} />
              </div>
            ))}
          </Space>
          {bullets.length < 6 && (
            <Button type="dashed" icon={<PlusOutlined />} onClick={addBullet} style={{ marginTop: 12, width: '100%' }}>
              Add bullet point
            </Button>
          )}
          <Text type="secondary" style={{ fontSize: 12, marginTop: 6, display: 'block' }}>
            {bullets.filter(b => b.trim()).length} / 6 bullet points
          </Text>
        </Card>

        {/* ── Block 4: Description ── */}
        <Card title="Description" style={{ marginBottom: 16 }}>
          <Form.Item name="description">
            <Input.TextArea
              rows={6}
              maxLength={2000}
              onChange={e => setDescLen(e.target.value.length)}
              placeholder="Full product description..."
            />
          </Form.Item>
          <Text type="secondary" style={{ float: 'right', fontSize: 12 }}>{descLen} / 2000</Text>
        </Card>

        {/* ── Block 5: SEO Settings ── */}
        <Card title="SEO Settings" style={{ marginBottom: 16 }}>
          <Form.Item label="SEO Title" name="seo_title">
            <Input placeholder="Leave blank to use product name" maxLength={70} />
          </Form.Item>
          <Form.Item label="SEO Description" name="seo_description">
            <Input.TextArea
              rows={4}
              maxLength={160}
              onChange={e => setSeoDescLen(e.target.value.length)}
              placeholder="Meta description for Google search results (max 160 chars)"
            />
          </Form.Item>
          <Text type="secondary" style={{ float: 'right', fontSize: 12 }}>{seoDescLen} / 160</Text>
        </Card>

      </Form>
    </Create>
  );
}
