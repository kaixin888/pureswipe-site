-- supabase/migrations/20260503_add_api_usage_log.sql
-- API 调用用量日志表 — 记录所有第三方 API 调用，用于用量监控和限额预警

CREATE TABLE IF NOT EXISTS api_usage_log (
  id          BIGSERIAL PRIMARY KEY,
  api_name    TEXT NOT NULL,           -- api-config.ts 中的 API 标识
  endpoint    TEXT NOT NULL,           -- 实际请求 URL
  status_code INTEGER,                -- HTTP 状态码 (0=超时/网络错误)
  duration_ms INTEGER,                 -- 请求耗时（毫秒）
  error       TEXT,                    -- 错误信息（null = 成功）
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 加速按 API 名称 + 时间范围的查询（用量面板）
CREATE INDEX IF NOT EXISTS idx_api_usage_api_name_created
  ON api_usage_log (api_name, created_at DESC);

-- 加速每日汇总查询
CREATE INDEX IF NOT EXISTS idx_api_usage_created
  ON api_usage_log (created_at DESC);

-- RLS 开放：服务端 api-wrapper 使用 SERVICE_ROLE_KEY 写入
ALTER TABLE api_usage_log ENABLE ROW LEVEL SECURITY;

-- 允许 service_role 写入（api-wrapper 使用它）
CREATE POLICY "service_role_write_api_usage"
  ON api_usage_log
  FOR INSERT
  WITH CHECK (true);

-- 仅管理员可读
CREATE POLICY "admin_read_api_usage"
  ON api_usage_log
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

COMMENT ON TABLE api_usage_log IS 'API 调用用量日志 — 记录所有第三方 API 请求的耗时、状态码和错误信息';
