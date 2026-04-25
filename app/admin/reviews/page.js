'use client';

import { useList, useUpdate, useDelete, useGo } from '@refinedev/core';
import { Star, Plus, Eye, EyeOff, Trash2, Video } from 'lucide-react';
import { Button, Table, Tag, Space, Popconfirm, Rate, message } from 'antd';

export default function ReviewsPage() {
  const go = useGo();
  const { data, isLoading, refetch } = useList({
    resource: 'reviews',
    sorters: [{ field: 'created_at', order: 'desc' }],
    pagination: { pageSize: 50 },
  });

  const { mutate: updateReview } = useUpdate();
  const { mutate: deleteReview } = useDelete();

  const reviews = data?.data || [];

  function togglePublish(record) {
    updateReview(
      { resource: 'reviews', id: record.id, values: { is_published: !record.is_published } },
      { onSuccess: () => { message.success('Updated'); refetch(); } }
    );
  }

  function handleDelete(id) {
    deleteReview(
      { resource: 'reviews', id },
      { onSuccess: () => { message.success('Deleted'); refetch(); } }
    );
  }

  const columns = [
    {
      title: 'Author',
      dataIndex: 'author_name',
      render: (name, rec) => (
        <div>
          <div style={{ fontWeight: 700 }}>{name}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{rec.author_location}</div>
        </div>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      width: 130,
      render: (r) => <Rate disabled defaultValue={r} style={{ fontSize: 12 }} />,
    },
    {
      title: 'Photo',
      dataIndex: 'image_url',
      width: 80,
      render: (url) => url ? <img src={url} alt="Review" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} /> : '-',
    },
    {
      title: 'Video',
      width: 80,
      render: (_, rec) => rec.video_url ? (
        <Tag color="blue" style={{ fontSize: 10 }}>
          <Video size={12} style={{ marginRight: 4 }} />Video
        </Tag>
      ) : '-',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      render: (c) => (
        <div style={{ maxWidth: 400, whiteSpace: 'pre-wrap', fontSize: 13, color: '#334155' }}>
          {c.length > 120 ? c.slice(0, 120) + '...' : c}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_published',
      width: 100,
      render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Published' : 'Hidden'}</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      width: 110,
      render: (d) => new Date(d).toLocaleDateString('en-US'),
    },
    {
      title: 'Actions',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={record.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
            onClick={() => togglePublish(record)}
          >
            {record.is_published ? 'Hide' : 'Show'}
          </Button>
          <Popconfirm title="Delete this review?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
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
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Reviews</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{reviews.length} total reviews</p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={14} />}
          onClick={() => go({ to: '/admin/reviews/create' })}
        >
          Add Review
        </Button>
      </div>
      <Table
        dataSource={reviews}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 20 }}
        size="middle"
      />
    </div>
  );
}
