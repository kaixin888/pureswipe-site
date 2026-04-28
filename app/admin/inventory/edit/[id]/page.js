'use client';

import React, { useState, useEffect } from 'react';
import { Edit, useForm } from '@refinedev/antd';
import { Form, InputNumber, Tag, Descriptions, Badge, Card, Divider, Typography, Space, Input } from 'antd';
import { createClient } from '@supabase/supabase-js';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
);

export default function InventoryEdit() {
  const { formProps, saveButtonProps, form, queryResult } = useForm({
    resource: 'inventory',
    redirect: 'list',
    onMutationSuccess: () => {
      // 更新成功后自动更新 last_restocked_at
      const record = queryResult?.data?.data;
      if (record?.id) {
        supabase
          .from('inventory')
          .update({ last_restocked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', record.id)
          .then(({ error }) => {
            if (error) console.error('更新时间戳失败:', error.message);
          });
      }
    },
  });

  const record = queryResult?.data?.data;
  const [productName, setProductName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // 获取关联的产品名称
  useEffect(() => {
    if (record?.product_id) {
      supabase
        .from('products')
        .select('name')
        .eq('id', record.product_id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) setProductName(data.name);
        });
    }
  }, [record?.product_id]);

  const available = (record?.quantity || 0) - (record?.reserved || 0);
  const isLowStock = (record?.quantity || 0) <= (record?.low_stock_threshold || 10);

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      onMutationSuccess={() => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }}
    >
      <Form {...formProps} form={form} layout="vertical">

        {/* 当前状态概览 */}
        <Card title="库存概览" style={{ marginBottom: 16 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="商品">
              <Text strong>{productName || '加载中...'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {record?.quantity <= 0 ? (
                <Tag color="red" icon={<ExclamationCircleOutlined />}>缺货</Tag>
              ) : isLowStock ? (
                <Tag color="orange" icon={<ExclamationCircleOutlined />}>库存偏低</Tag>
              ) : (
                <Tag color="green" icon={<CheckCircleOutlined />}>库存充足</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="当前库存">
              <Text strong style={{ fontSize: 16, color: isLowStock ? '#ef4444' : '#22c55e' }}>
                {record?.quantity || 0}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="已预留">
              {record?.reserved || 0}
            </Descriptions.Item>
            <Descriptions.Item label="可用库存">
              <Text strong style={{ color: available <= 0 ? '#ef4444' : available <= (record?.low_stock_threshold || 10) ? '#f59e0b' : '#22c55e' }}>
                {available}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="上次补货">
              {record?.last_restocked_at
                ? new Date(record.last_restocked_at).toLocaleString('zh-CN')
                : <Text type="secondary">从未</Text>}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Divider />

        {/* 编辑字段 */}
        <Card title="调整库存" style={{ marginBottom: 16 }}>
          {productName && (
            <Form.Item label="商品名称">
              <Input value={productName} disabled />
            </Form.Item>
          )}
          <Form.Item label="仓库" name="warehouse" initialValue="main">
            <Input disabled placeholder="仓库名称（如需多仓请创建新记录）" />
          </Form.Item>
          <Form.Item
            label="当前库存数量"
            name="quantity"
            rules={[{ required: true, message: '请输入库存数量' }]}
            tooltip="正数为入库，0 为缺货"
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="输入实际库存数量" />
          </Form.Item>
          <Form.Item
            label="已预留数量"
            name="reserved"
            initialValue={0}
            tooltip="已被订单占用但尚未发货的数量（自动计算可用 = 库存 - 预留）"
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="预留数量" />
          </Form.Item>
          <Form.Item
            label="低库存预警阈值"
            name="low_stock_threshold"
            initialValue={10}
            tooltip="当库存低于此值时，列表中会显示低库存警告"
          >
            <InputNumber min={1} max={1000} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="上次补货时间"
            name="last_restocked_at"
          >
            <Input placeholder="保存后自动更新为当前时间" disabled />
          </Form.Item>
        </Card>

        {/* 操作提示 */}
        <Card title="操作说明" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 2 }}>
            <li><Text type="secondary">入库:</Text> 增加 <Text code>库存数量</Text> 即可</li>
            <li><Text type="secondary">出库:</Text> 减少 <Text code>库存数量</Text>，或增加 <Text code>已预留</Text></li>
            <li><Text type="secondary">可用库存</Text> = 库存数量 - 已预留（自动计算）</li>
            <li><Text type="secondary">保存后</Text> 自动记录补货时间</li>
          </ul>
        </Card>

        {showSuccess && (
          <Card
            style={{
              marginTop: 16,
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              textAlign: 'center',
            }}
          >
            <Text style={{ color: '#52c41a', fontSize: 16 }}>
              <CheckCircleOutlined /> 库存已更新
            </Text>
          </Card>
        )}

      </Form>
    </Edit>
  );
}
