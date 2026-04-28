'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { List, useTable } from '@refinedev/antd';
import { Table, Space, Tag, Badge, Button, Progress, Tooltip } from 'antd';
import { ReloadOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

export default function InventoryList() {
  const router = useRouter();

  const { tableProps, tableQueryResult, refetch } = useTable({
    resource: 'inventory',
    sorters: { initial: [{ field: 'quantity', order: 'asc' }] },  // 库存最少的排前面
  });

  // 手动 join: 从 products 表取 product name
  // Refine 的 supabase data provider 不支持跨表 join，所以一次性取出所有产品做映射
  const inventoryData = tableQueryResult?.data?.data || [];
  const [productMap, setProductMap] = useState({});

  // 第一次获取数据时，加载产品映射
  React.useEffect(() => {
    if (inventoryData.length > 0 && Object.keys(productMap).length === 0) {
      // 从 inventory 记录中提取所有 product_id
      const ids = [...new Set(inventoryData.map(r => r.product_id))];
      if (ids.length === 0) return;
      
      fetch(`/api/products-batch?ids=${ids.join(',')}`)
        .then(r => r.json())
        .then(data => {
          const map = {};
          (data.products || []).forEach(p => { map[p.id] = p.name; });
          setProductMap(map);
        })
        .catch(() => {}); // 静默失败，只显示 ID
    }
  }, [inventoryData, productMap]);

  return (
    <List
      headerButtons={() => (
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            刷新
          </Button>
          <Button type="primary" onClick={() => router.push('/admin/inventory')}>
            所有库存
          </Button>
        </Space>
      )}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="product_id"
          title="商品"
          render={(id, record) => {
            // 尝试用 product name，如果没有映射就显示 ID 前 8 位
            const name = productMap[id];
            if (name) return <span style={{ fontWeight: 500 }}>{name}</span>;
            return <Tag>{id?.substring(0, 8)}...</Tag>;
          }}
        />
        <Table.Column
          dataIndex="warehouse"
          title="仓库"
          render={(v) => <Tag>{v || 'main'}</Tag>}
        />
        <Table.Column
          dataIndex="quantity"
          title="库存数量"
          sorter
          render={(v, record) => {
            const threshold = record.low_stock_threshold || 10;
            const isLow = v <= threshold;
            return (
              <Space>
                <span style={{ fontWeight: 600, color: isLow ? '#ef4444' : '#22c55e' }}>
                  {v}
                </span>
                {isLow && (
                  <Tooltip title={`低于阈值 ${threshold}`}>
                    <ExclamationCircleOutlined style={{ color: '#ef4444' }} />
                  </Tooltip>
                )}
              </Space>
            );
          }}
        />
        <Table.Column
          dataIndex="reserved"
          title="已预留"
          render={(v) => v || 0}
        />
        <Table.Column
          title="可用"
          render={(_, record) => {
            const available = (record.quantity || 0) - (record.reserved || 0);
            const threshold = record.low_stock_threshold || 10;
            const pct = record.quantity > 0
              ? Math.round((available / record.quantity) * 100)
              : 0;

            return (
              <Space>
                <span style={{
                  fontWeight: 600,
                  color: available <= 0 ? '#ef4444' : available <= threshold ? '#f59e0b' : '#22c55e'
                }}>
                  {available}
                </span>
                {record.quantity > 0 && (
                  <Progress
                    percent={pct}
                    size="small"
                    style={{ width: 60, margin: 0 }}
                    strokeColor={available <= 0 ? '#ef4444' : available <= threshold ? '#f59e0b' : '#22c55e'}
                    format={() => ''}
                  />
                )}
              </Space>
            );
          }}
        />
        <Table.Column
          title="库存状态"
          render={(_, record) => {
            const qty = record.quantity || 0;
            const threshold = record.low_stock_threshold || 10;
            if (qty <= 0) return <Tag color="red" icon={<ExclamationCircleOutlined />}>缺货</Tag>;
            if (qty <= threshold) return <Tag color="orange">偏低 ({qty}/{threshold})</Tag>;
            return <Tag color="green" icon={<CheckCircleOutlined />}>充足</Tag>;
          }}
        />
        <Table.Column
          dataIndex="low_stock_threshold"
          title="预警阈值"
          render={(v) => <Tag color="default">{v || 10}</Tag>}
        />
        <Table.Column
          dataIndex="last_restocked_at"
          title="上次补货"
          render={(v) => {
            if (!v) return <span style={{ color: '#999' }}>从未</span>;
            return new Date(v).toLocaleDateString('zh-CN', {
              month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            });
          }}
        />
        <Table.Column
          dataIndex="updated_at"
          title="更新于"
          render={(v) => {
            if (!v) return '-';
            const d = new Date(v);
            const now = new Date();
            const diff = Math.floor((now - d) / 60000); // 分钟差
            if (diff < 1) return '刚刚';
            if (diff < 60) return `${diff} 分钟前`;
            if (diff < 1440) return `${Math.floor(diff / 60)} 小时前`;
            return d.toLocaleDateString('zh-CN');
          }}
        />
        <Table.Column
          title="操作"
          render={(_, record) => (
            <Space>
              <Button
                size="small"
                type="primary"
                ghost
                onClick={() => router.push(`/admin/inventory/edit/${record.id}`)}
              >
                调整库存
              </Button>
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
