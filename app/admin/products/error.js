'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Products page crash:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{
          width: 80,
          height: 80,
          margin: '0 auto 24px',
          borderRadius: '50%',
          background: '#fef2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
        }}>
          ⚠
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>
          产品页面加载异常
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>
          Admin 产品列表遇到渲染问题。请点击下方按钮重新加载，或联系技术支持。
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: '10px 32px',
            fontSize: 14,
            fontWeight: 500,
            background: '#1e40af',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
          onMouseOver={e => e.target.style.background = '#1e3a8a'}
          onMouseOut={e => e.target.style.background = '#1e40af'}
        >
          重新加载
        </button>
        <div style={{ marginTop: 24, fontSize: 11, color: '#94a3b8' }}>
          错误类型: {error?.message || '未知'}
        </div>
      </div>
    </div>
  );
}
