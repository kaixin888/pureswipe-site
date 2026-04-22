// One-shot patch: upgrade Refine product create/edit pages to true Drag & Drop (Antd Dragger).
// Preserves CRLF, /api/upload-image flow, and image_url auto-fill behavior.
import fs from 'node:fs';

const files = [
  'app/admin/products/create/page.js',
  'app/admin/products/edit/[id]/page.js',
];

const replacements = [
  // (1) Add Dragger destructuring + InboxOutlined icon
  {
    name: 'imports',
    from: `import { Form, Input, Select, InputNumber, Upload, Button, message, Card, Divider, Space, Typography } from 'antd';\r\nimport { UploadOutlined, PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';\r\n\r\nconst { Text } = Typography;`,
    to: `import { Form, Input, Select, InputNumber, Upload, Button, message, Card, Divider, Space, Typography } from 'antd';\r\nimport { UploadOutlined, PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, InboxOutlined } from '@ant-design/icons';\r\n\r\nconst { Text } = Typography;\r\nconst { Dragger } = Upload;`,
  },
  // (2) Replace extra-image add tile with active-state styling (works for both files — identical block)
  {
    name: 'extra-tile',
    from: `            {extraImages.length < 8 && (\r\n              <Upload customRequest={handleExtraUpload} showUploadList={false} accept=\"image/*\">\r\n                <div style={{\r\n                  border: '2px dashed #d9d9d9', borderRadius: 6, aspectRatio: '1',\r\n                  display: 'flex', alignItems: 'center', justifyContent: 'center',\r\n                  cursor: 'pointer', color: '#8c8c8c', fontSize: 24, minHeight: 80\r\n                }}>\r\n                  {extraUploading ? '...' : <PlusOutlined />}\r\n                </div>\r\n              </Upload>\r\n            )}`,
    to: `            {extraImages.length < 8 && (\r\n              <Upload customRequest={handleExtraUpload} showUploadList={false} accept=\"image/*\" multiple>\r\n                <div style={{\r\n                  border: '2px dashed #1677ff', borderRadius: 6, aspectRatio: '1',\r\n                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',\r\n                  cursor: 'pointer', color: '#1677ff', fontSize: 24, minHeight: 80,\r\n                  background: extraUploading ? '#f0f5ff' : '#fafafa', transition: 'all 0.2s'\r\n                }}>\r\n                  {extraUploading ? <span style={{ fontSize: 12 }}>Uploading...</span> : (\r\n                    <>\r\n                      <PlusOutlined />\r\n                      <span style={{ fontSize: 11, marginTop: 4 }}>Add</span>\r\n                    </>\r\n                  )}\r\n                </div>\r\n              </Upload>\r\n            )}`,
  },
];

// Per-file unique replacements for the main image upload block (different preview-condition expressions)
const mainBlockCreate = {
  name: 'main-block-create',
  from: `          <Text strong>Main Image \u2605</Text>\r\n          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '12px 0 20px' }}>\r\n            {mainPreview && (\r\n              <img\r\n                src={mainPreview}\r\n                alt=\"main\"\r\n                style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 6, border: '1px solid #d9d9d9' }}\r\n              />\r\n            )}\r\n            <Upload customRequest={handleMainUpload} showUploadList={false} accept=\"image/*\">\r\n              <Button icon={<UploadOutlined />} loading={uploading}>\r\n                {uploading ? 'Uploading...' : 'Upload Main Image'}\r\n              </Button>\r\n            </Upload>\r\n          </div>\r\n          <Form.Item label=\"Main Image URL\" name=\"image_url\">\r\n            <Input placeholder=\"Auto-filled after upload, or paste URL\" />\r\n          </Form.Item>`,
  to: `          <Text strong>Main Image \u2605 (Drag & Drop or Click)</Text>\r\n          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, margin: '12px 0 20px' }}>\r\n            {mainPreview && (\r\n              <img\r\n                src={mainPreview}\r\n                alt=\"main\"\r\n                style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 6, border: '1px solid #d9d9d9', flexShrink: 0 }}\r\n              />\r\n            )}\r\n            <div style={{ flex: 1, minWidth: 0 }}>\r\n              <Dragger\r\n                customRequest={handleMainUpload}\r\n                showUploadList={false}\r\n                accept=\"image/*\"\r\n                multiple={false}\r\n                disabled={uploading}\r\n                style={{ padding: '12px 0' }}\r\n              >\r\n                <p className=\"ant-upload-drag-icon\" style={{ marginBottom: 6 }}>\r\n                  <InboxOutlined style={{ fontSize: 32, color: uploading ? '#999' : '#1677ff' }} />\r\n                </p>\r\n                <p className=\"ant-upload-text\" style={{ fontSize: 13, marginBottom: 4 }}>\r\n                  {uploading ? 'Uploading to Cloudflare R2...' : 'Drag image here or click to browse'}\r\n                </p>\r\n                <p className=\"ant-upload-hint\" style={{ fontSize: 12, color: '#8c8c8c' }}>\r\n                  JPG / PNG / WebP / GIF \u2014 auto-compressed to WebP, uploaded to Cloudflare R2\r\n                </p>\r\n              </Dragger>\r\n            </div>\r\n          </div>\r\n          <Form.Item label=\"Main Image URL (auto-filled)\" name=\"image_url\">\r\n            <Input placeholder=\"Drop image above, or paste R2 URL manually\" />\r\n          </Form.Item>`,
};

