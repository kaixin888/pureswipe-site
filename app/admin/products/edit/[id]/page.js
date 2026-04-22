'use client';

import React, { useState, useEffect } from 'react';
import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select, InputNumber, Upload, Button, message, Card, Divider, Space, Typography } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, InboxOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Dragger } = Upload;

export default function ProductEdit() {
  const { formProps, saveButtonProps, form, queryResult } = useForm({
    resource: 'products',
    redirect: 'list',
  });

  const productData = queryResult?.data?.data;

  const [uploading, setUploading] = useState(false);
  const [mainPreview, setMainPreview] = useState('');
  const [extraImages, setExtraImages] = useState([]);
  const [bullets, setBullets] = useState(['']);
  const [descLen, setDescLen] = useState(0);
  const [seoDescLen, setSeoDescLen] = useState(0);
  const [extraUploading, setExtraUploading] = useState(false);

  // Sync initial data from Supabase
  useEffect(() => {
    if (productData) {
      if (productData.extra_images) {
        try {
          const parsed = typeof productData.extra_images === 'string' ? JSON.parse(productData.extra_images) : productData.extra_images;
          if (Array.isArray(parsed)) setExtraImages(parsed);
        } catch (err) {
          console.error("Failed to parse extra_images:", err);
        }
      }
      if (productData.bullets) {
        try {
          const parsed = typeof productData.bullets === 'string' ? JSON.parse(productData.bullets) : productData.bullets;
          if (Array.isArray(parsed)) setBullets(parsed);
        } catch (err) {
          console.error("Failed to parse bullets:", err);
        }
      }
      if (productData.description) setDescLen(productData.description.length);
      if (productData.seo_description) setSeoDescLen(productData.seo_description.length);
      if (productData.image_url) setMainPreview(productData.image_url);
    }
  }, [productData]);

  // Sync state from form values when form loads
  const onFormValuesChange = (_, allValues) => {
    if (allValues.extra_images && typeof allValues.extra_images === 'string') {
      try {
        const parsed = JSON.parse(allValues.extra_images);
        if (Array.isArray(parsed) && extraImages.length === 0) setExtraImages(parsed);
      } catch {}
    }
    if (allValues.bullets && typeof allValues.bullets === 'string') {
      try {
        const parsed = JSON.parse(allValues.bullets);
        if (Array.isArray(parsed) && bullets.length === 1 && bullets[0] === '') setBullets(parsed);
      } catch {}
    }
    if (allValues.description) setDescLen(allValues.description.length);
    if (allValues.seo_description) setSeoDescLen(allValues.seo_description.length);
  };

  // Sync extra_images + bullets JSON into hidden form fields on change
  const syncExtraImages = (imgs) => {
    setExtraImages(imgs);
    form.setFieldValue('extra_images', JSON.stringify(imgs));
  };

  const syncBullets = (bts) => {
    setBullets(bts);
    form.setFieldValue('bullets', JSON.stringify(bts.filter(b => b.trim())));
  };

  // Upload main image
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

  // Upload extra image
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
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} form={form} layout="vertical" onValuesChange={onFormValuesChange}>

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
            <Form.Item label="Status" name="status">
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
          {/* Main image */}
          <Text strong>Main Image ★ (Drag & Drop or Click)</Text>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, margin: '12px 0 20px' }}>
            {(mainPreview || form.getFieldValue('image_url')) && (
              <img
                src={mainPreview || form.getFieldValue('image_url')}
                alt="main"
                style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 6, border: '1px solid #d9d9d9', flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Dragger
                customRequest={handleMainUpload}
                showUploadList={false}
                accept="image/*"
                multiple={false}
                disabled={uploading}
                style={{ padding: '12px 0' }}
              >
                <p className="ant-upload-drag-icon" style={{ marginBottom: 6 }}>
                  <InboxOutlined style={{ fontSize: 32, color: uploading ? '#999' : '#1677ff' }} />
                </p>
                <p className="ant-upload-text" style={{ fontSize: 13, marginBottom: 4 }}>
                  {uploading ? 'Uploading to Cloudflare R2...' : 'Drop new image to replace, or click to browse'}
                </p>
                <p className="ant-upload-hint" style={{ fontSize: 12, color: '#8c8c8c' }}>
                  JPG / PNG / WebP / GIF — auto-compressed to WebP, uploaded to Cloudflare R2
                </p>
              </Dragger>
            </div>
          </div>
          <Form.Item label="Main Image URL (auto-filled)" name="image_url">
            <Input placeholder="Drop image above, or paste R2 URL manually" />
          </Form.Item>

          <Divider />

          {/* Extra images */}
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
              <Upload customRequest={handleExtraUpload} showUploadList={false} accept="image/*" multiple>
                <div style={{
                  border: '2px dashed #1677ff', borderRadius: 6, aspectRatio: '1',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#1677ff', fontSize: 24, minHeight: 80,
                  background: extraUploading ? '#f0f5ff' : '#fafafa', transition: 'all 0.2s'
                }}>
                  {extraUploading ? <span style={{ fontSize: 12 }}>Uploading...</span> : (
                    <>
                      <PlusOutlined />
                      <span style={{ fontSize: 11, marginTop: 4 }}>Add</span>
                    </>
                  )}
                </div>
              </Upload>
            )}
          </div>
        </Card>

        {/* ── Block 3: Product Details (Bullets) ── */}
        <Card title="Product Details — Bullet Points" style={{ marginBottom: 16 }}>
          <Form.Item name="bullets" hidden><Input /></Form.Item>
          <Space direction="vertical" style={{ width: '100%' }}>
            {bullets.map((b, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Input
                  value={b}
                  placeholder={`e.g. Touch-free design`}
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
              placeholder="Meta description shown in Google search results (max 160 chars)"
            />
          </Form.Item>
          <Text type="secondary" style={{ float: 'right', fontSize: 12 }}>{seoDescLen} / 160</Text>
        </Card>

      </Form>
    </Edit>
  );
}
