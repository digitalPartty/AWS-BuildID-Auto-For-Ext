# Kirors 集成说明

## 功能概述

已将 Token Pool 功能修改为 Kirors 集成，支持在注册验证通过后自动或手动上传凭证到你的 Kirors 服务器。

## 主要修改

### 1. 配置项更改

**原配置：**
- Token Pool API URL（固定）
- API Key
- 需要连接验证

**新配置：**
- API 地址（可配置，默认：`https://chairs.zeabur.app/api/admin/credentials`）
- Token（认证令牌）
- 自动上传开关（注册成功后自动上传）

### 2. 上传格式

**请求方法：** POST

**请求地址：** 可配置（默认 `https://chairs.zeabur.app/api/admin/credentials`）

**请求头：**
```
Content-Type: application/json
Authorization: Bearer {你的Token}
```

**请求负载：**
```json
{
  "refreshToken": "注册获取的 refreshToken",
  "authMethod": "idc",
  "clientId": "注册获取的 clientId",
  "clientSecret": "注册获取的 clientSecret",
  "priority": 0
}
```

### 3. 功能特性

#### 自动上传
- 在扩展设置中勾选"注册成功后自动上传"
- 每次注册成功后会自动将凭证上传到 Kirors
- 上传失败不会影响注册流程，只会在控制台记录错误

#### 手动上传
- 点击"上传至 Kirors"按钮
- 只上传已验证且状态为"有效"的 Token
- 逐个上传，避免限流（每个请求间隔 500ms）
- 显示上传结果统计

## 使用步骤

### 1. 配置 Kirors

1. 打开扩展 Popup
2. 找到"Kirors 集成"部分
3. 填写配置：
   - **API 地址**：你的 Kirors API 地址（默认已填写）
   - **Token**：你的认证令牌
4. 可选：勾选"注册成功后自动上传"
5. 点击"保存"

### 2. 注册账号

按照原有流程注册 AWS Builder ID 账号，如果启用了自动上传，注册成功后会自动上传到 Kirors。

### 3. 手动上传（可选）

1. 点击"验证"按钮验证所有 Token 状态
2. 点击"上传至 Kirors"按钮
3. 确认上传数量
4. 等待上传完成

## 错误处理

### 400 Bad Request

如果遇到 400 错误，请检查：

1. **Token 是否正确**：确保 Token 有效且有权限
2. **API 地址是否正确**：确认地址格式正确（包含 https://）
3. **负载格式**：确保 refreshToken、clientId、clientSecret 都已正确获取

### 网络错误

- 检查网络连接
- 确认 Kirors 服务器可访问
- 查看浏览器控制台的详细错误信息

## 调试

打开浏览器控制台（F12），查看以下日志：

- `[Kirors] 开始自动上传...` - 自动上传开始
- `[Kirors] 上传成功:` - 上传成功
- `[Kirors] 上传失败:` - 上传失败及错误详情
- `[Pool] 上传到 Kirors:` - 手动上传的负载内容

## 代码修改位置

1. **popup/popup.html** - UI 界面更新
2. **popup/popup.js** - 配置管理和手动上传逻辑
3. **popup/popup.css** - 样式调整
4. **background/service-worker.js** - 自动上传逻辑

## 注意事项

1. Token 会保存在浏览器本地存储中，请妥善保管
2. 自动上传失败不会影响注册流程
3. 手动上传只会上传状态为"有效"的 Token
4. 建议先验证 Token 状态再手动上传
