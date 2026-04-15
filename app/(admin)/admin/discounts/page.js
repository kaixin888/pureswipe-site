'use client';

import React from 'react';
import {
  List,
  useTable,
  CreateButton,
  EditButton,
  DeleteButton,
} from '@refinedev/antd';
import { Table, Tag, Switch, message } from 'antd';
import { useUpdate } from '@refinedev/core';

export default function DiscountList() {
  const { tableProps } = useTable({ resource: 'discount_codes', syncWithLocation: true });
  const { mutate: updateCode } = useUpdate();

  const toggleActive = (record) => {
    updateCode(
      { resource: 'discount_codes', id: record.id, values: { is_active: !record.is_active } },
      {
        onSuccess: () => message.success(`Code ${record.code} ${!record.is_active ? 'activated' : 'deactivated'}`),
        onError: () => message.error('Failed to update'),
      }
    );
  };

  return (
    <List
      resource="discount_codes"
      headerButtons={<CreateButton resource="discount_codes" />}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="code" title="Code" render={(v) => <code style={{ fontWeight: 700, fontSize: 14 }}>{v}</code>} />
        <Table.Column dataIndex="discount_percent" title="Discount" render={(v) => <Tag color="blue">{v}% OFF</Tag>} />
        <Table.Column dataIndex="usage_count" title="Used" />
        <Table.Column dataIndex="max_usage" title="Max Usage" render={(v) => v ?? '∞'} />
        <Table.Column
          dataIndex="is_active"
          title="Active"
          render={(val, record) => (
            <Switch checked={val} onChange={() => toggleActive(record)} />
          )}
        />
        <Table.Column
          title="Actions"
          render={(_, record) => (
            <span style={{ display: 'flex', gap: 8 }}>
              <EditButton resource="discount_codes" recordItemId={record.id} size="small" />
              <DeleteButton resource="discount_codes" recordItemId={record.id} size="small" />
            </span>
          )}
        />
      </Table>
    </List>
  );
}
