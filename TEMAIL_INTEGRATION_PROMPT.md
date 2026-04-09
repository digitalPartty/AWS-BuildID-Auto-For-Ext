# DuckDuckGo + TEmail 自动验证码集成提示词

## 需求概述

在现有的 Chrome 扩展中集成 TEmail 临时邮箱服务，实现 DuckDuckGo 邮箱别名 + TEmail 自动获取验证码的功能。

## 核心功能

1. DuckDuckGo 生成临时邮箱别名
2. 别名邮件转发到 TEmail 邮箱（`dkdkgo@chaijz.top`）
3. 自动从 TEmail 获取验证码
4. 支持 JWT Token 和 Admin 密码两种认证方式

## 技术要点

### 1. TEmail API 集成

**服务器地址**: `https://email.chaijz.top`

**认证方式（二选一）**:
- JWT Token（推荐）：直接使用邮箱的 JWT Token
- Admin 密码：通过 Admin API 自动获取 JWT Token

**核心 API**:
```javascript
// 通过 Admin 密码获取 JWT Token
GET /admin/address?limit=100&offset=0&query={emailName}
Headers: { "x-admin-auth": "密码" }

GET /admin/show_password/{addressId}
Headers: { "x-admin-auth": "密码" }

// 查询邮件列表
GET /api/mails?limit=20&offset=0
Headers: { "Authorization": "Bearer {jwt}" }
```

### 2. 邮件过滤逻辑（极简版）

**只使用时间对比，不做其他过滤**：

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

### 3. 验证码提取

支持 AWS 格式：`Verification code:: 599021`

```javascript
function extractVerificationCode(raw) {
  // AWS 特定格式：Verification code:: 948971
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

## 文件结构

### 1. `lib/temail-client.js` - TEmail 客户端

```javascript
class TEmailClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || '';
    this.email = options.email || '';
    this.jwt = options.jwt || null;
    this.adminPassword = options.adminPassword || '';
  }

  // 通过 Admin API 获取 JWT Token
  async fetchJwtToken() {
    // 1. 查询邮箱地址 ID
    const emailName = this.email.split('@')[0];
    const listResponse = await fetch(
      `${this.baseUrl}/admin/address?limit=100&offset=0&query=${emailName}`,
      { headers: { 'x-admin-auth': this.adminPassword } }
    );
    const listData = await listResponse.json();
    const addressId = listData.results[0].id;

    // 2. 获取 JWT Token
    const jwtResponse = await fetch(
      `${this.baseUrl}/admin/show_password/${addressId}`,
      { headers: { 'x-admin-auth': this.adminPassword } }
    );
    const jwtData = await jwtResponse.json();
    this.jwt = jwtData.jwt;
    return this.jwt;
  }

  // 确保有可用的 JWT Token
  async ensureJwtToken() {
    if (this.jwt) return this.jwt;
    if (this.adminPassword) return await this.fetchJwtToken();
    throw new Error('未设置 JWT Token 或 Admin 密码');
  }

  // 查询邮件列表
  async fetchMails(limit = 20, offset = 0) {
    await this.ensureJwtToken();
    const response = await fetch(
      `${this.baseUrl}/api/mails?limit=${limit}&offset=${offset}`,
      { headers: { 'Authorization': `Bearer ${this.jwt}` } }
    );
    const data = await response.json();
    return data.results || [];
  }

  // 等待并获取验证码（极简版）
  async waitForVerificationCode(options = {}) {
    const { startTime = new Date().toISOString(), maxAttempts = 30, interval = 2000 } = options;
    await this.ensureJwtToken();

    const startTimestamp = new Date(startTime).getTime();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const mails = await this.fetchMails(20, 0);

      for (const mail of mails) {
        const mailTimestamp = new Date(mail.created_at).getTime();
        
        // 只处理起始时间之后的邮件
        if (mailTimestamp <= startTimestamp) continue;

        // 直接提取验证码
        const code = extractVerificationCode(mail.raw);
        if (code) return code;
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('超时：未能在规定时间内收到验证码');
  }

  isConfigured() {
    return !!this.baseUrl && !!this.email && (!!this.jwt || !!this.adminPassword);
  }
}

export { TEmailClient };
```

### 2. `lib/mail-api.js` - DuckDuckGo + TEmail 组合客户端

```javascript
import { TEmailClient } from './temail-client.js';

