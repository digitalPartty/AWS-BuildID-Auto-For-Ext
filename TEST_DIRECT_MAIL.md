# 直接邮件 API 测试指南

## 功能说明

现在扩展支持两种邮箱模式：

### 1. DuckDuckGo + TEmail 模式（原有）
- 使用 DuckDuckGo 生成临时邮箱别名
- 邮件转发到 TEmail 服务器
- 自动获取验证码

### 2. 直接 API 请求模式（新增）
- 通过 GET 请求直接获取新邮件
- 类似 Python `requests.get()` 的使用方式
- 适用于已有邮箱的场景

## 使用步骤

### 1. 打开扩展 Popup

点击浏览器工具栏中的扩展图标

### 2. 选择邮箱模式

在"邮箱配置"区域，你会看到两个单选按钮：
- ⚪ DuckDuckGo + TEmail
- ⚪ 直接 API 请求

选择"直接 API 请求"

### 3. 配置参数

填写以下信息：
- **API 服务器地址**: 例如 `https://yourdomain.com`
- **Refresh Token**: 你的刷新令牌
- **Client ID**: 你的客户端 ID
- **邮箱地址**: 例如 `your_email@example.com`
- **邮箱名称**: 默认 `INBOX`（可选）

### 4. 保存配置

点击"保存"按钮，配置会被保存到本地存储

### 5. 开始注册

- 设置注册数量（1-100）
- 设置并发窗口（1-5）
- 点击"开始注册"按钮

## API 端点要求

你的 API 服务器需要提供以下端点：

```
GET /api/mail-new?refresh_token={token}&client_id={id}&email={email}&mailbox={mailbox}&response_type=json
```

### 响应格式

```json
{
  "mails": [
    {
      "id": "mail_id_123",
      "subject": "Verification Code",
      "text": "Your verification code is: 123456",
      "body": "...",
      "raw": "..."
    }
  ]
}
```

## 验证码提取

系统会自动从邮件内容中提取验证码，支持以下格式：

1. `Verification code:: 123456` (AWS 格式)
2. `Verification code: 123456` (常见格式)
3. `Your code is 123456`
4. `验证码：123456` (中文)
5. 独立的 6 位数字

## 故障排查

### 问题：点击"开始注册"后提示"请先完整配置直接 API 请求参数"

**解决方案**：
- 确保所有必填字段都已填写
- 点击"保存"按钮保存配置
- 刷新 popup 页面重试

### 问题：注册过程中提示"请求失败"

**解决方案**：
- 检查 API 服务器地址是否正确
- 检查 Refresh Token 和 Client ID 是否有效
- 检查邮箱地址是否存在于系统中
- 打开浏览器控制台查看详细错误信息

### 问题：未能获取到验证码

**解决方案**：
- 确认邮件已发送到指定邮箱
- 检查 API 返回的邮件格式是否正确
- 验证码可能在 `text`、`body` 或 `raw` 字段中
- 查看控制台日志确认验证码提取过程

## 开发者调试

### 查看日志

1. 打开浏览器扩展管理页面
2. 找到本扩展，点击"Service Worker"
3. 在控制台中查看日志：
   - `[DirectMail]` 开头的是直接 API 模式的日志
   - `[Session]` 开头的是会话相关日志

### 测试 API 端点

使用浏览器或 curl 测试你的 API：

```bash
curl "https://yourdomain.com/api/mail-new?refresh_token=YOUR_TOKEN&client_id=YOUR_ID&email=your@email.com&mailbox=INBOX&response_type=json"
```

## 与 Python 版本对比

### Python 代码
```python
import requests

url = f"https://yourdomain.com/api/mail-new?refresh_token={refresh_token}&client_id={client_id}&email={email}&mailbox={mailbox}&response_type={response_type}"
response = requests.get(url)
data = response.json()
```

### JavaScript 实现（扩展内部）
```javascript
const params = new URLSearchParams({
  refresh_token: refreshToken,
  client_id: clientId,
  email: email,
  mailbox: mailbox,
  response_type: responseType
});

const url = `${baseUrl}/api/mail-new?${params.toString()}`;
const response = await fetch(url);
const data = await response.json();
```

## 注意事项

1. **安全性**: Refresh Token 和 Client ID 会保存在本地存储中，请确保浏览器安全
2. **API 限流**: 如果 API 有限流，建议降低并发数
3. **邮箱容量**: 确保邮箱有足够空间接收验证邮件
4. **网络延迟**: 根据网络情况调整验证码等待时间（默认 30 次 × 2 秒）

## 切换回 DuckDuckGo 模式

如果需要切换回原来的模式：
1. 在 popup 中选择"DuckDuckGo + TEmail"单选按钮
2. 配置会自动切换
3. 无需重启扩展
