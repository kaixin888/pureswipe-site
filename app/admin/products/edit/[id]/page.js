'use client';

import React, { useState, useEffect } from 'react';
import { Edit, useForm, useUpdate } from '@refinedev/antd';
import { Form, Input, Select, InputNumber, Upload, Button, message, Card, Divider, Space, Typography } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, InboxOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Dragger } = Upload;

export default function ProductEdit() {
  const { formProps, saveButtonProps: rawSaveButtonProps, form, queryResult } = useForm({
    resource: 'products',
    redirect: 'list',
    onMutationSuccess: () => {
      message.success('商品已保存');
    },
  });

  const { mutate: updateProduct } = useUpdate();

  const saveButtonProps = rawSaveButtonProps && typeof rawSaveButtonProps === 'object'
    ? { ...rawSaveButtonProps, onClick: () => handleSave() }
    : { onClick: () => handleSave() };

  const handleSave = () => {
    const values = form.getFieldsValue();
    updateProduct({
      resource: 'products',
      id: queryResult?.data?.data?.id,
      values: {
        ...values,
        extra_images: JSON.stringify(extraImages.filter(i => i)),
        bullets: JSON.stringify(bullets.filter(b => b.trim())),
        image_url: mainPreview || values.image_url,
      },
    }, {
      onSuccess: () => {
        message.success('商品已保存');
      },
    });
  };

  const productData = queryResult?.data?.data;

  const [uploading, setUploading] = useState(false);
  const [mainPreview, setMainPreview] = useState('');
  const [extraImages, setExtraImages] = useState([]);
  const [bullets, setBullets] = useState(['']);
  const [descLen, setDescLen] = useState(0);
  const [seoDescLen, setSeoDescLen] = useState(0);
  const [extraUploading, setExtraUploading] = useState(false);

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
      message.success(`主图已上传 — 节省 ${data.savings ?? 0}% (WebP)`);
    } catch (err) {
      message.error('上传失败: ' + err.message);
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  const handleExtraUpload = async ({ file, onSuccess, onError }) => {
    if (extraImages.length >= 8) { message.warning('最多 8 张附图'); onError(new Error('max')); return; }
    setExtraUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      syncExtraImages([...extraImages, data.url]);
      onSuccess(data.url);
      message.success('附图已上传');
    } catch (err) {
      message.error('上传失败: ' + err.message);
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

  // Phase E-2: validate sale_price < price
  const validateSalePrice = (_, value) => {
    if (value == null || value === '') return Promise.resolve();
    const price = form.getFieldValue('price');
    if (price != null && Number(value) >= Number(price)) {
      return Promise.reject(new Error('促销价必须低于原价'));
    }
    if (Number(value) <= 0) {
      return Promise.reject(new Error('促销价必须大于 0'));
    }
    return Promise.resolve();
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} form={form} layout="vertical" onValuesChange={onFormValuesChange}>

        {/* ── Block 1: 基本信息 ── */}
        <Card title="基本信息" style={{ marginBottom: 16 }}>
          <Form.Item label="商品名称" name="name" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input placeholder="输入商品名称" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
            <Form.Item label="原价 (USD)" name="price" rules={[{ required: true, message: '请输入价格' }]}>
              <InputNumber prefix="$" min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="促销价 (USD, 可选)"
              name="sale_price"
              tooltip="留空表示无促销；必须小于原价"
              rules={[{ validator: validateSalePrice }]}
            >
              <InputNumber prefix="$" min={0} step={0.01} style={{ width: '100%' }} placeholder="留空 = 无促销" />
            </Form.Item>
            <Form.Item label="库存" name="stock" rules={[{ required: true, message: '请输入库存' }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="状态" name="status">
              <Select options={[
                { label: '上架', value: 'active' },
                { label: '下架', value: 'inactive' },
              ]} />
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

        {/* ── Block 2: 商品图片 ── */}
        <Card title="商品图片" style={{ marginBottom: 16 }}>
          <Text strong>主图 ★ (拖拽或点击替换)</Text>
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
                  {uploading ? '正在上传到 Cloudflare R2...' : '拖拽新图片以替换，或点击选择文件'}
                </p>
                <p className="ant-upload-hint" style={{ fontSize: 12, color: '#8c8c8c' }}>
                  支持 JPG / PNG / WebP / GIF — 自动压缩为 WebP，上传至 Cloudflare R2
                </p>
              </Dragger>
            </div>
          </div>
          <Form.Item label="主图 URL (自动填入)" name="image_url">
            <Input placeholder="拖拽上传后自动填入，或手动粘贴 R2 URL" />
          </Form.Item>

          <Divider />

          <Text strong>附图 (最多 8 张)</Text>
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
                  {extraUploading ? <span style={{ fontSize: 12 }}>上传中...</span> : (
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

        {/* ── Block 3: 卖点 ── */}
        <Card title="商品卖点 (Bullet Points)" style={{ marginBottom: 16 }}>
          <Form.Item name="bullets" hidden><Input /></Form.Item>
          <Space direction="vertical" style={{ width: '100%' }}>
            {bullets.map((b, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Input
                  value={b}
                  placeholder="例如: 一次性免接触设计"
                  onChange={e => updateBullet(idx, e.target.value)}
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
            {bullets.filter(b => b.trim()).length} / 6 条卖点
          </Text>
        </Card>

        {/* ── Block 4: 商品描述 ── */}
        <Card title="商品描述" style={{ marginBottom: 16 }}>
          <Form.Item name="description">
            <Input.TextArea
              rows={6}
              maxLength={2000}
              onChange={e => setDescLen(e.target.value.length)}
              placeholder="完整商品描述..."
            />
          </Form.Item>
          <Text type="secondary" style={{ float: 'right', fontSize: 12 }}>{descLen} / 2000</Text>
        </Card>

        {/* ── Block 5: SEO 设置 ── */}
        <Card title="SEO 设置" style={{ marginBottom: 16 }}>
          <Form.Item label="SEO 标题" name="seo_title">
            <Input placeholder="留空则使用商品名" maxLength={70} />
          </Form.Item>
          <Form.Item label="SEO 描述" name="seo_description">
            <Input.TextArea
              rows={4}
              maxLength={160}
              onChange={e => setSeoDescLen(e.target.value.length)}
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
