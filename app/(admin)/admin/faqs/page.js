'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGo } from '@refinedev/core';
import { Button, Table, Space, Popconfirm, message, Switch } from 'antd';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function FaqsPage() {
  const go = useGo();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      message.error('Failed to load FAQs: ' + error.message);
    } else {
      setFaqs(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

  async function togglePublish(record) {
    const { error } = await supabase
      .from('faqs')
      .update({ is_published: !record.is_published })
      .eq('id', record.id);
    if (error) { message.error('Update failed'); return; }
    message.success('Updated');
    fetchFaqs();
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) { message.error('Delete failed'); return; }
    message.success('Deleted');
    fetchFaqs();
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
          {a && a.length > 100 ? a.slice(0, 100) + '...' : a}
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
      <Table dataSource={faqs} columns={columns} rowKey="id" loading={loading} size="middle" pagination={false} />
    </div>
  );
}
