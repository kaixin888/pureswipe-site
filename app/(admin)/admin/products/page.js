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
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="Name" />
      </Table>
    </List>
  );
}