class DuckDuckGoWithTEmailClient {
  constructor(options = {}) {
    this.duckClient = new DuckDuckGoMailClient({ token: options.duckToken });
    this.temailConfig = {
      baseUrl: options.temailBaseUrl,
      email: options.temailEmail,
      jwt: options.temailJwt || null,
      adminPassword: options.temailAdminPassword || ''
    };
    this.currentDuckAddress = null;
    this.startTime = null;
  }

  async createInbox() {
    // 1. 记录当前时间
    this.startTime = new Date().toISOString();
    console.log(`[DuckDuckGo+TEmail] 记录起始时间: ${this.startTime}`);

    // 2. 创建 DuckDuckGo 别名
    this.currentDuckAddress = await this.duckClient.createInbox();
    console.log(`[DuckDuckGo+TEmail] 别名已创建: ${this.currentDuckAddress}`);
    
    return this.currentDuckAddress;
  }

  async waitForVerificationCode(maxAttempts = 30, interval = 2000) {
    if (!this.currentDuckAddress) {
      throw new Error('请先调用 createInbox() 创建别名');
    }

    const temailClient = new TEmailClient(this.temailConfig);
    return await temailClient.waitForVerificationCode({
      startTime: this.startTime,
      maxAttempts,
      interval
    });
  }

  async deleteInbox() {
    this.currentDuckAddress = null;
  }

  getInfo() {
    return {
      duckAddress: this.currentDuckAddress,
      temailAddress: this.temailConfig.email,
      type: 'duckduckgo-temail'
    };
  }

  isConfigured() {
    return this.duckClient.isConfigured() && 
           !!this.temailConfig.baseUrl && 
           !!this.temailConfig.email &&
           (!!this.temailConfig.jwt || !!this.temailConfig.adminPassword);
  }
}

export { DuckDuckGoWithTEmailClient };
```

### 3. `background/service-worker.js` - 配置和使用

```javascript
// 邮箱配置
let mailConfig = {
  type: 'duckduckgo', // 或其他类型
  duckduckgo: {
    token: ''
  },
  duckduckgoTemail: {
    temailBaseUrl: 'https://email.chaijz.top',
    temailEmail: 'dkdkgo@chaijz.top',
    temailJwt: '',  // JWT Token（可选）
    temailAdminPassword: ''  // Admin 密码（可选）
  }
};

// 检查是否配置了 TEmail
const hasTemailConfig = mailConfig.duckduckgoTemail && 
  mailConfig.duckduckgoTemail.temailEmail &&
  (mailConfig.duckduckgoTemail.temailJwt || mailConfig.duckduckgoTemail.temailAdminPassword);

if (hasTemailConfig) {
  // 使用 DuckDuckGo + TEmail 组合客户端
  session.mailClient = new DuckDuckGoWithTEmailClient({
    duckToken: mailConfig.duckduckgo.token,
    temailBaseUrl: mailConfig.duckduckgoTemail.temailBaseUrl,
    temailEmail: mailConfig.duckduckgoTemail.temailEmail,
    temailJwt: mailConfig.duckduckgoTemail.temailJwt,
    temailAdminPassword: mailConfig.duckduckgoTemail.temailAdminPassword
  });
  
  session.manualVerification = false; // 自动获取验证码
} else {
  // 仅使用 DuckDuckGo（手动验证码）
  session.mailClient = new DuckDuckGoMailClient({
    token: mailConfig.duckduckgo.token
  });
  
  session.manualVerification = true;
}
```

### 4. `popup/popup.html` - UI 配置

```html
<!-- DuckDuckGo 配置 -->
<div id="duckduckgo-config">
  <input type="text" id="ddg-token" placeholder="DuckDuckGo Token">
  <button id="ddg-save-btn">保存</button>
  
  <!-- TEmail 自动验证码配置（可选） -->
  <details class="temail-config-section">
    <summary>🚀 自动验证码配置（可选）</summary>
    <div>
      <input type="text" id="temail-email" placeholder="TEmail 邮箱地址" value="dkdkgo@chaijz.top">
      <input type="password" id="temail-jwt" placeholder="JWT Token（推荐）">
      <p>或使用 Admin 密码（JWT 优先）</p>
      <input type="password" id="temail-admin-password" placeholder="Admin 密码（可选）">
      <button id="temail-save-btn">保存配置</button>
    </div>
  </details>
</div>
```

### 5. `popup/popup.js` - 配置保存和加载

```javascript
// 配置对象
let mailConfig = {
  duckduckgoTemail: {
    temailBaseUrl: 'https://email.chaijz.top',
    temailEmail: 'dkdkgo@chaijz.top',
    temailJwt: '',
    temailAdminPassword: ''
  }
};

