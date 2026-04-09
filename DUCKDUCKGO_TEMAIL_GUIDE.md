# DuckDuckGo + TEmail 自动验证码使用指南

## 🎯 功能概述

DuckDuckGo + TEmail 组合模式是本插件最强大的功能，实现了完全自动化的验证码获取：

- ✅ 自动创建 DuckDuckGo 邮箱别名
- ✅ 邮件自动转发到 TEmail
- ✅ 自动获取验证码，无需手动填写
- ✅ 支持多窗口并发注册
- ✅ 极简时间过滤，稳定可靠

## 📋 前置准备

### 1. 获取 DuckDuckGo Token

1. 访问 [DuckDuckGo Email Protection](https://duckduckgo.com/email/)
2. 登录你的 DuckDuckGo 账号
3. 进入设置页面，生成 API Token
4. 复制 Token 备用

### 2. 配置 TEmail 邮箱

#### 方式一：使用默认配置（推荐）

默认配置已经可用，无需额外设置：
- 服务器地址：`https://email.chaijz.top`
- 邮箱地址：`dkdkgo@chaijz.top`

你只需要获取该邮箱的认证信息（JWT Token 或 Admin 密码）。

#### 方式二：自建 TEmail 服务

如果你想使用自己的 TEmail 服务器：
1. 部署 TEmail 服务（参考 [TEmail 文档](https://github.com/dreamhunter2333/cloudflare_temp_email)）
2. 创建一个专用邮箱用于接收 DuckDuckGo 转发的邮件
3. 获取该邮箱的 JWT Token 或 Admin 密码

### 3. 配置 DuckDuckGo 邮件转发

1. 登录 DuckDuckGo Email Protection
2. 进入设置 → 转发规则
3. 添加转发规则：将所有邮件转发到 `dkdkgo@chaijz.top`（或你的 TEmail 邮箱）

## 🚀 插件配置步骤

### 步骤 1：选择邮箱模式

1. 打开插件弹窗
2. 在「邮箱配置」区域，选择「DuckDuckGo」模式

### 步骤 2：配置 DuckDuckGo Token

1. 在「DuckDuckGo Token」输入框中粘贴你的 Token
2. 点击「保存」按钮
3. 确认显示「✓ 已配置 DuckDuckGo Token」

### 步骤 3：配置 TEmail 自动验证码

1. 展开「🚀 TEmail 自动验证码配置」
2. 填写以下信息：
   - **TEmail 服务器地址**：`https://email.chaijz.top`（默认）
   - **TEmail 邮箱地址**：`dkdkgo@chaijz.top`（默认）
   - **认证方式**（二选一）：
     - **JWT Token**（推荐）：直接使用邮箱的 JWT Token
     - **Admin 密码**：通过 Admin API 自动获取 JWT Token
3. 点击「保存配置」按钮
4. 确认显示「✓ 已配置 DuckDuckGo + TEmail 自动验证码」

## 🎮 开始使用

### 单次注册

1. 设置注册数量为 `1`
2. 设置并发窗口为 `1`
3. 点击「开始注册」
4. 等待自动完成，无需手动操作

### 批量注册

1. 设置注册数量（建议 ≤ 10）
2. 设置并发窗口（1-3，推荐 2-3）
3. 点击「开始注册」
4. 插件会自动创建多个无痕窗口并发注册
5. 等待全部完成

## 🔍 工作原理

```
1. 记录当前时间戳（startTime）
   ↓
2. 创建 DuckDuckGo 别名（如：clumsy-stilt-share@duck.com）
   ↓
3. 使用别名注册 AWS Builder ID
   ↓
4. AWS 发送验证码到别名
   ↓
5. DuckDuckGo 转发邮件到 TEmail（dkdkgo@chaijz.top）
   ↓
6. 插件轮询 TEmail API，获取邮件列表
   ↓
7. 只处理时间戳 > startTime 的邮件（极简过滤）
   ↓
8. 从邮件中提取验证码（支持 AWS 格式）
   ↓
9. 自动填写验证码完成注册
```

## 🛠️ 技术细节

### 时间过滤机制

插件使用极简的时间过滤机制，避免复杂的邮件匹配逻辑：

```javascript
// 1. 创建别名前记录当前时间
const startTime = new Date().toISOString();

// 2. 获取验证码时，只处理时间大于 startTime 的邮件
for (const mail of mails) {
  const mailTimestamp = new Date(mail.created_at).getTime();
  const startTimestamp = new Date(startTime).getTime();
  
  if (mailTimestamp <= startTimestamp) {
    continue; // 跳过旧邮件
  }
  
  // 直接提取验证码
  const code = extractVerificationCode(mail.raw);
  if (code) {
    return code;
  }
}
```

### 验证码提取

支持 AWS 特定格式和通用格式：

```javascript
function extractVerificationCode(raw) {
  // AWS 特定格式：Verification code:: 948971 (注意两个冒号)
  const awsMatch = raw.match(/Verification code::\s*(\d{6})/i);
  if (awsMatch) {
    return awsMatch[1];
  }
  
  // 通用格式：6 位数字
  const match = raw.match(/(?<!\d)(\d{6})(?!\d)/);
  if (match) {
    return match[1];
  }
  
  return null;
}
```

### 认证方式

#### JWT Token（推荐）

直接使用 JWT Token，跳过查询步骤，速度更快：

```javascript
const response = await fetch(
  `${baseUrl}/api/mails?limit=20&offset=0`,
  {
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  }
);
```

#### Admin 密码

通过 Admin API 自动获取 JWT Token：

```javascript
// 1. 查询邮箱地址 ID
const listResponse = await fetch(
  `${baseUrl}/admin/address?limit=100&offset=0&query=${emailName}`,
  { headers: { 'x-admin-auth': adminPassword } }
);

// 2. 获取 JWT Token
const jwtResponse = await fetch(
  `${baseUrl}/admin/show_password/${addressId}`,
  { headers: { 'x-admin-auth': adminPassword } }
);
```

## ❓ 常见问题

### Q: 收不到验证码怎么办？

A: 检查以下几点：
1. 确认 DuckDuckGo 邮件转发规则已正确配置
2. 确认 TEmail 配置正确（服务器地址、邮箱地址、认证信息）
3. 查看浏览器控制台日志，确认是否有错误信息
4. 尝试手动访问 TEmail 网页版，确认邮件是否到达

### Q: JWT Token 和 Admin 密码哪个更好？

A: JWT Token 更快（跳过查询步骤），推荐使用。但如果你只有 Admin 密码，插件会自动获取 JWT Token。

### Q: 支持并发注册吗？

A: 支持！每个会话有独立的起始时间，可以同时运行多个注册任务而不会互相干扰。

### Q: 为什么不过滤发件人？

A: 为了简化逻辑，只要是新邮件就提取验证码，避免复杂的匹配规则。通过时间过滤已经足够准确。

### Q: 如何避免获取到错误的验证码？

A: 通过时间过滤，只获取注册后收到的新邮件，确保验证码的准确性。

## 📊 性能优化

- **轮询间隔**：默认 2 秒，可根据需要调整
- **最大尝试次数**：默认 30 次（共 60 秒），可根据需要调整
- **并发支持**：每个会话独立，支持多窗口并发
- **错误处理**：超时后抛出异常，由上层处理

## 🔒 安全建议

1. **保护 Token**：不要将 DuckDuckGo Token 和 TEmail 认证信息泄露给他人
2. **定期更换**：建议定期更换 Token 和密码
3. **专用邮箱**：建议使用专用的 TEmail 邮箱接收验证码，不要用于其他用途
4. **监控使用**：定期检查 DuckDuckGo 和 TEmail 的使用情况

## 📝 更新日志

### v1.0.4 (2024-02-04) 🎯 重要更新

- 🐛 **修复时间同步问题**：改用邮件 ID 比较，彻底解决系统时间和服务器时间不一致的问题
- ✨ 新增 `getLatestMailId()` 方法，获取当前最新邮件 ID 作为基准
- ✨ 使用邮件 ID 过滤而非时间戳，更准确、更可靠
- 🚀 性能提升：整数比较比时间戳比较更快
- 📝 优化日志输出，显示邮件 ID 比较过程

### v1.0.3 (2024-02-04)

- 🚀 优化时间判断逻辑，添加 5 秒缓冲避免时间同步问题
- 🚀 使用 Set 记录已处理邮件，避免重复检查
- 🚀 增强验证码提取，支持 5 种常见格式
- 🚀 添加详细的调试日志（时间差、来源、匹配格式）
- ✨ 改进时间比较逻辑（使用 < 而不是 <=）

### v1.0.2 (2024-02-04)

- 🐛 修复 DuckDuckGo API 返回不完整邮箱地址的问题
- ✨ 自动检测并添加 @duck.com 域名
- ✨ 增强 API 响应字段检测，支持多种可能的字段名
- ✨ 添加详细的调试日志

### v1.0.1 (2024-02-04)

- 🐛 修复 Service Worker 中动态 import() 不支持的问题
- ✨ 改为静态导入，确保在 Service Worker 环境中正常工作

### v1.0.0 (2024-02-04)

- ✨ 新增 DuckDuckGo + TEmail 自动验证码功能
- ✨ 支持 JWT Token 和 Admin 密码两种认证方式
- ✨ 极简时间过滤机制，稳定可靠
- ✨ 支持多窗口并发注册
- ✨ 支持 AWS 特定验证码格式

## 🙏 致谢

- [DuckDuckGo Email Protection](https://duckduckgo.com/email/) - 提供临时邮箱别名服务
- [TEmail](https://github.com/dreamhunter2333/cloudflare_temp_email) - 提供临时邮箱服务
- [AWS Builder ID](https://aws.amazon.com/builder-id/) - AWS 开发者身份服务

---

如有问题或建议，欢迎提交 [Issue](https://github.com/Specia1z/AWS-BuildID-Auto-For-Ext/issues)。
