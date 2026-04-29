'use client';

import { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, message, Card, Typography, Tabs, Tag, Space, Alert } from 'antd';
import { createClient } from '@supabase/supabase-js';

const { Title, Text } = Typography;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY',
);

const FIELDS = [
  { key: 'hero_badge', label: 'Hero Badge', placeholder: 'e.g. New Arrival', help: 'Small badge above the main title' },
  { key: 'hero_title', label: 'Hero Title', placeholder: 'Main headline on homepage', help: 'The large H1 headline', textarea: true },
  { key: 'hero_subtitle', label: 'Hero Subtitle', placeholder: 'Tagline below title', help: 'Short tagline beneath the headline', textarea: true },
  { key: 'announcement_bar', label: 'Announcement Bar', placeholder: 'Free shipping on orders over $30 | ...', help: 'Top bar text (use | to separate segments)', textarea: true },
];

function SiteSettingsTab({ form, loading, saving, handleSave }) {
  return (
    <Card loading={loading}>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        {FIELDS.map((f) => (
          <Form.Item
            key={f.key}
            name={f.key}
            label={<strong>{f.label}</strong>}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {f.help}
              </Text>
            }
          >
            {f.textarea ? (
              <Input.TextArea rows={3} placeholder={f.placeholder} />
            ) : (
              <Input placeholder={f.placeholder} />
            )}
          </Form.Item>
        ))}
        <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={saving} size="large">
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

function SecuritySettingsTab() {
  const [user, setUser] = useState(null);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [secret, setSecret] = useState('');
  const [otpauth, setOtpauth] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [codesRevealed, setCodesRevealed] = useState(false);
  const [verifyToken, setVerifyToken] = useState('');
  const [step, setStep] = useState('check');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        checkTotpStatus(data.user.id);
      }
    });
  }, []);

  const checkTotpStatus = async (userId) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('totp_enabled')
      .eq('user_id', userId)
      .single();
    if (data?.totp_enabled) {
      setTotpEnabled(true);
      setStep('done');
    }
  };

  const handleSetup = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/totp-setup?user_id=${user.id}`);
      const data = await res.json();
      if (data.error) {
        message.error(data.error);
      } else {
        setSecret(data.secret);
        setOtpauth(data.otpauth);
        setBackupCodes(data.backup_codes);
        setStep('verify');
      }
    } catch (e) {
      message.error('Failed to generate TOTP secret');
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    const res = await fetch('/api/totp-setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, token: verifyToken }),
    });
    const data = await res.json();
    if (data.ok) {
      setTotpEnabled(true);
      setStep('done');
      setCodesRevealed(true);
      message.success('TOTP 双因素认证已启用！');
    } else {
      message.error(data.error || '验证码错误');
    }
    setLoading(false);
  };

  const handleDisable = async () => {
    await supabase.from('authenticator_secrets').update({ enabled: false }).eq('user_id', user.id);
    await supabase.from('user_profiles').update({ totp_enabled: false }).eq('user_id', user.id);
    setTotpEnabled(false);
    setStep('check');
    setSecret('');
    setOtpauth('');
    setBackupCodes([]);
    setCodesRevealed(false);
    message.success('TOTP 已禁用');
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ margin: 0 }}>
            双因素认证 (TOTP)
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            使用 Google Authenticator / Authy 等 TOTP 应用增加登录安全性
          </Text>
        </div>

        {step === 'check' && (
          <div>
            <Alert
              message="当前未启用 2FA"
              description="启用后，每次登录需要输入验证器中的 6 位动态码"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Button type="primary" onClick={handleSetup} loading={loading}>
              开启双因素认证
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div>
            <Alert
              message="扫描二维码或手动输入密钥"
              description="打开验证器应用（如 Google Authenticator），扫描下方二维码，或手动输入密钥"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            {otpauth && (
              <div style={{ textAlign: 'center', margin: '24px 0' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`}
                  alt="TOTP QR Code"
                  style={{ borderRadius: 12, border: '2px solid #f0f0f0' }}
                />
              </div>
            )}

            {secret && (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 11 }}>
                  手动密钥：
                </Text>
                <div
                  style={{
                    background: '#f5f5f5',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontFamily: 'monospace',
                    fontSize: 13,
                    marginTop: 4,
                    wordBreak: 'break-all',
                  }}
                >
                  {secret}
                </div>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <Text strong style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>
                输入验证器中的 6 位代码以确认：
              </Text>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  maxLength={6}
                  placeholder="000000"
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ textAlign: 'center', fontSize: 18, letterSpacing: 8, fontFamily: 'monospace' }}
                />
                <Button
                  type="primary"
                  onClick={handleVerify}
                  loading={loading}
                  disabled={verifyToken.length !== 6}
                >
                  验证并启用
                </Button>
              </Space.Compact>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div>
            <Alert
              message="双因素认证已启用"
              description="登录时需要输入 TOTP 验证码"
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />

            {codesRevealed && backupCodes.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 11 }}>
                  备用恢复码（请妥善保存）：
                </Text>
                <div
                  style={{
                    background: '#fff7e6',
                    padding: 12,
                    borderRadius: 8,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    marginTop: 4,
                    border: '1px solid #ffd591',
                  }}
                >
                  {backupCodes.map((c, i) => (
                    <div key={i} style={{ marginBottom: 4 }}>
                      {i + 1}. {c.match(/.{5}/g)?.join('-')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button danger onClick={handleDisable}>
              禁用双因素认证
            </Button>
          </div>
        )}

        {totpEnabled && (
          <div style={{ marginTop: 16 }}>
            <Tag color="green" style={{ fontSize: 11, padding: '2px 8px' }}>
              {'\u2713'} 2FA 已启用
            </Tag>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('site_settings').select('key, value');
    if (error) {
      message.error('Failed to load settings');
    } else {
      const vals = {};
      (data || []).forEach((row) => {
        vals[row.key] = row.value;
      });
      form.setFieldsValue(vals);
    }
    setLoading(false);
  }, [form]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function handleSave(values) {
    setSaving(true);
    const updates = Object.entries(values).map(([key, value]) => ({
      key,
      value: value || '',
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('site_settings').upsert(updates, { onConflict: 'key' });

    if (error) {
      message.error('Save failed: ' + error.message);
    } else {
      message.success('Settings saved! Changes will be visible on the homepage.');
    }
    setSaving(false);
  }

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          系统设置
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          站点内容与安全设置
        </Text>
      </div>

      <Tabs
        defaultActiveKey="site"
        items={[
          {
            key: 'site',
            label: '站点设置',
            children: <SiteSettingsTab form={form} loading={loading} saving={saving} handleSave={handleSave} />,
          },
          {
            key: 'security',
            label: '安全设置',
            children: <SecuritySettingsTab />,
          },
        ]}
      />
    </div>
  );
}
