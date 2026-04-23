# Clowand Supabase 备份系统 — 凭据与配置清单

> **生成日期**：2026-04-23
> **用途**：方案 D（Vercel Cron + R2 加密备份）全部凭据集中管理
> **⚠️ 警告**：本文件含真实密钥/密码，**禁止上传到 GitHub / 任何 AI 平台 / 截图分享 / 聊天窗口**

---

## 一、Supabase 数据库

| 项 | 值 |
|---|---|
| 项目 ID | `olgfqcygqzuevaftmdja` |
| 项目地区 | aws-1-us-east-1 |
| 数据库密码 | `vP8#m2L!k9*R4q$T1z&W7xY9b2` |
| Direct Connection URL (5432) | `postgresql://postgres:vP8%23m2L%21k9%2AR4q%24T1z%26W7xY9b2@db.olgfqcygqzuevaftmdja.supabase.co:5432/postgres` |
| Pooler URL (6543, 事务模式) | `postgresql://postgres.olgfqcygqzuevaftmdja:vP8%23m2L%21k9%2AR4q%24T1z%26W7xY9b2@aws-1-us-east-1.pooler.supabase.com:6543/postgres` |

**说明**：
- Direct URL（5432）用于备份脚本 `pg-export.js`，**不能用 Pooler 6543**
- URL 中密码已做 percent-encoding：`#`→`%23` `!`→`%21` `*`→`%2A` `$`→`%24` `&`→`%26`
- 密码为 2026-04-23 重设，原密码已失效

---

## 二、备份加密密钥

| 项 | 值 |
|---|---|
| `CRON_SECRET` | `9ee4c8db4c6f1d0be5fd6854a1c37c4183e779abe8f865868020ea001ba4a6d2` |
| `BACKUP_ENCRYPTION_KEY` | `96e5af4668658b5d0bd86f96703cefa547823c37faf8d9938819fa2fa5cd7fc5` |

**说明**：
- `CRON_SECRET`：Vercel Cron 调用 `/api/cron/backup` 时的鉴权令牌（Bearer Token）
- `BACKUP_ENCRYPTION_KEY`：AES-256-GCM 加密的 32 字节密钥（hex 格式）
- **🔴 密钥丢了 = 备份永远无法解密！务必存到 1Password / 物理打印 / U 盘离线保存**

---

## 三、Cloudflare R2 备份桶

| 项 | 值 |
|---|---|
| Cloudflare Account ID | `815cda625ddb970b925d0a2c77fc2309` |
| R2 Endpoint | `https://815cda625ddb970b925d0a2c77fc2309.r2.cloudflarestorage.com` |
| 备份桶名称 | `clowand-backups` |
| R2 API Token 名称 | `clowand-backups-token` |
| Access Key ID | `86b3ca688493ac27f3802ed7288b17b6` |
| Secret Access Key | `269c53275b2fd07e4992af2f0656d9fbe6b1cde2986018c7c60591522de82aed` |
| 权限范围 | Object Read & Write（仅 `clowand-backups` 桶） |

**说明**：
- 与现有图片桶 `clowand-images` 分离，备份桶为私有（无公开域）
- API Token 权限最小化，仅限备份桶读写

---

## 四、Vercel 环境变量清单

以下 8 个变量已配置到 Vercel 项目 `pureswipe-site` 的 **Production** 环境：

| # | Key | Value | 备注 |
|---|-----|-------|------|
| 1 | `CRON_SECRET` | `9ee4c8db...` (见上方) | Cron 鉴权 |
| 2 | `BACKUP_ENCRYPTION_KEY` | `96e5af46...` (见上方) | AES-256 加密密钥 |
| 3 | `SUPABASE_DIRECT_URL` | `postgresql://postgres:vP8%23...@db.olgfqcygqzuevaftmdja.supabase.co:5432/postgres` | 直连 URL，端口 5432 |
| 4 | `CF_ACCOUNT_ID` | `815cda625ddb970b925d0a2c77fc2309` | Cloudflare 账号 ID |
| 5 | `R2_ENDPOINT` | `https://815cda625ddb970b925d0a2c77fc2309.r2.cloudflarestorage.com` | R2 S3 兼容端点 |
| 6 | `R2_BACKUPS_BUCKET` | `clowand-backups` | 备份桶名 |
| 7 | `R2_BACKUPS_ACCESS_KEY_ID` | `86b3ca688493ac27f3802ed7288b17b6` | R2 访问密钥 ID |
| 8 | `R2_BACKUPS_SECRET_ACCESS_KEY` | `269c53275b2fd07e4992af2f0656d9fbe6b1cde2986018c7c60591522de82aed` | R2 访问密钥 Secret |

---

## 五、飞书告警通道（复用现有）

| 项 | 值 |
|---|---|
| Webhook URL | `https://open.feishu.cn/open-apis/bot/v2/hook/30ce9bd2-1eac-4dd5-a7d2-23c1fbcf1096` |
| Webhook Secret | `EJlDQOP2AfDEo8EyX7HnOg` |
| 告警格式 | 成功 = 绿色摘要（大小/SHA256/路径），失败 = 红色堆栈 |

---

## 六、R2 Lifecycle 策略（待配置）

> ⚠️ 尚未在 Cloudflare 后台配置，需手动操作或编程助手浏览器协助

| 路径前缀 | 保留天数 | 说明 |
|----------|---------|------|
| `daily/` | 30 天 | 每日备份，30 天后自动删除 |
| `weekly/` | 84 天（12 周） | 每周日备份，84 天后自动删除 |

配置位置：Cloudflare Dashboard → R2 → `clowand-backups` 桶 → Settings → Lifecycle Rules

---

## 七、密码安全保管建议

| 凭据 | 建议保管方式 |
|------|-------------|
| Supabase DB 密码 `vP8#m2L!...` | 1Password / Bitwarden |
| `BACKUP_ENCRYPTION_KEY` | 1Password + 物理打印存保险柜（密钥丢 = 数据永远不可恢复） |
| R2 Access Key + Secret | 1Password（与图片桶凭据分开记录） |
| `CRON_SECRET` | 1Password（泄露后任何人都可触发备份接口） |

**🔴 绝对禁止**：
- 把本文件 commit 到 Git
- 把本文件内容发给任何 AI 聊天窗口
- 对本文件截图并分享
- 把密钥和备份文件存在同一台机器

---

## 八、快速参考 — 恢复时用

解密备份文件的命令：

```bash
# Node.js 解密示例（需 BACKUP_ENCRYPTION_KEY）
node -e "
  const crypto = require('crypto');
  const key = Buffer.from('YOUR_BACKUP_ENCRYPTION_KEY', 'hex');
  const enc = Buffer.from('backup_file_content'); // 从 R2 下载的二进制
  const iv = enc.slice(0, 16);
  const tag = enc.slice(16, 32);
  const ciphertext = enc.slice(32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  console.log(decrypted.length); // 解密后 gzip 大小
"
```

恢复完整流程见：`docs/BACKUP_RUNBOOK.md`（待写）