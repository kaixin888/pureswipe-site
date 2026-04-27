'use client';

import React, { useState, useEffect } from 'react';
import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select, InputNumber, Upload, Button, message, Card, Divider, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, InboxOutlined } from '@ant-design/icons';
import { createClient } from '@supabase/supabase-js';

const { Text } = Typography;
const { Dragger } = Upload;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
);

const normalizeUrl = (url) => {
  if (!url) return '';
  return url.replace('pub-f3f9229828ae4b6691d29db0006ca32e.r2.dev', 'media.clowand.com');
};

export default function ProductEdit() {
  const { formProps, saveButtonProps, form, queryResult } = useForm({
    resource: 'products',
    redirect: 'list',
    onMutationSuccess: (mutationResult) => {
      // After Refine saves basic fields, separately save image fields via Supabase.
      // This avoids form dirty-check issues entirely.
      const productId = mutationResult?.data?.id;
      if (productId) {
        supabase
          .from('products')
          .update({
            image_url: mainPreview,
            extra_images: JSON.stringify(extraImages),
            bullets: JSON.stringify(bullets.filter(b => b.trim())),
          })
          .eq('id', productId)
          .then(({ error }) => {
            if (error) {
              console.error('Image save failed:', error);
              message.error('图片保存失败: ' + error.message);
            } else {
              message.success('商品已保存');
            }
          });
      }
    },
  });

  const record = queryResult?.data?.data;

  const [uploading, setUploading] = useState(false);
  const [mainPreview, setMainPreview] = useState('');
  const [extraImages, setExtraImages] = useState([]);
  const [bullets, setBullets] = useState(['']);
  const [descLen, setDescLen] = useState(0);
  const [seoDescLen, setSeoDescLen] = useState(0);
  const [extraUploading, setExtraUploading] = useState(false);

  // Populate preview state from loaded record
  useEffect(() => {
    if (record) {
      setMainPreview(normalizeUrl(record.image_url || ''));
      try {
        const parsed = typeof record.extra_images === 'string' ? JSON.parse(record.extra_images) : (record.extra_images || []);
        setExtraImages(Array.isArray(parsed) ? parsed.map(normalizeUrl) : []);
      } catch {
        setExtraImages([]);
      }
      try {
        const parsed = typeof record.bullets === 'string' ? JSON.parse(record.bullets) : (record.bullets || ['']);
        setBullets(Array.isArray(parsed) && parsed.length > 0 ? parsed : ['']);
      } catch {
        setBullets(['']);
      }
    }
  }, [record]);

  const addExtraImage = (url) => setExtraImages((prev) => [...prev, url]);
  const removeExtraImage = (idx) => setExtraImages((prev) => prev.filter((_, i) => i !== idx));
  const moveExtraImage = (idx, dir) => {
    setExtraImages((prev) => {
      const imgs = [...prev];
      const t = idx + dir;
      if (t < 0 || t >= imgs.length) return prev;
      [imgs[idx], imgs[t]] = [imgs[t], imgs[idx]];
      return imgs;
    });
  };

  const addBullet = () => { if (bullets.length < 6) setBullets([...bullets, '']); };
  const updateBullet = (idx, val) => {
    const bts = [...bullets];
    bts[idx] = val;
    setBullets(bts);
  };
  const removeBullet = (idx) => setBullets((prev) => prev.filter((_, i) => i !== idx));

  const handleMainUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      const resolvedUrl = normalizeUrl(data.url);
      setMainPreview(resolvedUrl);
      onSuccess(resolvedUrl);
      message.success(`主图已上传 — 节省 ${data.savings ?? 0}% (WebP)`);
    } catch (err) {
      message.error('上传失败: ' + err.message);
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  const handleExtraUpload = async ({ file, onSuccess, onError }) => {
    if (extraImages.length >= 8) {
      message.warning('最多 8 张附图');
      onError(new Error('max'));
      return;
    }
    setExtraUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      const resolvedUrl = normalizeUrl(data.url);
      addExtraImage(resolvedUrl);
      onSuccess(resolvedUrl);
      message.success('附图已上传');
    } catch (err) {
      message.error('上传失败: ' + err.message);
      onError(err);
    } finally {
      setExtraUploading(false);
    }
  };

  const validateSalePrice = (_, value) => {
    if (value == null || value === '') return Promise.resolve();
    const price = form.getFieldValue('price');
    if (price != null && Number(value) >= Number(price)) {
      return Promise.reject(new Error('促销价必须低于原价'));
    }
    if (Number(value) <= 0) return Promise.reject(new Error('促销价必须大于 0'));
    return Promise.resolve();
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} form={form} layout="vertical">
        <Card title="基本信息" style={{ marginBottom: 16 }}>
          <Form.Item label="商品名称" name="name" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input placeholder="输入商品名称" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
            <Form.Item label="原价 (USD)" name="price" rules={[{ required: true, message: '请输入价格' }]}>
              <InputNumber prefix="$" min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="促销价 (USD, 可选)" name="sale_price" tooltip="留空表示无促销；必须小于原价" rules={[{ validator: validateSalePrice }]}>
              <InputNumber prefix="$" min={0} step={0.01} style={{ width: '100%' }} placeholder="留空 = 无促销" />
            </Form.Item>
            <Form.Item label="库存" name="stock" rules={[{ required: true, message: '请输入库存' }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="状态" name="status" initialValue="active">
              <Select
                options={[
                  { label: '上架', value: 'active' },
                  { label: '下架', value: 'inactive' },
                ]}
              />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item label="标签" name="tag">
              <Input placeholder="例如: bestseller, new, sale" />
            </Form.Item>
            <Form.Item label="评分" name="rating">
              <InputNumber min={1} max={5} step={0.1} style={{ width: '100%' }} placeholder="4.8" />
            </Form.Item>
          </div>
          <Form.Item label="ASIN" name="asin">
            <Input placeholder="Amazon ASIN (可选)" />
          </Form.Item>
        </Card>

        <Card title="商品图片" style={{ marginBottom: 16 }}>
          <Text strong>主图 ★ (拖拽或点击上传)</Text>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, margin: '12px 0 20px' }}>
            {mainPreview && (
              <img
                src={mainPreview}
                alt="main"
                style={{
                  width: 120, height: 120, objectFit: 'cover', borderRadius: 6,
                  border: '1px solid #d9d9d9', flexShrink: 0,
                }}
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
                  {uploading ? '正在上传到 Cloudflare R2...' : '拖拽图片到此处，或点击选择文件'}
                </p>
                <p className="ant-upload-hint" style={{ fontSize: 12, color: '#8c8c8c' }}>
                  支持 JPG / PNG / WebP / GIF — 自动压缩为 WebP，上传至 Cloudflare R2
                </p>
              </Dragger>
            </div>
          </div>

          <Divider />
          <Text strong>附图 (最多 8 张)</Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
            {extraImages.map((url, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative', border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden',
                }}
              >
                <img
                  src={url}
                  alt={`extra-${idx}`}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                />
                <div
                  style={{
                    display: 'flex', justifyContent: 'space-between', padding: '4px 6px',
                    background: '#fafafa', borderTop: '1px solid #f0f0f0',
                  }}
                >
                  <Button size="small" icon={<ArrowUpOutlined />} onClick={() => moveExtraImage(idx, -1)} disabled={idx === 0} />
                  <Button size="small" icon={<ArrowDownOutlined />} onClick={() => moveExtraImage(idx, 1)} disabled={idx === extraImages.length - 1} />
                  <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeExtraImage(idx)} />
                </div>
              </div>
            ))}
            {extraImages.length < 8 && (
              <Upload customRequest={handleExtraUpload} showUploadList={false} accept="image/*" multiple>
                <div
                  style={{
                    border: '2px dashed #1677ff', borderRadius: 6, aspectRatio: '1',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#1677ff', fontSize: 24, minHeight: 80,
                    background: extraUploading ? '#f0f5ff' : '#fafafa', transition: 'all 0.2s',
                  }}
                >
                  {extraUploading ? (
                    <span style={{ fontSize: 12 }}>上传中...</span>
                  ) : (
                    <>
                      <PlusOutlined />
                      <span style={{ fontSize: 11, marginTop: 4 }}>添加</span>
                    </>
                  )}
                </div>
              </Upload>
            )}
          </div>
        </Card>

        <Card title="商品卖点 (Bullet Points)" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {bullets.map((b, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Input
                  value={b}
                  placeholder="例如: 一次性免接触设计"
                  onChange={(e) => updateBullet(idx, e.target.value)}
                  prefix={<Text type="secondary" style={{ fontSize: 12 }}>{idx + 1}.</Text>}
                />
                <Button danger icon={<DeleteOutlined />} onClick={() => removeBullet(idx)} disabled={bullets.length === 1} />
              </div>
            ))}
          </Space>
          {bullets.length < 6 && (
            <Button type="dashed" icon={<PlusOutlined />} onClick={addBullet} style={{ marginTop: 12, width: '100%' }}>
              添加卖点
            </Button>
          )}
          <Text type="secondary" style={{ fontSize: 12, marginTop: 6, display: 'block' }}>
            {bullets.filter((b) => b.trim()).length} / 6 条卖点
          </Text>
        </Card>

        <Card title="商品描述" style={{ marginBottom: 16 }}>
          <Form.Item name="description">
            <Input.TextArea
              rows={6}
              maxLength={2000}
              onChange={(e) => setDescLen(e.target.value.length)}
              placeholder="完整商品描述..."
            />
          </Form.Item>
          <Text type="secondary" style={{ float: 'right', fontSize: 12 }}>{descLen} / 2000</Text>
        </Card>

        <Card title="SEO 设置" style={{ marginBottom: 16 }}>
          <Form.Item label="SEO 标题" name="seo_title">
            <Input placeholder="留空则使用商品名" maxLength={70} />
          </Form.Item>
          <Form.Item label="SEO 描述" name="seo_description">
            <Input.TextArea
              rows={4}
              maxLength={160}
              onChange={(e) => setSeoDescLen(e.target.value.length)}
              placeholder="Google 搜索结果中显示的描述 (最多 160 字符)"
            />
          </Form.Item>
          <Text type="secondary" style={{ float: 'right', fontSize: 12 }}>{seoDescLen} / 160</Text>
          <Divider />
          <Form.Item
            label="主图 alt 文本 (SEO 必填)"
            name="alt_text"
            tooltip="供 Google 图片识别 + 屏幕阅读器使用，建议: '品牌 + 商品 + 关键属性'"
            rules={[{ required: true, message: '请填写主图 alt 文本 (SEO 必填)' }]}
          >
            <Input placeholder="例如: clowand 18 inch disposable toilet brush with caddy" maxLength={120} />
          </Form.Item>
        </Card>
      </Form>
    </Edit>
  );
}
