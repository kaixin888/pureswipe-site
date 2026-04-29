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
import zhCN from 'antd/locale/zh_CN';
import { Shield, Package, ShoppingCart, Activity, Users, Tag, Mail, BookOpen, Star, HelpCircle, Settings2, Archive, Image as ImageIcon, LogIn, ClipboardList, UserCog, Globe, Smartphone } from 'lucide-react';

import '@refinedev/antd/dist/reset.css';

const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY')

// ----- Refine i18nProvider: minimal Chinese dictionary -----
// Translates List page titles ("Products" -> "商品列表"), action buttons
// ("Create / Edit / Delete / Save / Refresh / Export"), and confirm dialogs.
const zhDict = {
  buttons: {
    create: '新建',
    save: '保存',
    logout: '退出登录',
    delete: '删除',
    edit: '编辑',
    cancel: '取消',
    confirm: '确认',
    filter: '筛选',
    clear: '清空',
    refresh: '刷新',
    show: '查看',
    undo: '撤销',
    import: '导入',
    clone: '克隆',
    notAccessTitle: '无权访问',
    export: '导出',
  },
  warnWhenUnsavedChanges: '您有未保存的更改，确定要离开吗？',
  notifications: {
    success: '操作成功',
    error: '操作失败 (状态码: {{statusCode}})',
    undoable: '{{seconds}} 秒后生效，点击撤销',
    createSuccess: '{{resource}} 创建成功',
    createError: '{{resource}} 创建失败 (状态码: {{statusCode}})',
    deleteSuccess: '{{resource}} 删除成功',
    deleteError: '{{resource}} 删除失败 (状态码: {{statusCode}})',
    editSuccess: '{{resource}} 已更新',
    editError: '{{resource}} 更新失败 (状态码: {{statusCode}})',
    importProgress: '正在导入：{{processed}}/{{total}}',
  },
  loading: '加载中…',
  tags: { clone: '克隆' },
  dashboard: { title: '仪表盘' },
  posts: { posts: '博客文章' },
  table: { actions: '操作' },
  // Resource page titles. Keys match resource.name; suffixes match Refine convention.
  products: { products: '商品', titles: { list: '商品列表', create: '新建商品', edit: '编辑商品', show: '商品详情' } },
  orders: { orders: '订单', titles: { list: '订单列表', create: '新建订单', edit: '编辑订单', show: '订单详情' } },
  site_stats: { site_stats: '仪表盘', titles: { list: '仪表盘' } },
  discount_codes: { discount_codes: '折扣码', titles: { list: '折扣码', create: '新建折扣码' } },
  subscribers: { subscribers: '订阅用户', titles: { list: '订阅用户' } },
  reviews: { reviews: '商品评价', titles: { list: '商品评价', create: '新建评价' } },
  faqs: { faqs: '常见问题', titles: { list: '常见问题', create: '新建问题', edit: '编辑问题' } },
  inventory: { inventory: '库存管理', titles: { list: '库存管理', edit: '调整库存' } },
  'site_images': { 'site_images': '站点图片', titles: { list: '站点图片管理', edit: '编辑图片', create: '新建图片插槽' } },
  settings: { settings: '系统设置', titles: { list: '系统设置' } },
  documentTitle: {
    default: 'clowand 管理后台',
    suffix: ' | clowand OS',
    products: { list: '商品列表 | clowand OS', create: '新建商品 | clowand OS', edit: '编辑商品 | clowand OS' },
    orders:   { list: '订单列表 | clowand OS', show: '订单详情 | clowand OS', edit: '编辑订单 | clowand OS' },
    posts:    { list: '博客文章 | clowand OS', create: '新建文章 | clowand OS', edit: '编辑文章 | clowand OS' },
  },
};

// Tiny "t-style" lookup that resolves dotted keys ("buttons.save")
// against zhDict, falls back to defaultMessage, and substitutes
// {{var}} placeholders. Keeps us free of any i18n runtime dependency.
const translate = (key, options, defaultMessage) => {
  // Refine sometimes calls translate(key, defaultMessage) (no options).
  if (typeof options === 'string') {
    defaultMessage = options;
    options = undefined;
  }
  const parts = (key || '').split('.');
  let value = zhDict;
  for (const part of parts) {
    value = value && typeof value === 'object' ? value[part] : undefined;
    if (value === undefined) break;
  }
  if (typeof value !== 'string') {
    return defaultMessage !== undefined ? defaultMessage : key;
  }
  if (options && typeof options === 'object') {
    return value.replace(/\{\{(\w+)\}\}/g, (_, k) => (options[k] !== undefined ? options[k] : `{{${k}}}`));
  }
  return value;
};

