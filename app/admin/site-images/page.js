'use client';

import React, { useState, useEffect } from 'react';
import { List, useTable } from '@refinedev/antd';
import { Table, Tag, Space, Image, Button, Tooltip } from 'antd';
import { useRouter } from 'next/navigation';
import { EditOutlined, ReloadOutlined } from '@ant-design/icons';

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

  const { tableProps, tableQueryResult, refetch } = useTable({
    resource: 'site_images',
    sorters: { initial: [{ field: 'slot_key', order: 'asc' }] },
  });

  const images = tableQueryResult?.data?.data || [];

  return (
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
            <Button
              type="primary"
              size="small"
              ghost
              icon={<EditOutlined />}
              onClick={() => router.push(`/admin/site-images/edit/${record.id}`)}
            >
              编辑
            </Button>
          )}
        />
      </Table>
    </List>
  );
}
