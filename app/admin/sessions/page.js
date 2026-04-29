"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LogOut, Smartphone, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
);

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) return router.push('/login');
      setUser(data.user);
      loadSessions(data.user.id);
    });
  }, []);

  const loadSessions = async (userId) => {
    setLoading(true);
    const { data } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setSessions(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    // 删除当前 session
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (token) {
      await supabase.from('user_sessions').delete().eq('token', token);
    }
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleForceLogout = async (sessionId) => {
    await supabase.from('user_sessions').delete().eq('id', sessionId);
    loadSessions(user.id);
  };

  const handleForceLogoutAll = async () => {
    await supabase.from('user_sessions').delete().eq('user_id', user.id);
    await supabase.auth.signOut();
    router.push('/login');
  };

  const currentToken = async () => {
    const s = await supabase.auth.getSession();
    return s.data.session?.access_token;
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">会话管理</h1>
          <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">
            Active Sessions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            <LogOut size={14} /> 退出当前
          </button>
          <button
            onClick={handleForceLogoutAll}
            className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
          >
            <LogOut size={14} /> 全部强制下线
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs font-black text-slate-300 uppercase tracking-widest">
          加载中...
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20">
          <Smartphone className="mx-auto text-slate-200 mb-4" size={48} />
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">
            暂无活跃会话
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <Smartphone className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {s.device_info || '未知设备'}
                  </p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {s.ip_address || '未知 IP'} ·{' '}
                    {s.expires_at
                      ? `过期 ${new Date(s.expires_at).toLocaleString('zh-CN')}`
                      : '永不过期'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {s.is_active && (
                  <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-wider">
                    活跃
                  </span>
                )}
                <button
                  onClick={() => handleForceLogout(s.id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
