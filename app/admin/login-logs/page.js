'use client';

import React from 'react';
import { List, useTable } from '@refinedev/antd';
import { Table, Tag, Space, Typography, Tooltip } from 'antd';
import { ReloadOutlined, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function LoginLogsList() {
  const { tableProps, refetch } = useTable({
    resource: 'login_logs',
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
      <Table {...tableProps} rowKey="id" scroll={{ x: 900 }}>
        <Table.Column
          title="时间"
          dataIndex="created_at"
          width={180}
          render={(v) => v ? new Date(v).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : '-'}
        />
        <Table.Column
          title="邮箱"
          dataIndex="email"
          width={200}
          ellipsis
        />
        <Table.Column
          title="状态"
          dataIndex="status"
          width={100}
          render={(v) => (
            <Tag icon={v === 'success' ? <CheckCircleOutlined /> : <CloseCircleOutlined />} color={v === 'success' ? 'success' : 'error'}>
              {v === 'success' ? '成功' : '失败'}
            </Tag>
          )}
        />
        <Table.Column
          title="失败原因"
          dataIndex="failed_reason"
          width={200}
          ellipsis
          render={(v) => v || '-'}
        />
        <Table.Column
          title="IP 地址"
          dataIndex="ip_address"
          width={150}
          ellipsis
          render={(v) => <Text code>{v || '-'}</Text>}
        />
        <Table.Column
          title="User Agent"
          dataIndex="user_agent"
          width={200}
          ellipsis
          render={(v) => (
            <Tooltip title={v}>
              <span className="text-slate-400 text-xs">{v ? v.slice(0, 60) + (v.length > 60 ? '...' : '') : '-'}</span>
            </Tooltip>
          )}
        />
      </Table>
    </List>
  );
}
