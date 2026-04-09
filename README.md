# AWS Builder ID 自动注册工具

一键批量注册 AWS Builder ID 账号的 Chrome 浏览器扩展，使用 DuckDuckGo 邮箱别名 + TEmail 自动获取验证码。

## ✨ 特性

- 🚀 **全自动注册** - DuckDuckGo 生成别名 + TEmail 自动获取验证码
- 🔄 **批量并发** - 支持多窗口并发注册（最多 5 个）
- 📧 **邮件转发** - DuckDuckGo 别名自动转发到 TEmail
- 🔐 **Token 管理** - 自动获取并保存 Access Token 和 Refresh Token
- ✅ **Token 验证** - 批量验证 Token 状态（有效/过期/封禁）
- 📊 **历史记录** - 保存注册历史，支持导出 JSON/CSV
- 🔗 **Kiro IDE 集成** - 一键同步 Token 到 Kiro IDE

## 📋 前置要求

### 1. DuckDuckGo Email Protection

1. 注册 DuckDuckGo 账号：https://duckduckgo.com/email/
2. 获取 Token：
   - 登录 DuckDuckGo Email Protection
   - 打开浏览器开发者工具（F12）
   - 切换到 Network 标签
   - 创建一个新的邮箱别名
   - 找到请求头中的 `Authorization: Bearer YOUR_TOKEN`
   - 复制 Token（不包含 "Bearer " 前缀）

### 2. TEmail 临时邮箱

- 部署 TEmail 服务：https://github.com/Jinnrry/PMail
- 或使用现有的 TEmail 实例
- 获取认证信息（二选一）：
  - **JWT Token**（推荐）：从 TEmail 管理面板获取
  - **Admin 密码**：TEmail 管理员密码

### 3. Chrome 浏览器

- 版本 88 或更高
- 启用扩展的无痕模式权限

## 🚀 快速开始

### 1. 安装扩展

```bash
# 克隆仓库
git clone https://github.com/your-repo/aws-auto-registration.git
cd aws-auto-registration

# 加载扩展
# 1. 打开 Chrome 浏览器
# 2. 访问 chrome://extensions/
# 3. 开启"开发者模式"
# 4. 点击"加载已解压的扩展程序"
# 5. 选择项目文件夹
```

### 2. 启用无痕模式

1. 在 `chrome://extensions/` 找到扩展
2. 点击"详细信息"
3. 开启"在无痕模式下启用"

### 3. 配置扩展

1. 点击扩展图标打开 Popup
2. 配置 DuckDuckGo Token
3. 配置 TEmail 自动验证码：
   - 服务器地址：`https://email.chaijz.top`（或你的 TEmail 地址）
   - 邮箱地址：`dkdkgo@chaijz.top`（或你的 TEmail 邮箱）
   - JWT Token 或 Admin 密码
4. 点击"保存"

### 4. 开始注册

1. 设置注册数量（1-100）
2. 设置并发窗口（1-5）
3. 点击"开始注册"
4. 等待自动完成

## 📖 工作原理

```
1. 创建 DuckDuckGo 邮箱别名
   ↓
2. 使用别名注册 AWS Builder ID
   ↓
3. AWS 发送验证码到别名
   ↓
4. DuckDuckGo 转发邮件到 TEmail
   ↓
5. 自动从 TEmail 获取验证码
   ↓
6. 自动填写验证码完成注册
   ↓
7. 获取并保存 Token
```

## 🔧 配置说明

### DuckDuckGo Token

- 从 DuckDuckGo Email Protection 获取
- 用于创建邮箱别名
- 每个别名自动转发到你的 TEmail 邮箱

### TEmail 配置

- **服务器地址**：TEmail 实例的 URL
- **邮箱地址**：接收转发邮件的 TEmail 邮箱
- **认证方式**（二选一）：
  - JWT Token（推荐，更快）
  - Admin 密码（自动获取 JWT）

## 📊 功能说明

### 批量注册

- 支持 1-100 个账号
- 支持 1-5 个并发窗口
- 自动获取验证码
- 自动填写表单

### Token 验证

- 批量验证所有 Token 状态
- 状态类型：
  - ✅ 有效（valid）
  - ⏰ 过期（expired）
  - 🚫 封禁（suspended）
  - ❌ 无效（invalid）
  - ❓ 未验证（unknown）

### 数据导出

- **JSON 格式**：只导出有效的 Token（用于 API 调用）
- **CSV 格式**：导出完整信息（包含邮箱、密码、Token 状态等）

### Kiro IDE 集成

