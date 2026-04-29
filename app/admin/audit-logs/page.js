'use client';

import React from 'react';
import { List, useTable } from '@refinedev/antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { Table, Tag, Space, Typography, Tooltip, Button } from 'antd';

const { Text } = Typography;

const ACTION_COLORS = {
  'create': 'green',
  'update': 'blue',
  'delete': 'red',
};

const ACTION_LABELS = {
  'create': '创建',
  'update': '更新',
  'delete': '删除',
};

export default function AuditLogsList() {
  const { tableProps, refetch } = useTable({
    resource: 'audit_logs',
    sorters: { initial: [{ field: 'created_at', order: 'desc' }] },
    pagination: { pageSize: 20 },
  });

  return (
    <List
      headerButtons={() => (
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>刷新</Button>
        </Space>
      )}
    >
      <Table {...tableProps} rowKey="id" scroll={{ x: 1000 }}>
        <Table.Column
          title="时间"
          dataIndex="created_at"
          width={180}
          render={(v) => v ? new Date(v).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : '-'}
        />
        <Table.Column
          title="操作"
          dataIndex="action"
          width={100}
          render={(v) => (
            <Tag color={ACTION_COLORS[v] || 'default'}>
              {ACTION_LABELS[v] || v}
            </Tag>
          )}
        />
        <Table.Column
          title="目标类型"
          dataIndex="target_type"
          width={140}
          render={(v) => <Text code>{v || '-'}</Text>}
        />
        <Table.Column
          title="目标 ID"
          dataIndex="target_id"
          width={120}
          ellipsis
          render={(v) => v ? <Text copyable={{ text: v }} code>{v.slice(0, 12)}...</Text> : '-'}
        />
        <Table.Column
          title="旧值(预览)"
          width={200}
          ellipsis
          render={(_, record) => (
            <Tooltip title={record.old_values ? JSON.stringify(record.old_values, null, 2) : '无'}>
              <Text type="secondary" className="text-xs">
                {record.old_values ? JSON.stringify(record.old_values).slice(0, 60) + '...' : '-'}
              </Text>
            </Tooltip>
          )}
        />
        <Table.Column
          title="新值(预览)"
          width={200}
          ellipsis
          render={(_, record) => (
            <Tooltip title={record.new_values ? JSON.stringify(record.new_values, null, 2) : '无'}>
              <Text className="text-xs">
                {record.new_values ? JSON.stringify(record.new_values).slice(0, 60) + '...' : '-'}
              </Text>
            </Tooltip>
          )}
        />
        <Table.Column
          title="IP"
          dataIndex="ip_address"
          width={140}
          render={(v) => <Text code>{v || '-'}</Text>}
        />
      </Table>
    </List>
  );
}
