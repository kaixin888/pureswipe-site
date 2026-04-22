'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  List,
  useTable,
  EditButton,
  DeleteButton,
  CreateButton,
} from '@refinedev/antd';
import { useUpdate } from '@refinedev/core';
import { Table, Space, Tag, Switch, Tabs, Badge, Button } from 'antd';

export default function ProductList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  const tabFilters = {
    all: [],
    active: [
      { field: 'status', operator: 'eq', value: 'active' },
      { field: 'stock', operator: 'gt', value: 0 },
    ],
    out_of_stock: [
      { field: 'stock', operator: 'eq', value: 0 },
    ],
    draft: [
      { field: 'status', operator: 'eq', value: 'draft' },
    ],
  };

  const { tableProps, tableQueryResult } = useTable({
    resource: 'products',
    filters: {
      permanent: tabFilters[activeTab] || [],
    },
    sorters: {
      initial: [{ field: 'created_at', order: 'desc' }],
    },
  });

  const { mutate: updateStatus } = useUpdate();

  const allData = tableQueryResult?.data?.data || [];
  const counts = {
    all: tableQueryResult?.data?.total || 0,
    active: allData.filter(p => p.status === 'active' && p.stock > 0).length,
    out_of_stock: allData.filter(p => p.stock === 0).length,
    draft: allData.filter(p => p.status === 'draft').length,
  };

  const tabItems = [
    { key: 'all', label: <span>全部 <Badge count={counts.all} showZero style={{ backgroundColor: '#6b7280', marginLeft: 4 }} /></span> },
    { key: 'active', label: <span>上架中 <Badge count={counts.active} showZero style={{ backgroundColor: '#22c55e', marginLeft: 4 }} /></span> },
    { key: 'out_of_stock', label: <span>缺货 <Badge count={counts.out_of_stock} showZero style={{ backgroundColor: '#ef4444', marginLeft: 4 }} /></span> },
    { key: 'draft', label: <span>草稿 <Badge count={counts.draft} showZero style={{ backgroundColor: '#f59e0b', marginLeft: 4 }} /></span> },
  ];

  return (
    <List
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <Button
            type="primary"
            onClick={() => router.push('/admin/products/create')}
          >
            新建商品
          </Button>
        </>
      )}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ marginBottom: 16 }}
      />
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="image_url"
          title="主图"
          render={(url) =>
            url ? (
              <img
                src={url}
                alt="product"
                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
              />
            ) : (
              <div style={{ width: 60, height: 60, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 11 }}>
                无图
              </div>
            )
          }
        />
        <Table.Column dataIndex="name" title="商品名称" />
        <Table.Column
          dataIndex="price"
          title="价格"
          render={(v, record) => {
            const sale = record.sale_price;
            const onSale = sale != null && Number(sale) > 0 && Number(sale) < Number(v);
            if (onSale) {
              return (
                <Space size={6}>
                  <span style={{ textDecoration: 'line-through', color: '#999' }}>${Number(v).toFixed(2)}</span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>${Number(sale).toFixed(2)}</span>
                  <Tag color="red" style={{ marginLeft: 0 }}>促销</Tag>
                </Space>
              );
            }
            return `$${Number(v).toFixed(2)}`;
          }}
        />
        <Table.Column
          dataIndex="stock"
          title="库存"
          render={(v) => {
            if (v === 0) return <Tag color="red">缺货</Tag>;
            if (v < 10) return <Tag color="orange">{v} 偏低</Tag>;
            return <Tag color="green">{v}</Tag>;
          }}
        />
        <Table.Column
          dataIndex="status"
          title="状态"
          render={(value, record) => (
            <Space>
              <Switch
                size="small"
                checked={value === 'active'}
                onChange={(checked) => {
                  updateStatus({
                    resource: 'products',
                    id: record.id,
                    values: { status: checked ? 'active' : 'inactive' },
                  });
                }}
              />
              <Tag color={value === 'active' ? 'green' : value === 'draft' ? 'orange' : 'red'}>
                {value === 'active' ? '上架' : value === 'inactive' ? '下架' : value === 'draft' ? '草稿' : '未知'}
              </Tag>
            </Space>
          )}
        />
        <Table.Column
          title="操作"
          dataIndex="actions"
          render={(_, record) => (
            <Space>
              <Button
                size="small"
                onClick={() => router.push(`/admin/products/edit/${record.id}`)}
              >
                编辑
              </Button>
              <DeleteButton hideText size="small" recordItemId={record?.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
