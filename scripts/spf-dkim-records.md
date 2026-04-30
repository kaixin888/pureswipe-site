# clowand.com DNS 记录配置

## 1. SPF（发件人策略框架）
**类型**: TXT
**名称**: @
**值**:
```
v=spf1 include:spf.resend.com include:_spf.google.com ~all
```

## 2. DKIM（域名密钥识别邮件）
**类型**: TXT
**名称**: resend._domainkey
**值**:
```
v=DKIM1; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCl+O6IxLhFfXHJz5PFQUs5PTZxCGl7k5wqyRqp3LpZL0S6zQwJRjD3FmOjGZfN5rIXJbO8YzF8w6kHZKjKPHjVnD6H7sX0vCgL3r6Tz7Op9U5UbSjPbH1zXzA8K5a5LHKxQkFZfqDRg0F08rFkI1cXmN4yOcDgVW1R0B4C9wIDAQAB
```

## 3. DMARC（域名消息认证报告与一致性）
**类型**: TXT
**名称**: _dmarc
**值**:
```
v=DMARC1; p=quarantine; rua=mailto:qufu345@gmail.com; ruf=mailto:qufu345@gmail.com; pct=100
```

## 操作步骤
1. 登录域名控制台（clowand.com 的 DNS 管理面板）
2. 添加以上 3 条 TXT 记录
3. 等待 DNS 传播（最多 48 小时）
4. 验证：访问 https://www.mail-tester.com 发送测试邮件到给出的地址

## 验证命令
```bash
# 验证 SPF
nslookup -type=TXT clowand.com

# 验证 DKIM
nslookup -type=TXT resend._domainkey.clowand.com

# 验证 DMARC
nslookup -type=TXT _dmarc.clowand.com
```
