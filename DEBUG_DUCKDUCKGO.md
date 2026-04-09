# DuckDuckGo API 调试指南

## 问题描述

邮箱地址显示为 `resume-sage-snub` 而不是完整的邮箱地址（如 `resume-sage-snub@duck.com`）。

## 可能的原因

1. **API 响应格式不明确**
   - DuckDuckGo API 可能只返回别名部分，不包含域名
   - 需要手动添加 `@duck.com` 域名

2. **字段名不确定**
   - API 响应可能使用不同的字段名
   - 需要尝试多种可能的字段名

## 已实现的修复

### 1. 增强的字段检测

```javascript
// 尝试多种可能的字段名
const possibleFields = ['address', 'email', 'alias', 'duck_address', 'private_address'];
for (const field of possibleFields) {
  if (data[field]) {
    emailAddress = data[field];
    break;
  }
}
```

### 2. 自动添加域名

```javascript
// 如果返回的地址不包含 @，添加 @duck.com 域名
if (!emailAddress.includes('@')) {
  console.log(`[DuckDuckGo] 地址不包含域名，添加 @duck.com: ${emailAddress}`);
  emailAddress = `${emailAddress}@duck.com`;
}
```

### 3. 详细的日志输出

```javascript
console.log('[DuckDuckGo] API 响应:', JSON.stringify(data, null, 2));
console.log(`[DuckDuckGo] ✓ 别名创建成功: ${this.address}`);
```

## 调试步骤

### 步骤 1：查看控制台日志

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 开始注册，查找以下日志：

```
[DuckDuckGo] 开始创建别名...
[DuckDuckGo] API 响应: { ... }
[DuckDuckGo] ✓ 别名创建成功: xxx@duck.com
```

### 步骤 2：检查 API 响应

从日志中找到 `[DuckDuckGo] API 响应:` 这一行，查看完整的响应数据：

**可能的响应格式 1**（完整邮箱）：
```json
{
  "address": "resume-sage-snub@duck.com"
}
```

**可能的响应格式 2**（仅别名）：
```json
{
  "address": "resume-sage-snub"
}
```

**可能的响应格式 3**（其他字段名）：
```json
{
  "email": "resume-sage-snub@duck.com"
}
```

### 步骤 3：验证邮箱地址

检查最终创建的邮箱地址：

```
[DuckDuckGo+TEmail] ✓ 别名已创建: resume-sage-snub@duck.com
```

如果地址不包含 `@duck.com`，说明自动添加域名的逻辑没有生效。

## 手动测试 API

### 使用 curl 测试

```bash
curl -X POST https://quack.duckduckgo.com/api/email/addresses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### 使用 JavaScript 测试

在浏览器控制台中运行：

```javascript
fetch('https://quack.duckduckgo.com/api/email/addresses', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('API 响应:', data))
.catch(err => console.error('错误:', err));
```

## 常见问题

### Q1: 为什么地址只显示别名部分？

A: DuckDuckGo API 可能只返回别名部分（如 `resume-sage-snub`），不包含域名。代码已经添加了自动补全域名的逻辑。

### Q2: 如何确认域名是 @duck.com？

A: 根据 DuckDuckGo Email Protection 的文档和实际使用，域名应该是 `@duck.com`。如果不是，需要查看 API 文档或实际测试。

### Q3: 如果 API 响应格式不同怎么办？

A: 代码已经尝试了多种可能的字段名。如果仍然无法识别，请：
1. 查看控制台日志中的完整 API 响应
2. 在 `lib/duckduckgo-client.js` 中添加对应的字段名
3. 提交 Issue 报告问题

## 下一步

1. **重新加载扩展**
   - 在 `chrome://extensions/` 点击刷新按钮

2. **测试注册**
   - 配置 DuckDuckGo Token 和 TEmail
   - 开始单次注册
   - 查看控制台日志

3. **报告问题**
   - 如果问题仍然存在，请提供完整的控制台日志
   - 特别是 `[DuckDuckGo] API 响应:` 这一行的内容

## 预期结果

修复后，应该看到：

```
[DuckDuckGo] 开始创建别名...
[DuckDuckGo] API 响应: {"address":"resume-sage-snub"}
[DuckDuckGo] 地址不包含域名，添加 @duck.com: resume-sage-snub
[DuckDuckGo] ✓ 别名创建成功: resume-sage-snub@duck.com
[DuckDuckGo+TEmail] ✓ 别名已创建: resume-sage-snub@duck.com
```

最终邮箱地址应该是完整的 `xxx@duck.com` 格式。