const mainBlockEdit = {
  name: 'main-block-edit',
  from: `          {/* Main image */}\r\n          <Text strong>Main Image \u2605</Text>\r\n          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '12px 0 20px' }}>\r\n            {(mainPreview || form.getFieldValue('image_url')) && (\r\n              <img\r\n                src={mainPreview || form.getFieldValue('image_url')}\r\n                alt=\"main\"\r\n                style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 6, border: '1px solid #d9d9d9' }}\r\n              />\r\n            )}\r\n            <Upload customRequest={handleMainUpload} showUploadList={false} accept=\"image/*\">\r\n              <Button icon={<UploadOutlined />} loading={uploading}>\r\n                {uploading ? 'Uploading...' : 'Upload Main Image'}\r\n              </Button>\r\n            </Upload>\r\n          </div>\r\n          <Form.Item label=\"Main Image URL\" name=\"image_url\">\r\n            <Input placeholder=\"Auto-filled after upload, or paste URL\" />\r\n          </Form.Item>`,
  to: `          {/* Main image */}\r\n          <Text strong>Main Image \u2605 (Drag & Drop or Click)</Text>\r\n          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, margin: '12px 0 20px' }}>\r\n            {(mainPreview || form.getFieldValue('image_url')) && (\r\n              <img\r\n                src={mainPreview || form.getFieldValue('image_url')}\r\n                alt=\"main\"\r\n                style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 6, border: '1px solid #d9d9d9', flexShrink: 0 }}\r\n              />\r\n            )}\r\n            <div style={{ flex: 1, minWidth: 0 }}>\r\n              <Dragger\r\n                customRequest={handleMainUpload}\r\n                showUploadList={false}\r\n                accept=\"image/*\"\r\n                multiple={false}\r\n                disabled={uploading}\r\n                style={{ padding: '12px 0' }}\r\n              >\r\n                <p className=\"ant-upload-drag-icon\" style={{ marginBottom: 6 }}>\r\n                  <InboxOutlined style={{ fontSize: 32, color: uploading ? '#999' : '#1677ff' }} />\r\n                </p>\r\n                <p className=\"ant-upload-text\" style={{ fontSize: 13, marginBottom: 4 }}>\r\n                  {uploading ? 'Uploading to Cloudflare R2...' : 'Drop new image to replace, or click to browse'}\r\n                </p>\r\n                <p className=\"ant-upload-hint\" style={{ fontSize: 12, color: '#8c8c8c' }}>\r\n                  JPG / PNG / WebP / GIF \u2014 auto-compressed to WebP, uploaded to Cloudflare R2\r\n                </p>\r\n              </Dragger>\r\n            </div>\r\n          </div>\r\n          <Form.Item label=\"Main Image URL (auto-filled)\" name=\"image_url\">\r\n            <Input placeholder=\"Drop image above, or paste R2 URL manually\" />\r\n          </Form.Item>`,
};

let totalChanges = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const before = content;

  for (const r of replacements) {
    if (!content.includes(r.from)) {
      console.error(`[${file}] MISS: ${r.name}`);
      continue;
    }
    content = content.replace(r.from, r.to);
    console.log(`[${file}] OK: ${r.name}`);
  }

  const mainBlock = file.includes('create') ? mainBlockCreate : mainBlockEdit;
  if (!content.includes(mainBlock.from)) {
    console.error(`[${file}] MISS: ${mainBlock.name}`);
  } else {
    content = content.replace(mainBlock.from, mainBlock.to);
    console.log(`[${file}] OK: ${mainBlock.name}`);
  }

  if (content !== before) {
    fs.writeFileSync(file, content);
    totalChanges++;
    console.log(`[${file}] WRITTEN (${content.length} bytes)`);
  } else {
    console.log(`[${file}] NO CHANGE`);
  }
}
console.log(`\nTotal files changed: ${totalChanges}`);
