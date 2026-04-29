'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { List } from '@refinedev/antd';
import { ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Table, Tag, Space, Typography, Tooltip, Button, message } from 'antd';

const { Text } = Typography;

// 自定义 hooks：通过 service_role API 获取登录日志
function useLoginLogs() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchData = useCallback(async (p, ps) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/login-logs?page=${p || page}&pageSize=${ps || pageSize}`);
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

export default function LoginLogsList() {
  const { data, total, loading, page, setPage, pageSize, setPageSize, refetch } = useLoginLogs();

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
        scroll={{ x: 900 }}
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
