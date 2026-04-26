'use client';

import React from 'react';

/**
 * SafeAntdProvider — wraps Ant Design components to catch React ref-related
 * rendering crashes (notably `Cannot create property 'current' on boolean 'false'`
 * which occurs in Ant Design's Wave/motion components under certain Next.js builds).
 *
 * This component renders a plain fallback div around any child that crashes,
 * instead of the entire page white-screening.
 */
export default class SafeAntdProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[SafeAntd] Caught render error:', error?.message);
    console.error('[SafeAntd] Component stack:', info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}>
            <h3 style={{ margin: '0 0 8px', color: '#991b1b', fontSize: 15, fontWeight: 600 }}>
              组件渲染异常
            </h3>
            <p style={{ margin: 0, color: '#b91c1c', fontSize: 13 }}>
              {this.state.error?.message || '渲染过程中发生错误'}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '8px 20px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              background: '#fff',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
