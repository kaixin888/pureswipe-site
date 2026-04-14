'use client';

import React, { useEffect } from 'react';
import { Button, Result } from 'antd';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#0f172a' 
    }}>
      <Result
        status="error"
        title="clowand OS Runtime Error"
        subTitle="The Admin system encountered an unexpected error. Don't worry, your data is safe."
        extra={[
          <Button type="primary" key="retry" onClick={() => reset()} size="large">
            Reload System
          </Button>,
          <Button key="home" href="/" size="large" ghost>
            Back to Site
          </Button>,
        ]}
        style={{ color: '#fff' }}
      />
    </div>
  );
}