const i18nProvider = {
  translate,
  changeLocale: () => Promise.resolve(),
  getLocale: () => 'zh',
};

// ----- 角色权限定义 -----
const ROLE_HIERARCHY = {
  super_admin: 100,
  admin: 80,
  operator: 60,
  support: 40,
};

// 每个角色可访问的资源列表（名称对应 resource.name）
const ROLE_RESOURCES = {
  super_admin: [
    'products', 'orders', 'site_stats', 'discount_codes', 'subscribers',
    'posts', 'reviews', 'faqs', 'inventory', 'site_images', 'settings',
    'user_profiles', 'user_sessions', 'login_logs', 'audit_logs',
  ],
  admin: [
    'products', 'orders', 'site_stats', 'discount_codes', 'subscribers',
    'posts', 'reviews', 'faqs', 'inventory', 'site_images', 'settings',
    'user_profiles', 'user_sessions', 'login_logs', 'audit_logs',
  ],
  operator: [
    'products', 'orders', 'site_stats',
    'posts', 'reviews', 'faqs', 'inventory',
  ],
  support: [
    'orders', 'site_stats', 'reviews', 'faqs',
  ],
};

// 每个角色可执行的操作（action）
const ROLE_ACTIONS = {
  super_admin: ['list', 'create', 'edit', 'show', 'delete', 'clone', 'export'],
  admin: ['list', 'create', 'edit', 'show', 'delete', 'export'],
  operator: ['list', 'show', 'edit'],
  support: ['list', 'show'],
};

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
    return { success: false, error: { message: "密码错误", name: "InvalidPassword" } };
  },
  logout: async () => {
    localStorage.removeItem("clowand_admin_auth");
    return { success: true, redirectTo: "/admin" };
  },
  check: async () => {
    // 检查 Supabase 会话 + 本地存储
    const { data } = await supabaseClient.auth.getSession();
    if (data?.session) {
      // 同步更新本地标记
      localStorage.setItem("clowand_admin_auth", "true");
      return { authenticated: true };
    }
    const auth = typeof window !== 'undefined' ? localStorage.getItem("clowand_admin_auth") : null;
    if (auth === "true") return { authenticated: true };
    return { authenticated: false };
  },
  getPermissions: async () => {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return { role: 'admin' }; // fallback for legacy admin page
      
      const { data: profile } = await supabaseClient
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      return { role: profile?.role || 'admin' };
    } catch {
      return { role: 'admin' };
    }
  },
  getIdentity: async () => {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return { id: 1, name: "Clowand 管理员" };
      
      const { data: profile } = await supabaseClient
        .from('user_profiles')
        .select('display_name, role')
        .eq('user_id', user.id)
        .single();
      
      return {
        id: user.id,
        name: profile?.display_name || user.email || '管理员',
        avatar: null,
      };
    } catch {
      return { id: 1, name: "Clowand 管理员" };
    }
  },
  onError: async (error) => {
    if (error.status === 401 || error.status === 403) {
      return { logout: true };
    }
    return { error };
  },
};

// ----- accessControlProvider（按角色权限表控制）-----
const accessControlProvider = {
  can: async ({ resource, action, params }) => {
    // 从权限中获取角色
    let role = 'admin';
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        const { data: profile } = await supabaseClient
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        if (profile?.role) role = profile.role;
      }
    } catch {}

    const canAccessResource = ROLE_RESOURCES[role]?.includes(resource) ?? false;
    const canPerformAction = ROLE_ACTIONS[role]?.includes(action) ?? false;

    return {
      can: canAccessResource && canPerformAction,
      reason: canAccessResource
        ? '角色权限不足'
        : '无权访问此模块',
    };
  },
  options: {
    buttons: {
      hide: true,  // 无权时隐藏按钮
    },
    disableNavigate: true,  // 无权时阻止导航
  },
};

