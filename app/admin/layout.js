'use client';

import React from 'react';
import RefineApp from './RefineApp';
import { AntdRegistry } from "@ant-design/nextjs-registry";

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <RefineApp>
            {children}
          </RefineApp>
        </AntdRegistry>
      </body>
    </html>
  );
}