- 一键同步 Token 到 Kiro IDE
- 自动检测操作系统（Windows/macOS/Linux）
- 生成对应的命令并复制到剪贴板
- 在终端执行命令即可同步

## 🐛 故障排除

### 问题 1: 找不到验证码

**症状**：日志显示"超时：未能在规定时间内收到验证码"

**解决方案**：

1. 检查 TEmail 配置是否正确
2. 手动登录 TEmail 查看是否收到邮件
3. 检查 DuckDuckGo 转发设置
4. 增加等待时间（默认 60 秒）

### 问题 2: Token 无效

**症状**：验证显示 Token 状态为"无效"或"封禁"

**解决方案**：

1. AWS 可能检测到批量注册
2. 降低注册速度（减少并发数）
3. 使用不同的 IP 地址
4. 等待一段时间后重试

### 问题 3: 无痕窗口创建失败

**症状**：提示"无法创建无痕窗口"

**解决方案**：

1. 在 `chrome://extensions/` 启用"在无痕模式下启用"
2. 重新加载扩展
3. 重启浏览器

### 问题 4: DuckDuckGo Token 无效

**症状**：提示"创建别名失败: 401"

**解决方案**：

1. 重新获取 DuckDuckGo Token
2. 确保复制的是完整的 Token（不包含 "Bearer " 前缀）
3. 检查 Token 是否过期

### 问题 5: TEmail 认证失败

**症状**：提示"获取 JWT 失败"或"找不到邮箱"

**解决方案**：

1. 检查服务器地址是否正确（不要有尾部斜杠）
2. 检查邮箱地址是否存在于 TEmail 系统中
3. 尝试直接使用 JWT Token 而不是 Admin 密码
4. 手动登录 TEmail 验证邮箱是否可用

## 📝 注意事项

1. **合理使用**：请遵守 AWS 服务条款，不要滥用
2. **速率限制**：建议并发数不超过 3，避免触发限流
3. **Token 安全**：妥善保管导出的 Token，不要泄露
4. **邮箱配置**：确保 DuckDuckGo 转发到正确的 TEmail 邮箱
5. **定期验证**：定期验证 Token 状态，及时清理无效 Token

## 🔄 更新日志

### v1.1.0 (2024-02-04)

- ✅ 简化项目，只保留 DuckDuckGo + TEmail 方案
- ✅ 移除 Gmail 别名、临时邮箱、自定义邮箱模式
- ✅ 优化 UI，简化配置流程
- ✅ 提升并发窗口最大值到 5
- ✅ 清理不需要的代码和文档

### v1.0.4 (2024-02-04)

- ✅ 修复时间同步问题（使用邮件 ID 代替时间比较）
- ✅ 修复 DuckDuckGo 邮箱地址不完整问题
- ✅ 修复 Service Worker 动态导入错误
- ✅ 优化验证码提取逻辑（支持 5 种格式）
- ✅ 添加邮件去重机制

### v1.0.3 (2024-02-03)

- ✅ 添加 DuckDuckGo + TEmail 集成
- ✅ 支持自动获取验证码
- ✅ 添加 Token 验证功能

## 📁 项目结构

```
aws-auto-registration/
├── background/
│   └── service-worker.js      # 后台服务
├── content/
│   └── content.js             # 内容脚本
├── icons/                     # 图标
├── lib/
│   ├── duckduckgo-client.js   # DuckDuckGo 客户端
│   ├── mail-api.js            # 邮箱 API
│   ├── oidc-api.js            # OIDC API
│   ├── temail-client.js       # TEmail 客户端
│   └── utils.js               # 工具函数
├── popup/
│   ├── popup.html             # 弹窗 HTML
│   ├── popup.js               # 弹窗脚本
│   └── popup.css              # 弹窗样式
├── manifest.json              # 扩展配置
├── LICENSE                    # 许可证
└── README.md                  # 本文档
```

## 🛠️ 技术栈

- **前端**：HTML, CSS, JavaScript
- **Chrome API**：chrome.windows, chrome.tabs, chrome.storage, chrome.runtime
- **邮箱服务**：DuckDuckGo Email Protection, TEmail (PMail)
- **认证**：AWS OIDC Device Authorization Flow

## 📚 相关链接

- DuckDuckGo Email Protection: https://duckduckgo.com/email/
- TEmail (PMail): https://github.com/Jinnrry/PMail
- AWS Builder ID: https://aws.amazon.com/builder-id/
- Chrome Extension API: https://developer.chrome.com/docs/extensions/

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请提交 Issue 或联系作者。

---

**免责声明**：本工具仅供学习和研究使用，请遵守相关服务条款。使用本工具产生的任何后果由使用者自行承担。