// ----- 按角色过滤资源（影响侧边栏菜单显示）-----
const ALL_RESOURCES = [
  {
    name: 'products',
    list: '/admin/products',
    create: '/admin/products/create',
    edit: '/admin/products/edit/:id',
    meta: { canDelete: true, label: '商品管理', icon: <Package size={16} /> },
  },
  {
    name: 'orders',
    list: '/admin/orders',
    create: '/admin/orders/create',
    edit: '/admin/orders/edit/:id',
    show: '/admin/orders/show/:id',
    meta: { canDelete: true, label: '订单管理', icon: <ShoppingCart size={16} /> },
  },
  {
    name: 'site_stats',
    list: '/admin/stats',
    meta: { label: '数据看板', icon: <Activity size={16} /> }
  },
  {
    name: 'discount_codes',
    list: '/admin/discounts',
    create: '/admin/discounts/create',
    meta: { canDelete: true, label: '折扣码', icon: <Tag size={16} /> }
  },
  {
    name: 'subscribers',
    list: '/admin/subscribers',
    meta: { label: '订阅用户', icon: <Mail size={16} /> }
  },
  {
    name: 'posts',
    list: '/admin/posts',
    create: '/admin/posts/create',
    edit: '/admin/posts/edit/:id',
    meta: { canDelete: true, label: '博客文章', icon: <BookOpen size={16} /> }
  },
  {
    name: 'reviews',
    list: '/admin/reviews',
    create: '/admin/reviews/create',
    meta: { canDelete: true, label: '商品评价', icon: <Star size={16} /> }
  },
  {
    name: 'faqs',
    list: '/admin/faqs',
    create: '/admin/faqs/create',
    edit: '/admin/faqs/edit/:id',
    meta: { canDelete: true, label: '常见问题', icon: <HelpCircle size={16} /> }
  },
  {
    name: 'inventory',
    list: '/admin/inventory',
    edit: '/admin/inventory/edit/:id',
    meta: { canDelete: true, label: '库存管理', icon: <Archive size={16} /> },
  },
  {
    name: 'site_images',
    list: '/admin/site-images',
    edit: '/admin/site-images/edit/:id',
    meta: { label: '站点图片', icon: <ImageIcon size={16} /> }
  },
  {
    name: 'login_logs',
    list: '/admin/login-logs',
    meta: { label: '登录日志', icon: <LogIn size={16} /> }
  },
  {
    name: 'audit_logs',
    list: '/admin/audit-logs',
    meta: { label: '审计日志', icon: <ClipboardList size={16} /> }
  },
  {
    name: 'user_profiles',
    list: '/admin/users',
    meta: { label: '用户管理', icon: <UserCog size={16} /> }
  },
  {
    name: 'user_sessions',
    list: '/admin/sessions',
    meta: { label: '会话管理', icon: <Smartphone size={16} /> }
  },
  {
    name: 'settings',
    list: '/admin/settings',
    meta: { label: '系统设置', icon: <Settings2 size={16} /> }
  },
];

export default function RefineApp({ children }) {
  const [mounted, setMounted] = React.useState(false);
  const [filteredResources, setFilteredResources] = React.useState(ALL_RESOURCES);
  const notificationProvider = useNotificationProvider();

  React.useEffect(() => { setMounted(true); }, []);

  // 根据角色过滤侧边栏菜单
  React.useEffect(() => {
    if (!mounted) return;
    supabaseClient.auth.getUser().then(({ data }) => {
      if (!data?.user) return;
      supabaseClient
        .from('user_profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          const role = profile?.role || 'admin';
          const allowed = ROLE_RESOURCES[role] || ROLE_RESOURCES.admin;
          setFilteredResources(ALL_RESOURCES.filter((r) => allowed.includes(r.name)));
        })
        .catch(() => {});
    });
  }, [mounted]);

  if (!mounted) {
    return <div style={{ padding: '24px', background: '#0f172a', height: '100vh', color: '#fff' }}>clowand OS 加载中...</div>;
  }

  return (
    <ConfigProvider
      locale={zhCN}
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
        accessControlProvider={accessControlProvider}
        notificationProvider={notificationProvider}
        i18nProvider={i18nProvider}
        resources={filteredResources}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
        }}
      >
        <Authenticated fallback={<AuthPage type="login" title="clowand 管理后台" registerLink={false} forgotPasswordLink={false} wrapperProps={{ style: { backgroundColor: '#0f172a' } }} />}>
          <ThemedLayout Header={Header} Sider={ThemedSider}>
              {children}
          </ThemedLayout>
        </Authenticated>
      </Refine>
    </ConfigProvider>
  );
}