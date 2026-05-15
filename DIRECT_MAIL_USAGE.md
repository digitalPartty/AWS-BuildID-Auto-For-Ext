# 直接邮件 API 使用说明

## 概述

`DirectMailClient` 是一个新的邮件客户端，使用 GET 请求直接获取新邮件，替代 DuckDuckGo + TEmail 的组合模式。

## 特点

- ✅ 简单直接：通过 GET 请求获取邮件
- ✅ 参数化配置：支持 refresh_token、client_id 等参数
- ✅ 自动提取验证码：支持多种验证码格式
- ✅ 统一接口：与 DuckDuckGoWithTEmailClient 接口兼容

## 使用方法

### 1. 导入客户端

```javascript
import { DirectMailClient } from './lib/mail-api.js';
```

### 2. 创建客户端实例

```javascript
const mailClient = new DirectMailClient({
  baseUrl: 'https://yourdomain.com',
  refreshToken: 'your_refresh_token',
  clientId: 'your_client_id',
  email: 'your_email@example.com',
  mailbox: 'INBOX',           // 可选，默认 'INBOX'
  responseType: 'json'         // 可选，默认 'json'
});
```

### 3. 使用邮箱

```javascript
// 创建邮箱（实际上是返回现有邮箱地址）
const email = await mailClient.createInbox();
console.log(`使用邮箱: ${email}`);

// 等待验证码
try {
  const code = await mailClient.waitForVerificationCode(30, 2000);
  console.log(`收到验证码: ${code}`);
} catch (error) {
  console.error('获取验证码失败:', error);
}
```

### 4. 完整示例

```javascript
import { DirectMailClient } from './lib/mail-api.js';

async function getVerificationCode() {
  // 创建客户端
  const mailClient = new DirectMailClient({
    baseUrl: 'https://yourdomain.com',
    refreshToken: 'your_refresh_token',
    clientId: 'your_client_id',
    email: 'your_email@example.com'
  });

  // 检查配置
  if (!mailClient.isConfigured()) {
    throw new Error('邮件客户端配置不完整');
  }

  // 创建邮箱
  const email = await mailClient.createInbox();
  console.log(`使用邮箱: ${email}`);

  // 在这里使用邮箱进行注册或验证...
  // 例如：await registerWithEmail(email);

  // 等待验证码（最多尝试 30 次，每次间隔 2 秒）
  const code = await mailClient.waitForVerificationCode(30, 2000);
  console.log(`验证码: ${code}`);

  return code;
}

// 使用
getVerificationCode()
  .then(code => console.log('成功:', code))
  .catch(error => console.error('失败:', error));
```

## API 参考

### 构造函数参数

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `baseUrl` | string | ✅ | - | API 服务器地址 |
| `refreshToken` | string | ✅ | - | 刷新令牌 |
| `clientId` | string | ✅ | - | 客户端 ID |
| `email` | string | ✅ | - | 邮箱地址 |
| `mailbox` | string | ❌ | 'INBOX' | 邮箱名称 |
| `responseType` | string | ❌ | 'json' | 响应类型 |

### 方法

#### `createInbox()`
返回邮箱地址（此模式下邮箱已存在）

**返回**: `Promise<string>` - 邮箱地址

#### `fetchNewMails()`
获取新邮件

**返回**: `Promise<Object>` - 邮件数据

#### `waitForVerificationCode(maxAttempts, interval)`
等待并获取验证码

**参数**:
- `maxAttempts` (number): 最大尝试次数，默认 30
- `interval` (number): 检查间隔（毫秒），默认 2000

**返回**: `Promise<string>` - 验证码

#### `deleteInbox()`
删除邮箱（此模式下不需要操作）

#### `getInfo()`
获取邮箱信息

**返回**: `Object` - 包含 email, mailbox, type 信息

#### `isConfigured()`
检查是否已配置

**返回**: `boolean` - 是否配置完整

## 与 Python requests 的对比

### Python 版本
```python
import requests

refresh_token = "your_refresh_token"
client_id = "your_client_id"
email = "your_email@example.com"
mailbox = "INBOX"
response_type = "json"

url = f"https://yourdomain.com/api/mail-new?refresh_token={refresh_token}&client_id={client_id}&email={email}&mailbox={mailbox}&response_type={response_type}"

response = requests.get(url)
data = response.json()
```

### JavaScript 版本（DirectMailClient 内部实现）
```javascript
const params = new URLSearchParams({
  refresh_token: refreshToken,
  client_id: clientId,
  email: email,
  mailbox: mailbox,
  response_type: responseType
});

const url = `${baseUrl}/api/mail-new?${params.toString()}`;

const response = await fetch(url, {
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

const data = await response.json();
```

## 支持的验证码格式

- `Verification code:: 123456` (AWS 格式)
- `Verification code: 123456` (常见格式)
- `Your code is 123456`
- `验证码：123456` (中文)
- 独立的 6 位数字

## 错误处理

```javascript
try {
  const code = await mailClient.waitForVerificationCode();
  console.log('验证码:', code);
} catch (error) {
  if (error.message.includes('超时')) {
    console.error('未在规定时间内收到验证码');
  } else if (error.message.includes('请求失败')) {
    console.error('API 请求失败');
  } else {
    console.error('未知错误:', error);
  }
}
```

## 与 DuckDuckGo + TEmail 模式的对比

| 特性 | DirectMailClient | DuckDuckGoWithTEmailClient |
|------|------------------|----------------------------|
| 邮箱来源 | 现有邮箱 | DuckDuckGo 临时别名 |
| 配置复杂度 | 简单 | 中等 |
| 依赖服务 | 单个 API | DuckDuckGo + TEmail |
| 适用场景 | 固定邮箱 | 临时邮箱 |
| 隐私保护 | 一般 | 较好 |

## 注意事项

1. 确保 API 服务器支持 `/api/mail-new` 端点
2. refresh_token 和 client_id 需要有效
3. 邮箱地址必须已存在于系统中
4. 建议根据实际情况调整 `maxAttempts` 和 `interval` 参数
