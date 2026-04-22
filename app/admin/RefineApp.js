'use client';

import React from 'react';
import { Refine, Authenticated } from '@refinedev/core';
import { 
  useNotificationProvider, 
  ThemedLayout, 
  ErrorComponent, 
  AuthPage, 
  ThemedHeader,
  ThemedSider
} from '@refinedev/antd';
import { dataProvider } from '@refinedev/supabase';
import routerProvider, {
  NavigateToResource,
} from '@refinedev/nextjs-router/app';
import { createClient } from '@supabase/supabase-js';
import { ConfigProvider, theme } from 'antd';
import { Shield, Package, ShoppingCart, Activity, Users, Tag, Mail, BookOpen, Star, HelpCircle, Settings2 } from 'lucide-react';

import '@refinedev/antd/dist/reset.css';

const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY')

const Header = () => {
  return (
    <ThemedHeader
      sticky
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={20} style={{ color: '#1677ff' }} />
          <span style={{ fontWeight: 900, fontSize: '14px', letterSpacing: '-0.5px', textTransform: 'uppercase', fontStyle: 'italic' }}>
            clowand OS
          </span>
        </div>
      }
    />
  );
};

const authProvider = {
  login: async ({ password }) => {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    
    if (response.ok) {
      localStorage.setItem("clowand_admin_auth", "true");
      return { success: true, redirectTo: "/admin/orders" };
    }
    return { success: false, error: { message: "Invalid Password", name: "InvalidPassword" } };
  },
  logout: async () => {
    localStorage.removeItem("clowand_admin_auth");
    return { success: true, redirectTo: "/admin" };
  },
  check: async () => {
    const auth = typeof window !== 'undefined' ? localStorage.getItem("clowand_admin_auth") : null;
    if (auth === "true") return { authenticated: true };
    return { authenticated: false };
  },
  getPermissions: async () => null,
  getIdentity: async () => ({ id: 1, name: "Clowand Admin" }),
  onError: async (error) => {
    if (error.status === 401 || error.status === 403) {
      return { logout: true };
    }
    return { error };
  },
};

export default function RefineApp({ children }) {
  const [mounted, setMounted] = React.useState(false);
  const notificationProvider = useNotificationProvider();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ padding: '24px', background: '#0f172a', height: '100vh', color: '#fff' }}>clowand OS Loading...</div>;
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <Refine
        dataProvider={dataProvider(supabaseClient)}
        routerProvider={routerProvider}
        authProvider={authProvider}
        notificationProvider={notificationProvider}
        resources={[
        {
          name: 'products',
          list: '/admin/products',
          create: '/admin/products/create',
          edit: '/admin/products/edit/:id',
          meta: {
            canDelete: true,
            label: 'Products',
            icon: <Package size={16} />
          },
        },
        {
          name: 'orders',
          list: '/admin/orders',
          create: '/admin/orders/create',
          edit: '/admin/orders/edit/:id',
          show: '/admin/orders/show/:id',
          meta: {
            canDelete: true,
            label: 'Orders',
            icon: <ShoppingCart size={16} />
          },
        },
        {
          name: 'site_stats',
          list: '/admin/stats',
          meta: { label: 'Dashboard', icon: <Activity size={16} /> }
        },
        {
          name: 'discount_codes',
          list: '/admin/discounts',
          create: '/admin/discounts/create',
          meta: { canDelete: true, label: 'Discounts', icon: <Tag size={16} /> }
        },
        {
          name: 'subscribers',
          list: '/admin/subscribers',
          meta: { label: 'Subscribers', icon: <Mail size={16} /> }
        },
        {
          name: 'posts',
          list: '/admin/posts',
          create: '/admin/posts/create',
          edit: '/admin/posts/edit/:id',
          meta: { canDelete: true, label: 'Blog Posts', icon: <BookOpen size={16} /> }
        },
        {
          name: 'reviews',
          list: '/admin/reviews',
          create: '/admin/reviews/create',
          meta: { canDelete: true, label: 'Reviews', icon: <Star size={16} /> }
        },
        {
          name: 'faqs',
          list: '/admin/faqs',
          create: '/admin/faqs/create',
          edit: '/admin/faqs/edit/:id',
          meta: { canDelete: true, label: 'FAQs', icon: <HelpCircle size={16} /> }
        },
        {
          name: 'settings',
          list: '/admin/settings',
          meta: { label: 'Settings', icon: <Settings2 size={16} /> }
        }
      ]}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
      }}
    >
      <Authenticated fallback={<AuthPage type="login" title="clowand Admin" registerLink={false} forgotPasswordLink={false} wrapperProps={{ style: { backgroundColor: '#0f172a' } }} />}>
        <ThemedLayout Header={Header} Sider={ThemedSider}>
            {children}
        </ThemedLayout>
      </Authenticated>
    </Refine>
    </ConfigProvider>
  );
}
