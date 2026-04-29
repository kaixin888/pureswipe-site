'use client';

import React, { useState, useEffect } from 'react';
import { List, useTable } from '@refinedev/antd';
import { Table, Tag, Space, Button, Modal, Form, Input, Select, message, Tooltip, Popconfirm } from 'antd';
import { ReloadOutlined, PlusOutlined, UserAddOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';

const ROLES = [
  { value: 'super_admin', label: '超级管理员', color: 'red' },
  { value: 'admin', label: '管理员', color: 'blue' },
  { value: 'operator', label: '运营', color: 'green' },
  { value: 'support', label: '客服', color: 'orange' },
];

const ROLE_COLORS = {
  super_admin: 'red', admin: 'blue', operator: 'green', support: 'orange',
};

export default function UsersList() {
  const { tableProps, refetch } = useTable({
    resource: 'user_profiles',
    sorters: { initial: [{ field: 'created_at', order: 'desc' }] },
    pagination: { pageSize: 20 },
    meta: { select: '*' },
  });

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const handleCreate = async (values) => {
    try {
      const res = await fetch('/api/user-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      message.success('用户创建成功');
      setCreateModal(false);
      form.resetFields();
      refetch();
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleUpdate = async (values) => {
    try {
      const res = await fetch('/api/user-profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: editModal, ...values }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      message.success('用户更新成功');
      setEditModal(null);
      editForm.resetFields();
      refetch();
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleToggleStatus = async (user, newStatus) => {
    try {
      const res = await fetch('/api/user-profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, status: newStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      message.success(newStatus === 'active' ? '用户已启用' : '用户已禁用');
      refetch();
    } catch (err) {
      message.error(err.message);
    }
  };

  return (
    <>
      <List
        headerButtons={() => (
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModal(true)}>
              新建用户
            </Button>
          </Space>
        )}
      >
        <Table {...tableProps} rowKey="user_id" scroll={{ x: 800 }}>
          <Table.Column
            title="邮箱"
            dataIndex={['user_id']}
            width={220}
            ellipsis
            render={(uid) => <span className="text-xs font-mono">{uid ? uid.slice(0, 20) + '...' : '-'}</span>}
          />
          <Table.Column
            title="显示名称"
            dataIndex="display_name"
            width={180}
            render={(v) => v || '-'}
          />
          <Table.Column
            title="角色"
            dataIndex="role"
            width={120}
            render={(v) => <Tag color={ROLE_COLORS[v]}>{ROLES.find(r => r.value === v)?.label || v}</Tag>}
          />
          <Table.Column
            title="状态"
            dataIndex="status"
            width={100}
            render={(v) => (
              <Tag color={v === 'active' ? 'success' : 'default'}>
                {v === 'active' ? '正常' : '已禁用'}
              </Tag>
            )}
          />
          <Table.Column
            title="注册时间"
            dataIndex="created_at"
            width={160}
            render={(v) => v ? new Date(v).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : '-'}
          />
          <Table.Column
            title="操作"
            width={200}
            render={(_, record) => (
              <Space>
                <Button size="small" onClick={() => {
                  setEditModal(record.user_id);
                  editForm.setFieldsValue({ role: record.role, display_name: record.display_name });
                }}>
                  编辑
                </Button>
                {record.status === 'active' ? (
                  <Popconfirm
                    title="确认禁用此用户？"
                    onConfirm={() => handleToggleStatus(record, 'disabled')}
                  >
                    <Button size="small" danger icon={<LockOutlined />}>禁用</Button>
                  </Popconfirm>
                ) : (
                  <Button size="small" icon={<UnlockOutlined />} onClick={() => handleToggleStatus(record, 'active')}>
                    启用
                  </Button>
                )}
              </Space>
            )}
          />
        </Table>
      </List>

      <Modal
        title="新建用户"
        open={createModal}
        onCancel={() => { setCreateModal(false); form.resetFields(); }}
        footer={null}
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
            <Input placeholder="user@example.com" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, min: 12, message: '密码至少 12 位' }]}>
            <Input.Password placeholder="12 characters minimum" />
          </Form.Item>
          <Form.Item name="display_name" label="显示名称">
            <Input placeholder="可选" />
          </Form.Item>
          <Form.Item name="role" label="角色" initialValue="operator">
            <Select options={ROLES} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>创建用户</Button>
        </Form>
      </Modal>

      <Modal
        title="编辑用户"
        open={!!editModal}
        onCancel={() => { setEditModal(null); editForm.resetFields(); }}
        footer={null}
        width={480}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="display_name" label="显示名称">
            <Input placeholder="可选" />
          </Form.Item>
          <Form.Item name="role" label="角色">
            <Select options={ROLES} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>保存修改</Button>
        </Form>
      </Modal>
    </>
  );
}
