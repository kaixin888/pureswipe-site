'use client';

import React from 'react';
import { Refine, Authenticated } from '@refinedev/core';
import { useNotificationProvider, ThemedLayout, ErrorComponent, AuthPage, ThemedHeader } from '@refinedev/antd';
import { dataProvider } from '@refinedev/supabase';
import routerProvider, {
  NavigateToResource,
} from '@refinedev/nextjs-router/app';
import { createClient } from '@supabase/supabase-js';
import { Shield, Package, ShoppingCart, Activity, Users } from 'lucide-react';

import '@refinedev/antd/dist/reset.css';

const supabaseUrl = 'https://olgfqcygqzuevaftmdja.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

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
    if (password === "clowand888") {
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
    return { authenticated: false, redirectTo: "/admin" };
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
  const notificationProvider = useNotificationProvider();

  return (
    <Refine
      dataProvider={dataProvider(supabaseClient)}
      routerProvider={routerProvider}
      authProvider={authProvider}
      notificationProvider={notificationProvider}
      resources={[
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
          meta: {
            label: 'Dashboard',
            icon: <Activity size={16} />
          }
        }
      ]}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
      }}
    >
      <Authenticated fallback={<AuthPage type="login" title="clowand Admin" registerLink={false} forgotPasswordLink={false} wrapperProps={{ style: { backgroundColor: '#0f172a' } }} />}>

        <ThemedLayout Header={Header}>
            {children}
        </ThemedLayout>
      </Authenticated>
    </Refine>
  );
}
