'use client';

import { useList, useUpdate, useDelete, useGo } from '@refinedev/core';
import { Button, Table, Tag, Space, Popconfirm, message, Switch } from 'antd';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function FaqsPage() {
  const go = useGo();
  const { data, isLoading, refetch } = useList({
    resource: 'faqs',
    pagination: { pageSize: 100, mode: 'off' },
  });
  const { mutate: updateFaq } = useUpdate();
  const { mutate: deleteFaq } = useDelete();
  const faqs = (data?.data || []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  function togglePublish(record) {
    updateFaq(
      { resource: 'faqs', id: record.id, values: { is_published: !record.is_published } },
      { onSuccess: () => { message.success('Updated'); refetch(); } }
    );
  }

  function handleDelete(id) {
    deleteFaq(
      { resource: 'faqs', id },
      { onSuccess: () => { message.success('Deleted'); refetch(); } }
    );
  }

  const columns = [
    {
      title: 'Order',
      dataIndex: 'sort_order',
      width: 70,
    },
    {
      title: 'Question',
      dataIndex: 'question',
      render: (q) => <span style={{ fontWeight: 600 }}>{q}</span>,
    },
    {
      title: 'Answer',
      dataIndex: 'answer',
      render: (a) => (
        <span style={{ color: '#64748b', fontSize: 13 }}>
          {a.length > 100 ? a.slice(0, 100) + '...' : a}
        </span>
      ),
    },
    {
      title: 'Published',
      dataIndex: 'is_published',
      width: 100,
      render: (v, record) => (
        <Switch checked={v} onChange={() => togglePublish(record)} size="small" />
      ),
    },
    {
      title: 'Actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<Pencil size={13} />}
            onClick={() => go({ to: `/admin/faqs/edit/${record.id}` })}
          />
          <Popconfirm title="Delete this FAQ?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button size="small" danger icon={<Trash2 size={13} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>FAQs</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{faqs.length} questions</p>
        </div>
        <Button type="primary" icon={<Plus size={14} />} onClick={() => go({ to: '/admin/faqs/create' })}>
          Add FAQ
        </Button>
      </div>
      <Table dataSource={faqs} columns={columns} rowKey="id" loading={isLoading} size="middle" pagination={false} />
    </div>
  );
}
