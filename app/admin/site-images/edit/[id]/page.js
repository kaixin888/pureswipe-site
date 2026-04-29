'use client';

import React, { useState, useRef } from 'react';
import { Edit, useForm } from '@refinedev/antd';
import {
  Form, Input, Select, InputNumber,
  Card, Alert, Tag, Upload, Button,
  message, Descriptions, Space, Image, Divider
} from 'antd';
import { UploadOutlined, InboxOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { TextArea } = Input;

const PAGE_OPTIONS = ['首页', '产品页', '博客', '关于我们', '购物车', '结账', '全站'];
const SECTION_OPTIONS = ['Hero', 'Bundle', '信任徽章', '主图', '封面', '团队', 'Footer', '空状态', '安全'];

export default function SiteImageEdit() {
  const { formProps, saveButtonProps, form, queryResult } = useForm({
    resource: 'site_images',
    redirect: 'list',
  });

  const record = queryResult?.data?.data;
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(record?.image_url || '');
  const [uploadResult, setUploadResult] = useState(null);
  const fileRef = useRef(null);

  // 当 record 更新时同步 previewUrl
  React.useEffect(() => {
    if (record?.image_url) {
      setPreviewUrl(record.image_url);
    }
  }, [record?.image_url]);

  const handleUpload = async () => {
    const file = fileRef.current;
    if (!file) {
      message.warning('请先选择一张图片');
      return;
    }

    // 验证尺寸是否符合要求
    if (record?.width && record?.height) {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => { img.onload = resolve; });

      // 允许 ±10px 误差
      const wOk = Math.abs(img.naturalWidth - record.width) <= 10;
      const hOk = Math.abs(img.naturalHeight - record.height) <= 10;

      if (!wOk || !hOk) {
        message.warning(
          `图片尺寸 ${img.naturalWidth}×${img.naturalHeight}px 不匹配标准尺寸 ${record.width}×${record.height}px。` +
          `系统会自动压缩到标准尺寸，但可能会变形。建议上传尺寸匹配的图片。`
        );
        // 不阻止上传，只发警告
      }
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('slot_key', record?.slot_key || '');
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-site-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '上传失败');
      }

      setPreviewUrl(data.url);
      setUploadResult(data);
      message.success(`上传成功！压缩率 ${data.savings}%`);

      // 更新表单中的 image_url
      form?.setFieldsValue({ image_url: data.url });
    } catch (err) {
      message.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} form={form} layout="vertical">

        {/* 插槽信息（只读） */}
        <Card title="插槽信息" style={{ marginBottom: 16 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="插槽 Key">
              <Tag style={{ fontFamily: 'monospace' }}>{record?.slot_key}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="标签">
              <strong>{record?.label}</strong>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 尺寸警告 — 显著显示 */}
        <Card
          title={
            <Space>
              <WarningOutlined style={{ color: '#faad14' }} />
              <span>图片尺寸要求（严格遵循）</span>
            </Space>
          }
          style={{
            marginBottom: 16,
            background: '#fffbe6',
            border: '1px solid #ffe58f',
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              type="warning"
              showIcon
              message={
                <span>
                  该插槽的<span style={{ fontWeight: 700, fontSize: 18, color: '#d4380d' }}>标准尺寸：{record?.width} × {record?.height} px</span>
                </span>
              }
              description={
                <ul style={{ margin: '8px 0 0', paddingLeft: 20, lineHeight: 2 }}>
                  <li>上传的图片会被 <strong>强制压缩</strong> 到 {record?.width}×{record?.height}px（精确裁剪，居中填充）</li>
                  <li>尺寸偏差过大会导致图片<strong>变形或裁切</strong></li>
                  <li>建议上传完全匹配尺寸的源文件</li>
                </ul>
              }
            />
          </Space>
        </Card>

        {/* 图片上传区域 */}
        <Card title="上传新图片" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">

            {/* 当前图片预览 */}
            {previewUrl && (
              <div style={{ textAlign: 'center' }}>
                <Image
                  src={previewUrl}
                  alt={record?.label}
                  style={{ maxHeight: 200, borderRadius: 8, objectFit: 'contain' }}
                />
                <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                  当前图片 · {record?.width}×{record?.height}px
                </div>
              </div>
            )}

            {/* 文件选择 */}
            <Dragger
              name="file"
              multiple={false}
              showUploadList={false}
              accept="image/jpeg,image/png,image/webp,image/gif"
              beforeUpload={(file) => {
                fileRef.current = file;
                return false; // 阻止自动上传，我们手动控制
              }}
            >
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">点击或拖拽图片到此处</p>
              <p className="ant-upload-hint">
                支持 JPG / PNG / WebP / GIF，自动压缩到 {record?.width}×{record?.height}px
              </p>
            </Dragger>

            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={handleUpload}
              loading={uploading}
              size="large"
              style={{ width: '100%' }}
            >
              {uploading ? '正在上传并压缩...' : '上传并应用到网站'}
            </Button>

            {/* 上传结果 */}
            {uploadResult && (
              <Alert
                type="success"
                showIcon
                message={
                  <Space>
                    <CheckCircleOutlined />
                    <span>上传成功！</span>
                  </Space>
                }
                description={
                  <div>
                    <p>原始大小: {(uploadResult.originalSize / 1024).toFixed(1)} KB</p>
                    <p>压缩后: {(uploadResult.compressedSize / 1024).toFixed(1)} KB</p>
                    <p>节省: {uploadResult.savings}%</p>
                    <p>尺寸: {uploadResult.dimensions}</p>
                  </div>
                }
              />
            )}
          </Space>
        </Card>

        <Divider />

        {/* 其他字段 */}
        <Card title="其他设置" style={{ marginBottom: 16 }}>
          <Form.Item label="页面" name="page">
            <Select options={PAGE_OPTIONS.map(p => ({ label: p, value: p }))} />
          </Form.Item>
          <Form.Item label="区域" name="section">
            <Select options={SECTION_OPTIONS.map(s => ({ label: s, value: s }))} />
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
            tooltip="简短说明该图片在网站上的用途"
          >
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item
            label="后备颜色"
            name="fallback_color"
            tooltip="图片加载失败时显示的背景色 (如 #f0f0f0)"
          >
            <Input placeholder="#f0f0f0" />
          </Form.Item>
          <Form.Item
            label="Alt 文字 (SEO)"
            name="alt_text"
            tooltip="对搜索引擎友好的图片描述"
          >
            <Input placeholder={`${record?.label || ''} | clowand`} />
          </Form.Item>
          <Form.Item label="Image URL" name="image_url" hidden>
            <Input />
          </Form.Item>
        </Card>

      </Form>
    </Edit>
  );
}
