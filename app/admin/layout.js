'use client';

import React, { Suspense } from 'react';
import RefineApp from './RefineApp';
import { AntdRegistry } from "@ant-design/nextjs-registry";
import SafeAntdProvider from '@/components/SafeAntdProvider';

export default function AdminLayout({ children }) {
  return (
    <AntdRegistry>
      <SafeAntdProvider>
        <Suspense fallback={<div style={{ padding: '24px', background: '#0f172a', height: '100vh', color: '#fff' }}>clowand OS 加载中...</div>}>
          <RefineApp>
            {children}
          </RefineApp>
        </Suspense>
      </SafeAntdProvider>
    </AntdRegistry>
  );
}

