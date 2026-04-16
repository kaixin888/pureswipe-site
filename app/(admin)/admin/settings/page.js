'use client';

import { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, message, Card, Typography } from 'antd';
import { createClient } from '@supabase/supabase-js';

const { Title, Text } = Typography;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const FIELDS = [
  { key: 'hero_badge', label: 'Hero Badge', placeholder: 'e.g. New Arrival', help: 'Small badge above the main title' },
  { key: 'hero_title', label: 'Hero Title', placeholder: 'Main headline on homepage', help: 'The large H1 headline', textarea: true },
  { key: 'hero_subtitle', label: 'Hero Subtitle', placeholder: 'Tagline below title', help: 'Short tagline beneath the headline', textarea: true },
  { key: 'announcement_bar', label: 'Announcement Bar', placeholder: 'Free shipping on orders over $30 | ...', help: 'Top bar text (use | to separate segments)', textarea: true },
];

export default function SettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value');
    if (error) {
      message.error('Failed to load settings');
    } else {
      const vals = {};
      (data || []).forEach(row => { vals[row.key] = row.value; });
      form.setFieldsValue(vals);
    }
    setLoading(false);
  }, [form]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  async function handleSave(values) {
    setSaving(true);
    const updates = Object.entries(values).map(([key, value]) => ({
      key,
      value: value || '',
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('site_settings')
      .upsert(updates, { onConflict: 'key' });

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
        <Title level={4} style={{ margin: 0 }}>Site Settings</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Edit homepage content. Changes are live immediately after saving.
        </Text>
      </div>

      <Card loading={loading}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          {FIELDS.map(f => (
            <Form.Item key={f.key} name={f.key} label={<strong>{f.label}</strong>} extra={<Text type="secondary" style={{ fontSize: 12 }}>{f.help}</Text>}>
              {f.textarea
                ? <Input.TextArea rows={3} placeholder={f.placeholder} />
                : <Input placeholder={f.placeholder} />
              }
            </Form.Item>
          ))}
          <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={saving} size="large">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