// 保存 TEmail 配置
async function saveTEmailConfig() {
  const temailEmail = document.getElementById('temail-email').value.trim();
  const temailJwt = document.getElementById('temail-jwt').value.trim();
  const temailAdminPassword = document.getElementById('temail-admin-password').value.trim();

  if (!temailEmail) {
    alert('请输入 TEmail 邮箱地址');
    return;
  }

  if (!temailJwt && !temailAdminPassword) {
    alert('请输入 JWT Token 或 Admin 密码');
    return;
  }

  mailConfig.duckduckgoTemail.temailEmail = temailEmail;
  mailConfig.duckduckgoTemail.temailJwt = temailJwt;
  mailConfig.duckduckgoTemail.temailAdminPassword = temailAdminPassword;

  await chrome.storage.local.set({
    temailEmail,
    temailJwt,
    temailAdminPassword
  });

  alert('配置已保存');
}

// 加载配置
async function loadMailConfig() {
  const result = await chrome.storage.local.get([
    'temailEmail',
    'temailJwt',
    'temailAdminPassword'
  ]);

  if (result.temailEmail) {
    mailConfig.duckduckgoTemail.temailEmail = result.temailEmail;
    document.getElementById('temail-email').value = result.temailEmail;
  }
  if (result.temailJwt) {
    mailConfig.duckduckgoTemail.temailJwt = result.temailJwt;
    document.getElementById('temail-jwt').value = result.temailJwt;
  }
  if (result.temailAdminPassword) {
    mailConfig.duckduckgoTemail.temailAdminPassword = result.temailAdminPassword;
    document.getElementById('temail-admin-password').value = result.temailAdminPassword;
  }
}

// 绑定事件
document.getElementById('temail-save-btn').addEventListener('click', saveTEmailConfig);
document.addEventListener('DOMContentLoaded', loadMailConfig);
```

## 关键配置

### 默认配置
```javascript
{
  temailBaseUrl: 'https://email.chaijz.top',
  temailEmail: 'dkdkgo@chaijz.top',
  temailJwt: '',  // 可选
  temailAdminPassword: ''  // 可选
}
```

### 认证优先级
1. 如果提供了 `temailJwt`，直接使用
2. 否则使用 `temailAdminPassword` 自动获取 JWT Token

## 工作流程

1. **配置阶段**：
   - 用户在 Popup 中配置 DuckDuckGo Token
   - 用户配置 TEmail 邮箱地址和认证信息（JWT 或 Admin 密码）

2. **注册阶段**：
   - 记录当前时间戳
   - 创建 DuckDuckGo 别名（如：`clumsy-stilt-share@duck.com`）
   - 使用别名注册 AWS Builder ID
   - AWS 发送验证码到别名
   - DuckDuckGo 转发邮件到 TEmail（`dkdkgo@chaijz.top`）

3. **获取验证码**：
   - 查询 TEmail 邮箱的邮件列表
   - 只处理时间戳大于起始时间的邮件
   - 直接提取验证码（不做其他过滤）
   - 返回验证码

## 注意事项

1. **极简过滤**：只使用时间对比，不检查发件人、收件人等其他条件
2. **时间精度**：使用 ISO 格式时间字符串，精确到毫秒
3. **错误处理**：超时后抛出异常，由上层处理
4. **并发支持**：每个会话有独立的起始时间，支持多窗口并发
5. **向后兼容**：保留 Admin 密码方式，不影响现有配置

## 测试步骤

1. 配置 DuckDuckGo Token
2. 配置 TEmail（JWT Token 或 Admin 密码）
3. 开始注册
4. 观察控制台日志：
   - `[DuckDuckGo+TEmail] 记录起始时间: ...`
   - `[DuckDuckGo+TEmail] 别名已创建: ...`
   - `[TEmail] 开始监听验证码...`
   - `[TEmail] 检查邮件 ID ..., 时间: ...`
   - `[TEmail] ✓ 找到验证码: XXXXXX`

## 常见问题

**Q: 为什么不过滤发件人？**
A: 简化逻辑，只要是新邮件就提取验证码，避免复杂的匹配规则。

**Q: 如何避免获取到错误的验证码？**
A: 通过时间过滤，只获取注册后收到的新邮件。

**Q: JWT Token 和 Admin 密码哪个更好？**
A: JWT Token 更快（跳过查询步骤），推荐使用。

**Q: 支持并发注册吗？**
A: 支持，每个会话有独立的起始时间。
