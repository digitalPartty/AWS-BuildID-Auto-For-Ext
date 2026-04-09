<div align="center">

# 🚀 AWS Auto Registration - Chrome Extension

### ⚡ 一键自动化注册 AWS Builder ID 的浏览器扩展

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://chrome.google.com)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green?logo=googlechrome)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://www.javascript.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

[功能特性](#-功能特性) • [安装指南](#-安装指南) • [使用说明](#-使用说明) • [技术架构](#-技术架构) • [常见问题](#-常见问题)

</div>

---

> ⚠️ **重要提示**：目前插件的**并发多窗口功能不稳定**，建议将并发窗口数设置为 **1**。使用 Gmail 别名模式时需要手动填写验证码。

---

## ✨ 功能特性

### 🎯 核心功能

- **🤖 半自动注册** - 自动填写表单，验证码需手动输入
- **🔄 批量注册** - 支持自定义注册数量（1-100），一键批量创建账号
- **📧 Gmail 无限别名** - 利用 Gmail 特性生成无限邮箱变体（+号/点号/大小写）
- **🕵️ 无痕模式** - 自动创建无痕窗口，隔离会话，防止数据污染
- **🔐 Token 管理** - 自动获取并保存 OIDC Access Token 和 Refresh Token

### 🛡️ 高级功能

- **✅ Token 验证** - 批量验证 Token 状态，识别封禁、过期、无效账号
- **🎨 状态可视化** - 实时显示注册进度、会话状态、Token 状态
- **📊 智能导出** - 支持 JSON/CSV 格式，自动过滤无效 Token
- **💾 历史记录** - 自动保存注册历史，支持查看、复制、导出
- **🚀 Kiro IDE 同步** - 一键同步 Token 至 Kiro IDE，支持 Windows / macOS / Linux

---

## 📧 邮箱模式

本插件支持多种邮箱模式，满足不同使用场景：

### 1. Gmail 无限别名（手动验证码）

利用 Gmail 的特性，从一个 Gmail 地址生成无限邮箱变体：

| 变体类型 | 示例 | 说明 |
|---------|------|------|
| **+ 号别名** | `user+abc123@gmail.com` | 最可靠，推荐方式 |
| **点号插入** | `u.ser@gmail.com` | Gmail 忽略用户名中的点 |
| **大小写变体** | `UsEr@gmail.com` | Gmail 不区分大小写 |
| **混合变体** | `U.sEr+abc@gmail.com` | 组合以上所有方式 |

> 所有变体都会收到同一个 Gmail 收件箱的邮件，验证码需手动填写

### 2. DuckDuckGo + TEmail（自动验证码）⭐ 推荐

**最强组合**：DuckDuckGo 生成临时邮箱别名 + TEmail 自动获取验证码

**优势**：
- ✅ 自动创建 DuckDuckGo 邮箱别名
- ✅ 邮件自动转发到 TEmail
- ✅ 自动获取验证码，无需手动填写
- ✅ 支持多窗口并发注册
- ✅ 极简时间过滤，稳定可靠

**配置步骤**：

1. **获取 DuckDuckGo Token**：
   - 访问 [DuckDuckGo Email Protection](https://duckduckgo.com/email/)
   - 登录并生成 API Token

2. **配置 TEmail**：
   - 服务器地址：`https://email.chaijz.top`（默认）
   - 邮箱地址：`dkdkgo@chaijz.top`（默认）
   - 认证方式（二选一）：
     - **JWT Token**（推荐）：直接使用邮箱的 JWT Token
     - **Admin 密码**：通过 Admin API 自动获取 JWT Token

3. **在插件中配置**：
   - 选择「DuckDuckGo」模式
   - 输入 DuckDuckGo Token 并保存
   - 展开「TEmail 自动验证码配置」
   - 输入 TEmail 配置并保存

**工作原理**：
```
1. 创建 DuckDuckGo 别名（如：clumsy-stilt-share@duck.com）
2. 使用别名注册 AWS Builder ID
3. AWS 发送验证码到别名
4. DuckDuckGo 转发邮件到 TEmail（dkdkgo@chaijz.top）
5. 插件自动从 TEmail 获取验证码
6. 自动填写验证码完成注册
```

### 3. 临时邮箱（自动验证码）

使用 Cloudflare Worker 搭建的临时邮箱服务，自动创建邮箱并获取验证码。

### 4. 自定义邮箱（手动验证码）

使用固定的邮箱地址，验证码需手动填写。

---

## 📦 安装指南

### 方式一：从源码安装（推荐）

1️⃣ **克隆仓库**
```bash
git clone https://github.com/Specia1z/AWS-BuildID-Auto-For-Ext.git
cd AWS-BuildID-Auto-For-Ext
```

2️⃣ **加载扩展**
- 打开 Chrome 浏览器
- 访问 `chrome://extensions/`
- 开启右上角「开发者模式」
- 点击「加载已解压的扩展程序」
- 选择项目根目录

3️⃣ **启用无痕模式**
- 在扩展卡片上，点击「详细信息」
- 找到「在无痕模式下启用」，**必须开启**
- 刷新扩展（点击刷新图标 🔄）

### 方式二：安装打包文件

1. 下载 [Releases](https://github.com/Specia1z/AWS-BuildID-Auto-For-Ext/releases) 中的 `extension.crx` 或 `extension.zip`
2. 解压后按照「方式一」的步骤 2-3 加载

---

## 📖 使用说明

### 快速开始

#### 方式一：DuckDuckGo + TEmail（推荐，自动验证码）

1. **配置 DuckDuckGo**：
   - 在插件弹窗中选择「DuckDuckGo」模式
   - 输入 DuckDuckGo Token 并保存
2. **配置 TEmail**：
   - 展开「TEmail 自动验证码配置」
   - 输入 TEmail 服务器地址、邮箱地址、JWT Token 或 Admin 密码
   - 点击保存
3. **设置参数**：
   - 注册数量：1-100
   - 并发窗口：1-3（支持多窗口并发）
4. **点击「开始注册」**，全自动完成，无需手动输入验证码

#### 方式二：Gmail 别名（手动验证码）

1. **配置 Gmail 地址**：在插件弹窗中输入你的 Gmail 地址并保存
2. **设置参数**：
   - 注册数量：1-100（建议 ≤ 10）
   - 并发窗口：建议设为 **1**（需要手动输入验证码）
3. **点击「开始注册」**
4. **手动填写验证码**：
   - 打开 Gmail 收件箱，找到 AWS 验证码邮件
   - 在注册页面手动输入验证码
5. **等待完成**，查看注册结果

### 功能详解

#### 📧 Gmail 配置

在插件弹窗顶部配置你的 Gmail 地址：

```
输入: example@gmail.com
保存后自动生成变体: example+240204abc@gmail.com, e.xample@gmail.com 等
```

#### ✅ Token 验证

注册完成后，点击「验证」按钮批量检测所有 Token 状态：

| 状态 | 含义 | 颜色 |
|------|------|------|
| **有效** | Token 正常可用 | 🟢 绿色 |
| **封禁** | 账号被临时封禁 | 🟡 黄色 |
| **过期** | Token 已过期 | 🟠 橙色 |
| **无效** | 账号无效或被删除 | 🔴 红色 |
| **错误** | 网络或服务器错误 | ⚫ 灰色 |
| **未验证** | 尚未验证 | ⚪ 浅灰 |

#### 📊 导出账号

- **JSON 导出**：仅导出有效和未验证的 Token（自动过滤封禁/过期/无效）
- **CSV 导出**：导出完整信息，包含 `token_status` 列

#### 🚀 同步至 Kiro IDE

一键将 Token 同步至 Kiro IDE，**智能检测操作系统**，自动生成对应命令。

**支持的系统：**

| 系统 | 终端 | 配置文件路径 |
|------|------|-------------|
| Windows | PowerShell | `%USERPROFILE%\.aws\sso\cache\` |
| macOS | Terminal | `~/.aws/sso/cache/` |
| Linux | Terminal | `~/.aws/sso/cache/` |

**使用步骤：**

1. 在历史记录中找到成功注册且有 Token 的记录
2. 点击该记录旁边的 **「Kiro」** 按钮
3. 插件会自动检测你的操作系统，生成对应的命令并复制到剪贴板
4. 打开对应的终端（Windows 用 PowerShell，macOS/Linux 用 Terminal）
5. 粘贴并执行命令
6. 重启 Kiro IDE 即可使用同步的账号

---

## 🏗️ 技术架构

### 技术栈

<div align="center">

| 层级 | 技术 | 说明 |
|:----:|:----:|:-----|
| **核心** | ![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome) | Chrome Extension API |
| **语言** | ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black) | ES6+ Modules |
| **UI** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) | 原生 HTML/CSS |
| **认证** | ![OAuth 2.0](https://img.shields.io/badge/OAuth-2.0-blue?logo=oauth) | AWS OIDC Device Flow |

</div>

### 项目结构

```
extension/
├── manifest.json              # 扩展配置（Manifest V3）
├── background/
│   └── service-worker.js     # 后台服务（会话管理、API 调用）
├── content/
│   └── content.js            # 内容脚本（页面自动化）
├── popup/
│   ├── popup.html            # 弹窗界面
│   ├── popup.css             # 弹窗样式
│   └── popup.js              # 弹窗逻辑
├── lib/
│   ├── mail-api.js           # Gmail 无限别名生成器
│   ├── oidc-api.js           # AWS OIDC 认证 API + Token 验证
│   └── utils.js              # 工具函数（密码/姓名生成）
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### 核心流程

```mermaid
graph TD
    A[用户点击开始] --> B[创建会话]
    B --> C[生成 Gmail 别名]
    C --> D[获取 OIDC 授权链接]
    D --> E[打开无痕窗口]
    E --> F[Content Script 自动填表]
    F --> G[用户手动填写验证码]
    G --> H[Service Worker 轮询 Token]
    H --> I{Token 获取成功?}
    I -->|是| J[保存账号信息]
    I -->|否| K[记录失败]
    J --> L[验证 Token 状态]
    L --> M[导出结果]
```

---

## ⚠️ 注意事项

- ✅ **必须启用无痕模式权限**，否则无法创建无痕窗口
- ✅ **推荐使用 DuckDuckGo + TEmail 模式**，自动获取验证码，支持多窗口并发
- ✅ Gmail 别名模式需要手动填写验证码，建议并发设为 1
- ⚠️ Token 默认状态为「未验证」，需手动点击「验证」按钮
- 📱 仅支持 Chrome 浏览器（基于 Manifest V3）

---

## 🐛 常见问题

<details>
<summary><b>❓ 提示"创建无痕窗口失败"</b></summary>

**原因**：未启用无痕模式权限

**解决方案**：
1. 访问 `chrome://extensions/`
2. 找到本扩展，点击「详细信息」
3. 开启「在无痕模式下启用」
4. 刷新扩展（点击刷新图标 🔄）
</details>

<details>
<summary><b>❓ 提示"未配置 DuckDuckGo 或 TEmail 服务"</b></summary>

**原因**：未在插件中配置 DuckDuckGo Token 或 TEmail

**解决方案**：
1. 点击插件图标打开弹窗
2. 选择「DuckDuckGo」模式
3. 输入 DuckDuckGo Token 并保存
4. 展开「TEmail 自动验证码配置」
5. 输入 TEmail 配置（服务器地址、邮箱、JWT Token 或 Admin 密码）
6. 点击「保存配置」
</details>

<details>
<summary><b>❓ 提示"未配置 Gmail 地址"</b></summary>

**原因**：未在插件中配置 Gmail 地址

**解决方案**：
1. 点击插件图标打开弹窗
2. 选择「Gmail 别名」模式
3. 在「邮箱配置」区域输入你的 Gmail 地址
4. 点击「保存」按钮
</details>

<details>
<summary><b>❓ DuckDuckGo 模式收不到验证码</b></summary>

**原因**：TEmail 配置错误或邮件转发未生效

**解决方案**：
1. 确认 TEmail 服务器地址正确（默认：`https://email.chaijz.top`）
2. 确认 TEmail 邮箱地址正确（默认：`dkdkgo@chaijz.top`）
3. 确认 JWT Token 或 Admin 密码正确
4. 检查 DuckDuckGo 是否已设置邮件转发到 TEmail 邮箱
5. 查看浏览器控制台日志，确认是否有错误信息
</details>

<details>
<summary><b>❓ 收不到验证码邮件</b></summary>

**原因**：Gmail 别名可能被识别为垃圾邮件

**解决方案**：
1. 检查 Gmail 的「垃圾邮件」文件夹
2. 检查「所有邮件」确保邮件未被过滤
3. 确认 Gmail 地址输入正确
</details>

<details>
<summary><b>❓ Kiro 同步后 IDE 仍提示未登录</b></summary>

**原因**：配置文件未正确写入或 Kiro 未重启

**解决方案**：
1. 确认在正确的终端中执行命令（Windows 用 PowerShell，macOS/Linux 用 Terminal）
2. 检查 `~/.aws/sso/cache/` 目录是否存在配置文件
3. 完全退出并重启 Kiro IDE
4. 如果仍有问题，尝试删除旧的配置文件后重新同步
</details>

<details>
<summary><b>❓ Windows 执行命令报错</b></summary>

**原因**：可能使用了 CMD 而非 PowerShell

**解决方案**：
1. 确保使用 **PowerShell** 执行命令（不是 CMD）
2. 右键点击开始菜单，选择「Windows PowerShell」或「终端」
3. 粘贴命令并按回车执行
</details>

---

## 📄 License

本项目基于 [MIT License](LICENSE) 开源。

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star！**

Made with ❤️ by [Specia1z](https://github.com/Specia1z)

</div>
