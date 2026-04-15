'use client';

import React, { useCallback } from 'react';
import { List, useTable } from '@refinedev/antd';
import { Table, Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

export default function SubscriberList() {
  const { tableProps, tableQueryResult } = useTable({
    resource: 'subscribers',
    syncWithLocation: true,
    sorters: { initial: [{ field: 'created_at', order: 'desc' }] },
  });

  const exportCSV = useCallback(() => {
    const rows = tableQueryResult?.data?.data ?? [];
    if (!rows.length) { message.warning('No subscribers to export'); return; }
    const csv = ['Email,Date'].concat(
      rows.map((r) => `${r.email},${new Date(r.created_at).toLocaleDateString('en-US')}`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clowand-subscribers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    message.success(`Exported ${rows.length} subscribers`);
  }, [tableQueryResult]);

  return (
    <List
      resource="subscribers"
      headerButtons={
        <Button icon={<DownloadOutlined />} onClick={exportCSV}>
          Export CSV
        </Button>
      }
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column
          dataIndex="created_at"
          title="Subscribed"
          render={(v) => new Date(v).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        />
      </Table>
    </List>
  );
}
