'use client';
import React, { Suspense } from 'react';
import RefineApp from './RefineApp';
import { AntdRegistry } from "@ant-design/nextjs-registry";
export default function AdminLayout({ children }) {
  return (
    <AntdRegistry>
      <Suspense fallback={<div style={{ padding: '24px', background: '#0f172a', height: '100vh', color: '#fff' }}>Loading clowand OS...</div>}>
        <RefineApp>
          {children}
        </RefineApp>
      </Suspense>
    </AntdRegistry>
  );
}
