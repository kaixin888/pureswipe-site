'use client';

import React from 'react';
import {
  List,
  useTable,
  EditButton,
  DeleteButton,
  CreateButton,
} from '@refinedev/antd';
import { useUpdate } from '@refinedev/core';
import { Table, Space, Tag, Switch, Typography, Image } from 'antd';

const { Text } = Typography;

export default function ProductList() {
  const { tableProps } = useTable({
    resource: 'products',
    sorters: {
      initial: [{ field: 'created_at', order: 'desc' }],
    },
  });

  const { mutate: updateStatus } = useUpdate();

  return (
    <List
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <CreateButton />
        </>
      )}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column 
          dataIndex="image_url" 
          title="Image" 
          render={(url) => url ? <Image src={url} width={40} height={40} style={{ borderRadius: '8px', objectFit: 'cover' }} /> : <div style={{ width: 40, height: 40, background: '#f5f5f5', borderRadius: '8px' }} />} 
        />
        <Table.Column dataIndex="name" title="Name" render={(v) => <Text strong>{v}</Text>} />
        <Table.Column dataIndex="price" title="Price" render={(v) => <Text style={{ color: '#1677ff', fontWeight: 900 }}>${v}</Text>} />
        <Table.Column dataIndex="stock" title="Stock" />
        <Table.Column
          dataIndex="status"
          title="Status"
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
              <Tag color={value === 'active' ? 'green' : 'red'}>
                {value?.toUpperCase()}
              </Tag>
            </Space>
          )}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
