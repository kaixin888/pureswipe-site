'use client';

import React from 'react';
import RefineApp from './RefineApp';
import { AntdRegistry } from "@ant-design/nextjs-registry";

export default function AdminLayout({ children }) {
  return (
    <AntdRegistry>
        <RefineApp>
            {children}
        </RefineApp>
    </AntdRegistry>
  );
}
