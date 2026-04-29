'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { List } from '@refinedev/antd';
import { ReloadOutlined } from '@ant-design/icons';
import { Table, Tag, Space, Typography, Tooltip, Button, message } from 'antd';

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

// 自定义 hooks：通过 service_role API 获取审计日志
function useAuditLogs() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchData = useCallback(async (p, ps) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit-logs?page=${p || page}&pageSize=${ps || pageSize}`);
      const json = await res.json();
      if (json.error) {
        message.error('加载失败: ' + json.error);
        return;
      }
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch (err) {
      message.error('请求异常: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => { fetchData(page, pageSize); }, [page, pageSize]);

  const refetch = () => fetchData(page, pageSize);

  return { data, total, loading, page, setPage, pageSize, setPageSize, refetch };
}

export default function AuditLogsList() {
  const { data, total, loading, page, setPage, pageSize, setPageSize, refetch } = useAuditLogs();

  return (
    <List
      headerButtons={() => (
        <Space>
          <Button icon={<ReloadOutlined />} onClick={refetch}>刷新</Button>
        </Space>
      )}
    >
      <Table
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
        }}
      >
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
