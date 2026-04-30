'use client';

import React, { useState, useRef } from 'react';
import { List, useTable } from '@refinedev/antd';
import { Table, Tag, Space, Image, Button, Tooltip, Card, Upload, message, Alert } from 'antd';
import { useRouter } from 'next/navigation';
import { EditOutlined, ReloadOutlined, UploadOutlined, InboxOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

const PAGE_LABEL = {
  '首页': 'blue',
  '产品页': 'green',
  '博客': 'orange',
  '关于我们': 'purple',
  '购物车': 'cyan',
  '结账': 'red',
  '全站': 'default',
};

export default function SiteImagesList() {
  const router = useRouter();
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [selectedSlotKey, setSelectedSlotKey] = useState('');

  const { tableProps, tableQueryResult } = useTable({
    resource: 'site_images',
    sorters: { initial: [{ field: 'slot_key', order: 'asc' }] },
  });
  const refetch = tableQueryResult?.refetch || (() => {});

  const images = tableQueryResult?.data?.data || [];

  const handleUpload = async () => {
    if (!uploadFile) {
      message.warning('请先选择一张图片');
      return;
    }
    if (!selectedSlotKey) {
      message.warning('请先点击表格中要替换的插槽所在行的"上传到此插槽"按钮');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('slot_key', selectedSlotKey);
    formData.append('file', uploadFile);

    try {
      const res = await fetch('/api/upload-site-image', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '上传失败');
      setUploadResult(data);
      message.success(`上传成功！压缩率 ${data.savings}%`);
      refetch();
      setUploadFile(null);
      setSelectedSlotKey('');
    } catch (err) {
      message.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* 快速上传区 */}
      <Card
        title="快速上传图片"
        style={{ marginBottom: 16 }}
        extra={uploadResult && (
          <Tag color="success" icon={<CheckCircleOutlined />}>上次上传成功</Tag>
        )}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Dragger
            name="file"
            multiple={false}
            showUploadList={false}
            accept="image/jpeg,image/png,image/webp,image/gif"
            beforeUpload={(file) => {
              setUploadFile(file);
              return false;
            }}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">点击或拖拽图片到此处</p>
            <p className="ant-upload-hint">
              {uploadFile
                ? `已选择: ${uploadFile.name}`
                : '先点击右侧表格某行的"上传到此插槽"按钮，再将图片拖入或选择'}
            </p>
          </Dragger>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={handleUpload}
            loading={uploading}
            disabled={!uploadFile || !selectedSlotKey}
            size="large"
            block
          >
            {uploading ? '正在上传并压缩...' : `上传${selectedSlotKey ? `到 ${selectedSlotKey}` : ''}`}
          </Button>
        </Space>
      </Card>

      {/* 原表格 */}
      <List
      headerButtons={() => (
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>刷新</Button>
        </Space>
      )}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="缩略图"
          width={120}
          render={(_, record) => (
            record.image_url ? (
              <Image
                src={record.image_url}
                alt={record.label}
                width={80}
                height={record.width && record.height ? Math.round(80 * record.height / record.width) : 60}
                style={{ objectFit: 'contain', borderRadius: 6, background: '#f5f5f5' }}
                preview={{ mask: '预览' }}
              />
            ) : (
              <div style={{
                width: 80, height: 60,
                background: '#f0f0f0', borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: '#999'
              }}>
                未上传
              </div>
            )
          )}
        />
        <Table.Column
          title="插槽标识"
          dataIndex="slot_key"
          render={(v) => <Tag style={{ fontFamily: 'monospace', fontSize: 12 }}>{v}</Tag>}
        />
        <Table.Column
          title="名称"
          dataIndex="label"
          render={(v) => <span style={{ fontWeight: 500 }}>{v}</span>}
        />
        <Table.Column
          title="页面"
          dataIndex="page"
          render={(v) => <Tag color={PAGE_LABEL[v] || 'default'}>{v}</Tag>}
        />
        <Table.Column
          title="区域"
          dataIndex="section"
          render={(v) => <Tag>{v}</Tag>}
        />
        <Table.Column
          title="尺寸"
          render={(_, record) => (
            <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>
              {record.width}×{record.height}px
            </span>
          )}
        />
        <Table.Column
          title="描述"
          dataIndex="description"
          ellipsis
        />
        <Table.Column
          title="更新于"
          dataIndex="updated_at"
          render={(v) => v ? new Date(v).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
        />
        <Table.Column
          title="操作"
          render={(_, record) => (
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<UploadOutlined />}
                onClick={() => {
                  setSelectedSlotKey(record.slot_key);
                  message.info(`已选择插槽: ${record.slot_key}，请在上方区域上传图片`);
                }}
              >
                上传到此插槽
              </Button>
              <Button
                type="primary"
                size="small"
                ghost
                icon={<EditOutlined />}
                onClick={() => router.push(`/admin/site-images/edit/${record.id}`)}
              >
                编辑
              </Button>
            </Space>
          )}
        />
      </Table>
        </List>
      </>
    );
  }
