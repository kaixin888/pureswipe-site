# 备份方案 D — Runbook

> Vercel Cron + Cloudflare R2 AES-256-GCM 加密备份  
> 每日 03:00 UTC 自动执行（北京时间 11:00）

---

## 架构

```
Supabase PostgreSQL
    │  (pg library, serverless-safe)
    ▼
SQL plaintext
    │  (AES-256-GCM, 64-char hex key)
    ▼
R2 bucket (backups/YYYY/MM/DD/clowand-YYYYMMDDTHHMMSS.sql.enc)
```

---

## 触发方式

| 方式 | 说明 |
|------|------|
| **自动（推荐）** | Vercel Cron 每日 03:00 UTC 执行，无需任何操作 |
| **手动测试** | `curl -H "Authorization: Bearer <CRON_SECRET>" https://www.clowand.com/api/cron/backup` |
| **Vercel CLI 手动触发** | `vercel env pull` 后 `vercel run dev` 本地测试 |

---

## 环境变量（按优先级）

在 Vercel 项目 Settings → Environment Variables 中配置：

| 变量名 | 必填 | 说明 | 示例 |
|--------|------|------|------|
| `CRON_SECRET` | ✅ | 鉴权密钥，任意随机字符串 | `openssl rand -hex 32` |
| `BACKUP_ENCRYPTION_KEY` | ✅ | AES-256 密钥（64 hex chars） | `openssl rand -hex 32` |
| `SUPABASE_DIRECT_URL` | 建议 | 直连 URL，覆盖自动构造 | `postgresql://postgres:[PWD]@db.xxx.supabase.co:5432/postgres` |
| `SUPABASE_SERVICE_ROLE_KEY` | 建议 | 若 SUPABASE_DIRECT_URL 未设则自动构造 | 同上 |
| `R2_ENDPOINT` | ✅ | R2 入口 | `https://[xxx].r2.cloudflarestorage.com` |
| `R2_BACKUPS_BUCKET` | ✅ | 存储桶名 | `clowand-backups` |
| `R2_BACKUPS_ACCESS_KEY_ID` | ✅ | R2 API Key ID | — |
| `R2_BACKUPS_SECRET_ACCESS_KEY` | ✅ | R2 API Key Secret | — |
| `BACKUP_SCHEMAS` | 否 | 备份哪些 schema，默认 `public,auth` | `public,auth,storage` |
| `FEISHU_WEBHOOK_URL` | 否 | 飞书通知地址，默认已有 | — |

---

## 生成密钥（一次性）

```bash
# CRON_SECRET
openssl rand -hex 32

# BACKUP_ENCRYPTION_KEY（必须存密码管理器！）
openssl rand -hex 32
```

**重要**：BACKUP_ENCRYPTION_KEY 一旦生成必须保存，后续解密也需要此密钥。

---

## 恢复流程（解密备份）

```bash
# 1. 从 R2 下载加密文件
#    浏览器打开 R2 Dashboard → 找到对应日期文件 → 下载

# 2. 解密（Node.js 或本地脚本）
node -e "
const crypto = require('crypto');
const fs = require('fs');
const raw = fs.readFileSync('clowand-YYYYMMDD.sql.enc');
const iv = raw.subarray(0, 12);
const tag = raw.subarray(12, 28);
const ct  = raw.subarray(28);
const key = Buffer.from('YOUR_64_HEX_KEY', 'hex');
const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
decipher.setAuthTag(tag);
const sql = Buffer.concat([decipher.update(ct), decipher.final()]);
fs.writeFileSync('restore.sql', sql);
"

# 3. 导入 Supabase SQL Editor
#    Dashboard → SQL Editor → 粘贴 restore.sql → Run
```

---

## 文件清单

| 文件 | 说明 |
|------|------|
| `app/api/cron/backup/route.js` | 主 Cron Handler |
| `lib/pg-export.js` | PostgreSQL DDL + 数据导出 |
| `lib/crypto-aes-gcm.js` | AES-256-GCM 加解密 |
| `vercel.json` | Cron 调度配置 |
| `docs/BACKUP_RUNBOOK.md` | 本文档 |

---

## 故障排查

| 现象 | 可能原因 | 解决 |
|------|----------|------|
| `401 Unauthorized` | CRON_SECRET 不匹配 | 确认 Vercel 环境变量与 curl 命令一致 |
| `BACKUP_ENCRYPTION_KEY env var is not set` | 未配置密钥 | 配置 `BACKUP_ENCRYPTION_KEY` |
| `R2 endpoint/bucket env vars not configured` | R2 配置缺失 | 检查 R2_ENDPOINT / R2_BUCKET |
| 无飞书通知 | FEISHU_WEBHOOK_URL 为空 | 确认或留空（会跳过通知不报错） |
| SQL 为空 | SUPABASE_DIRECT_URL 为空且无法构造 | 手动配置 SUPABASE_DIRECT_URL |

---

## 频率调整

修改 `vercel.json` 中的 `schedule` 字段：

```json
"schedule": "0 3 * * *"   // 每日 03:00 UTC
"schedule": "0 */6 * * *"  // 每 6 小时
"schedule": "0 9,15,21 * * *" // 每天 3 次（09:00/15:00/21:00 UTC）
```