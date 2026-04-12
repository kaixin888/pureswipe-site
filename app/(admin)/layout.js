// Build Force: 2026-04-12 23:10:00 (Admin Layout Isolation)
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

