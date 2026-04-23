# Clowand Supabase 备份方案修订报告 v2

> **日期**：2026-04-22
> **作者**：编程助手
> **目的**：评估《Windows 11 Supabase PostgreSQL 本地备份方案 v1.0》对 Clowand 项目的可行性，指出 5 处技术错误，并给出适配 Clowand 实际架构的修订方案。
> **结论**：原方案技术正确性 90% / 适配性 70% / 可靠性 50%。**不建议直接落地，建议改用方案 D（Vercel Cron + R2 加密备份）**。

---

## 目录
1. [执行摘要](#一执行摘要)
2. [原方案 5 处错误指认](#二原方案-5-处错误指认)
3. [Clowand 项目特殊性](#三clowand-项目特殊性)
4. [方案对比矩阵](#四方案对比矩阵)
5. [推荐方案 D：Vercel Cron + R2 加密备份](#五推荐方案-d-vercel-cron--r2-加密备份完整设计)
6. [实施步骤](#六实施步骤等用户确认后落地)
7. [应急回退](#七应急回退方案)
8. [附录：原方案修正版（如坚持本地）](#八附录原方案修正版如坚持本地)

---

## 一、执行摘要

### 1.1 方案对比快评

| 维度 | 原方案（本地 PowerShell） | 推荐方案 D（Vercel Cron + R2） |
|------|---------------------------|-------------------------------|
| 成本 | 0 元 | 0 元（复用现有 R2 + Vercel 免费额度） |
| 自动化 | ✅ 任务计划程序 | ✅ Vercel Cron 由平台保证执行 |
| 可靠性 | ⚠️ 强依赖本机长开 | ✅ 云端定时，断电/重装不影响 |
| 异地备份 | ❌ 全部在本地一块磁盘 | ✅ R2 多区域复制（Cloudflare 自带） |
| 加密 | ❌ 明文 .sql.gz | ✅ AES-256 加密 + R2 静态加密 |
| 合规（CCPA） | ⚠️ 风险 | ✅ 加密 + 访问审计 |
| 学习成本 | 中（Windows 任务计划） | 低（API 路由 + cron 配置） |
| 技术债 | 高（Windows 重装即失） | 低（基础设施即代码） |

### 1.2 核心建议

> ✅ **采用方案 D**：复用 Clowand 已有的 Cloudflare R2 桶 + Vercel Cron，零新增依赖、断电不影响、合规友好、5 分钟落地。
>
> ⚠️ **如果你仍坚持本地方案**（例如希望物理掌控备份文件），请务必应用本报告**第八章的修正版**（修正端口 6543→5432、增加 Storage/Auth 备份、AES 加密、双轨保留），不要直接抄用原文档。

---

## 二、原方案 5 处错误指认

### 错误 1：端口 6543（Pooler）不能用 pg_dump 🔴 P0

**原文（第 67、78、155 行）**：
> 端口：6543（连接池，推荐）或 5432（直连）

**真相**：Supabase Pooler 端口 6543 用 pgBouncer **transaction mode**，不支持 pg_dump 所需的 prepared statements 和 long-running session。直接用会报：

```
ERROR: prepared statement "_pg_dump_xxx" already exists
```

或

```
SSL SYSCALL error: EOF detected
```

**正确做法**：pg_dump **必须用 5432（Direct Connection）端口**，session mode pooler（端口 5432 + 用户名 `postgres.[ref]`）才行。

### 错误 2：声称 "Free Plan 无自动备份" 已过时 🟡 P1

**原文（第 24 行）**：
> Supabase Free Plan（无自动备份）

**真相**：2024 年 Q3 起，Supabase Free Plan **已包含 7 天 PITR 备份**（Point-In-Time Recovery）。Pro Plan 是 7 天 daily backup + 7 天 PITR + 14 天 PITR add-on。

**影响**：本地备份在 Clowand 场景下属于**双保险**而非"唯一备份"，重要性下调一档。但仍建议做 — 因为 Supabase 官方备份**仅限同账号同区域**，账号被封 / 区域故障时仍会丢。

### 错误 3：未备份 Storage 桶和 Auth users 🔴 P0

**原文未提及**：pg_dump 默认导出 `public` schema，不会自动包含：
- `auth.users` / `auth.sessions` 等 Auth schema 表
- `storage.objects` / `storage.buckets` 元数据
- 实际存储在 Supabase Storage 的二进制文件（图片、视频等）

**Clowand 影响**：
- ✅ 图片已迁 R2，不需要备份 Storage 二进制
- 🔴 但 `auth.users` 表存了所有客户登录账号 — **必须备份**
- 🔴 RLS 策略（行级安全）未备份 — 恢复时所有表都开放访问 = 安全灾难

**正确做法**：
- 用 `pg_dump --schema=public --schema=auth --schema=storage`
- 或用 Supabase CLI `supabase db dump --data-only --schema public,auth`（推荐，自动处理 RLS）

### 错误 4：明文存储密码与备份 🟡 P1

**原文（第 158 行）**：
```powershell
$DB_PASSWORD = "YourPassword123!"
```

**问题**：
1. 数据库密码硬编码在脚本里，任何能读 D:\\SupabaseBackup 的人都能脱库
2. 备份文件 `.sql.gz` 是明文（gzip 不是加密），含订单+用户邮箱
3. 备份磁盘被偷/被勒索病毒锁 = 数据泄漏

**Clowand 影响**：你做美国市场，订单含客户姓名+邮箱+地址 — 属于 **CCPA 个人识别信息（PII）**。明文存储违反 CCPA Section 1798.81.5（reasonable security）。

**正确做法**：
- 密码用环境变量 / Windows Credential Manager
- 备份用 OpenSSL AES-256 加密
- 解密密码不与备份文件存在同一台机器

### 错误 5：单点故障（无异地、无完整性校验、无告警）🟡 P1

**原文未实现**：
- 备份只在本机一块盘 → SSD 损坏 = 全没
- 无 SHA256 校验 → 备份悄悄损坏数年都不知道
- 无告警 → 任务失败你不知情（log 文件没人看）

**Clowand 影响**：你已有飞书 Webhook（MEMORY 中确认），原方案不接入太可惜。

**正确做法**：
- 异地：本地 + R2 双副本
- 完整性：每次备份算 SHA256 写到 manifest，恢复前比对
- 告警：失败/成功都推送飞书

---

## 三、Clowand 项目特殊性

| 项 | 现状 | 对备份方案的影响 |
|---|---|---|
| Supabase 项目 ID | `olgfqcygqzuevaftmdja` | 已知，可直接配置 |
| Supabase Plan | 待确认（推测 Free） | 决定是否需要本地方案做唯一保障 |
| 关键表 | products / orders / customers / discounts / faqs / site_settings | pg_dump --schema=public 全部覆盖 |
| 用户系统 | auth.users（含客户邮箱） | **必须备份 auth schema** |
| 图片 | 已 100% 迁 R2 | Storage 二进制不需备份，但 storage.objects 元数据可选 |
| 已有 R2 桶 | `clowand-images`，公开域 `pub-f3f9229828ae4b6691d29db0006ca32e.r2.dev` | **可复用，新增 `clowand-backups` 私有桶即可** |
| 已有 Vercel Cron | `/api/cron/abandoned-cart` 每小时跑 | **复用 Vercel Cron 基础设施，无需新主机** |
| 已有飞书 Webhook | `30ce9bd2-1eac-4dd5-a7d2-23c1fbcf1096` | **直接接入告警，零成本** |
| 已有 Sentry | Full Stack 监控 | 备份 API 异常自动捕获 |
| 用户身份 | 单人开发（常先生） | 不需要复杂权限模型 |

---

## 四、方案对比矩阵

| # | 方案 | 主体 | 触发 | 存储 | 成本 | 推荐度 |
|---|---|---|---|---|---|---|
| A | **原方案** | Windows PowerShell + pg_dump | Windows 任务计划 | 本地 D 盘 | 0 | ⭐⭐ |
| B | 本地修正版 | A + 加密 + Auth/Storage + 双轨保留 | 同上 | 本地 + 可选 R2 上传 | 0 | ⭐⭐⭐ |
| C | GitHub Actions | Linux runner + pg_dump | GitHub cron | GitHub Release（私有 repo）| 0（公共 repo 免费） | ⭐⭐⭐ |
| **D** | **Vercel Cron + R2** | Next.js API Route + node-postgres | **Vercel Cron** | **R2 私有桶（加密）** | **0** | **⭐⭐⭐⭐⭐** |
| E | Supabase CLI + 云函数 | supabase db dump | Supabase Edge Function cron | R2 / S3 | 0 | ⭐⭐⭐⭐ |

**为什么推荐 D 而不是 E？**

- E 用 Edge Function 时区/cron 配置不如 Vercel Cron 直观
- D 复用了 Clowand 已有 Vercel 基础设施，部署/监控/日志都在同一面板
- D 可以直接调 飞书 Webhook（你的现成告警通道）
- D 若失败 Sentry 自动捕获

---

## 五、推荐方案 D：Vercel Cron + R2 加密备份（完整设计）

### 5.1 架构图

```
                    ┌─────────────────┐
                    │  Vercel Cron    │
                    │  每天 03:00 UTC │  (vercel.json)
                    └────────┬────────┘
                             │ HTTP GET (含 CRON_SECRET)
                             ▼
              ┌─────────────────────────────┐
              │ /api/cron/backup            │
              │ 1. 鉴权 CRON_SECRET         │
              │ 2. 调 Supabase Direct 5432  │  (pg dump 用 node 实现)
              │ 3. 流式压缩 (gzip)          │
              │ 4. AES-256-GCM 加密         │
              │ 5. SHA256 校验              │
              │ 6. 上传 R2 私有桶           │
              │ 7. 推 manifest 到飞书       │
              └────────┬────────────────────┘
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
   ┌──────────────────┐  ┌────────────────┐
   │ R2 桶            │  │ 飞书告警       │
   │ clowand-backups  │  │ ✅ 成功摘要    │
   │ daily/2026-04-22 │  │ ❌ 失败堆栈    │
   │ weekly/2026-W17  │  └────────────────┘
   │ (Lifecycle 策略  │
   │  daily 保留30天  │
   │  weekly 保留12周)│
   └──────────────────┘
```

### 5.2 文件清单（4 个新文件 + 1 个新表）

```
app/
└── api/
    └── cron/
        └── backup/
            └── route.js              # 备份核心逻辑
lib/
├── pg-export.js                     # 用 pg 库导出 SQL（替代 pg_dump 二进制）
└── crypto-aes-gcm.js                # AES-256-GCM 加密工具
vercel.json                          # 增加 cron 配置
docs/
└── BACKUP_RUNBOOK.md                # 恢复手册
.env.local / Vercel env:
+ CRON_SECRET                        # 32 字节随机串
+ SUPABASE_DIRECT_URL                # postgresql://postgres.[ref]:[pwd]@db.[ref].supabase.co:5432/postgres
+ BACKUP_ENCRYPTION_KEY              # 32 字节十六进制
+ R2_BACKUPS_BUCKET=clowand-backups
+ R2_BACKUPS_ACCESS_KEY_ID
+ R2_BACKUPS_SECRET_ACCESS_KEY
+ FEISHU_BACKUP_WEBHOOK              # 复用现有
```

### 5.3 vercel.json Cron 配置

```json
{
  "crons": [
    {
      "path": "/api/cron/backup?type=daily",
      "schedule": "0 19 * * *"
    },
    {
      "path": "/api/cron/backup?type=weekly",
      "schedule": "0 19 * * 0"
    }
  ]
}
```

> 19:00 UTC = 03:00 北京时间（凌晨低峰）
> Daily 每天跑，weekly 周日跑

### 5.4 关键代码骨架（不实施，仅供评审）

**`app/api/cron/backup/route.js`**:
```js
import { exportSupabase } from '@/lib/pg-export';
import { encryptStream } from '@/lib/crypto-aes-gcm';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'node:crypto';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';

const gzipP = promisify(gzip);

export const maxDuration = 300; // 5 min for free plan, 60s otherwise

export async function GET(req) {
  // 1) 鉴权
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const type = new URL(req.url).searchParams.get('type') || 'daily';
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const key = `${type}/${ts}.sql.gz.enc`;

  try {
    // 2) 拉取 SQL（schema=public+auth）
    const sql = await exportSupabase({
      url: process.env.SUPABASE_DIRECT_URL,
      schemas: ['public', 'auth'],
    });

    // 3) gzip
    const gz = await gzipP(Buffer.from(sql, 'utf8'));

    // 4) AES-256-GCM
    const { ciphertext, iv, tag } = encryptStream(gz, process.env.BACKUP_ENCRYPTION_KEY);
    const finalBuf = Buffer.concat([iv, tag, ciphertext]);

    // 5) SHA256
    const sha256 = crypto.createHash('sha256').update(finalBuf).digest('hex');

    // 6) 上传 R2
    const r2 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_BACKUPS_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_BACKUPS_SECRET_ACCESS_KEY,
      },
    });
    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BACKUPS_BUCKET,
      Key: key,
      Body: finalBuf,
      Metadata: { sha256, schemas: 'public,auth', size: String(finalBuf.length) },
    }));

    // 7) 飞书告警（成功摘要）
    await notifyFeishu({
      level: 'success',
      title: `[Clowand 备份] ${type} 完成`,
      detail: `Key: ${key}\nSize: ${(finalBuf.length / 1024 / 1024).toFixed(2)} MB\nSHA256: ${sha256.slice(0,16)}...`,
    });

    return Response.json({ ok: true, key, size: finalBuf.length, sha256 });
  } catch (err) {
    await notifyFeishu({
      level: 'error',
      title: `[Clowand 备份] ${type} 失败`,
      detail: err.stack?.slice(0, 1000) || err.message,
    });
    throw err; // Sentry 兜底
  }
}
```

### 5.5 R2 桶 Lifecycle 策略

```
daily/   → 30 天后自动删除
weekly/  → 84 天后自动删除（12 周）
```

R2 控制台 → Bucket → Settings → Lifecycle Rules，无需代码。

### 5.6 恢复流程（关键 — 备份不验证 = 没备份）

```
1. 从 R2 下载 .sql.gz.enc
2. 用 BACKUP_ENCRYPTION_KEY 解密
3. SHA256 比对
4. gunzip
5. psql 灌到测试 Supabase 项目（不直接灌生产）
6. 在测试项目跑业务回归（验证关键表行数 / 抽查订单 / Auth 登录）
7. 通过后才能用于生产恢复
```

**强烈建议**：每月手动跑一次 5.6 流程到测试 Supabase 项目，否则备份等于裸奔。

---

## 六、实施步骤（等用户确认后落地）

| 步骤 | 工作 | 预计耗时 | 谁做 |
|---|---|---|---|
| 1 | Supabase Dashboard 拿 Direct Connection URL（5432） | 2 min | 常先生 |
| 2 | Cloudflare R2 创建 `clowand-backups` 私有桶 + API Token | 5 min | 常先生 |
| 3 | 生成 `CRON_SECRET` `BACKUP_ENCRYPTION_KEY`（密码管理器存好） | 2 min | 编程助手生成给你 |
| 4 | Vercel 环境变量配置（共 6 个新变量） | 3 min | 常先生 + 编程助手指导 |
| 5 | 写代码（pg-export / crypto / API route） | 30 min | 编程助手 |
| 6 | 本地 dev 跑通一次（`curl localhost:3000/api/cron/backup?type=daily`） | 10 min | 编程助手 |
| 7 | git push + Vercel 部署 | 5 min | 编程助手 |
| 8 | Vercel Cron 配置 + 手动触发首次备份 | 5 min | 编程助手 |
| 9 | R2 控制台验证文件落地 + Lifecycle 策略 | 5 min | 编程助手 |
| 10 | 写恢复手册 BACKUP_RUNBOOK.md | 15 min | 编程助手 |
| 11 | 跑一次完整恢复演练（恢复到测试 Supabase 项目） | 30 min | 常先生 + 编程助手 |
| **合计** | | **~2 小时** | |

---

## 七、应急回退方案

如果方案 D 在 Vercel 上跑不起来（比如 free plan 的 60 秒超时被触发，数据库太大），降级路径：

1. **第一备选**：方案 C — GitHub Actions（执行时长 6 小时，足够）
2. **第二备选**：方案 B — 本地修正版（你电脑作为最后保障）
3. **永远的兜底**：Supabase 官方 PITR（Free Plan 已含 7 天）

---

## 八、附录：原方案修正版（如坚持本地）

如果你出于"物理掌控"理由仍想要本地方案，请把原文档替换为以下版本：

### 8.1 端口必改

```powershell
$DB_HOST = "db.olgfqcygqzuevaftmdja.supabase.co"  # Direct host (非 pooler)
$DB_PORT = "5432"                                  # 必须 5432，6543 会报错
$DB_USER = "postgres"                              # Direct 用户名是 postgres，非 postgres.[ref]
```

### 8.2 schema 必加

```powershell
$pgDumpArgs = @(
    "-h", $DB_HOST, "-p", $DB_PORT, "-U", $DB_USER, "-d", $DB_NAME,
    "-F", "c",                    # custom 格式（比 plain 文本高效，恢复更灵活）
    "--schema=public",
    "--schema=auth",              # ← 新增
    "--no-owner", "--no-acl",
    "-v"
)
```

### 8.3 加密必加（OpenSSL）

```powershell
# 安装 OpenSSL: choco install openssl 或 winget install ShiningLight.OpenSSL
& pg_dump @pgDumpArgs | gzip | openssl enc -aes-256-cbc -salt -pbkdf2 -out $backupFile -pass file:D:\SupabaseBackup\.encrypt_key
```

> `.encrypt_key` 文件存到**别的位置**（U 盘 / 密码管理器），不和备份同盘

### 8.4 双轨保留

```powershell
# Daily：保留 30 天
$dailyDir = "D:\SupabaseBackup\daily"
# Weekly：每周日额外存一份，保留 84 天
if ((Get-Date).DayOfWeek -eq 'Sunday') {
    Copy-Item $backupFile -Destination "D:\SupabaseBackup\weekly\"
}
# 清理逻辑分别跑（30 / 84 天）
```

### 8.5 飞书告警

```powershell
function Notify-Feishu($title, $detail, $level='success') {
    $color = if ($level -eq 'success') { 'green' } else { 'red' }
    $body = @{
        msg_type = 'interactive'
        card = @{
            header = @{ title = @{ tag = 'plain_text'; content = $title }; template = $color }
            elements = @(@{ tag = 'div'; text = @{ tag = 'lark_md'; content = $detail } })
        }
    } | ConvertTo-Json -Depth 10 -Compress
    Invoke-RestMethod -Uri 'https://open.feishu.cn/open-apis/bot/v2/hook/30ce9bd2-1eac-4dd5-a7d2-23c1fbcf1096' -Method Post -Body $body -ContentType 'application/json'
}
```

### 8.6 SHA256 校验

```powershell
$sha = (Get-FileHash $backupFile -Algorithm SHA256).Hash
Add-Content "$BACKUP_DIR\manifest.txt" "$timestamp $sha $backupFile"
```

### 8.7 异地副本（可选 — 同步到 R2）

```powershell
# 用 rclone（开源，免费）：rclone copy $backupFile r2:clowand-backups/daily/
```

---

## 九、最终建议（决策表）

| 你的情况 | 推荐方案 |
|---|---|
| 想最稳、最现代、零运维 | **方案 D** |
| 已有专门长开主机/NAS，想本地物理掌控 | **方案 B（附录修正版）** |
| 不想动 Vercel 配置，但有 GitHub | **方案 C** |
| 临时应急、3 天内必须有备份 | **先开 Supabase Dashboard 的 PITR，再搞方案 D** |

---

## 十、行动建议（给常先生）

请回复：

- **A** 上方案 D（推荐，2 小时落地）
- **B** 上方案 B（本地修正版，1 小时落地）
- **C** 先做 5 分钟兜底：去 Supabase Dashboard 开 PITR + 截图给我，再决定 D 还是 B
- **D** 暂不实施，先看本报告

我的建议：**先 C 后 A** — 5 分钟开 PITR 解决"今天就要有备份"的焦虑，再花 2 小时把方案 D 落地做长期保障。

