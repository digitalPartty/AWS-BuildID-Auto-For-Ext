# Machine ID 配置指南

## 什么是 Machine ID？

Machine ID 是一个符合 **RFC 4122 标准的 UUID v4** 格式标识符，用于唯一标识一台计算机。

**格式：** `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` (全部小写)

**示例：** `a1b2c3d4-e5f6-4789-a012-3456789abcde`

在导出的 JSON 文件中，每个账号都会包含这个 machineId 字段。

## 配置方式

### 方式1：使用自动生成（默认）

如果不手动配置，扩展会使用 `crypto.randomUUID()` 自动生成一个符合标准的 UUID v4。

**优点：**
- 无需手动操作
- 符合 RFC 4122 标准
- 使用加密安全的随机数生成器

**缺点：**
- 不是系统真实的 MachineGuid
- 每次生成都不同（除非保存配置）

### 方式2：使用 Windows 真实 MachineGuid

#### 步骤1：获取 Windows MachineGuid

打开 **命令提示符** 或 **PowerShell**，运行以下命令：

```cmd
reg query HKLM\SOFTWARE\Microsoft\Cryptography /v MachineGuid
```

输出示例：
```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Cryptography
    MachineGuid    REG_SZ    a1b2c3d4-e5f6-4789-a012-3456789abcde
```

#### 步骤2：转换为小写（如果需要）

Windows 的 MachineGuid 已经是 UUID 格式，只需确保全部小写：

```powershell
$guid = (Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Cryptography" -Name MachineGuid).MachineGuid
$machineId = $guid.ToLower()
Write-Host "Machine ID: $machineId"
```

#### 步骤3：配置到扩展

1. 打开扩展弹窗
2. 找到 **🖥️ Machine ID** 配置区域
3. 将 UUID 格式的字符串粘贴到输入框
4. 点击 **保存** 按钮

## 导出的 JSON 格式

配置后，导出的 JSON 文件格式如下：

```json
[
  {
    "clientId": "...",
    "clientSecret": "...",
    "accessToken": "...",
    "refreshToken": "...",
    "machineId": "a1b2c3d4-e5f6-4789-a012-3456789abcde"
  }
]
```

## UUID v4 格式说明

UUID v4 格式由 5 组十六进制数字组成，用连字符分隔：

```
xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
```

- **第1组**：8个十六进制字符
- **第2组**：4个十六进制字符
- **第3组**：4个十六进制字符，第一个字符必须是 `4`（表示版本4）
- **第4组**：4个十六进制字符，第一个字符必须是 `8`, `9`, `a`, 或 `b`
- **第5组**：12个十六进制字符

**总长度：** 36个字符（包含4个连字符）

## 常见问题

### Q: 为什么需要 Machine ID？

A: Machine ID 用于标识设备，某些系统可能需要这个信息来：
- 限制同一账号在不同设备上的使用
- 追踪和审计
- 设备绑定

### Q: 可以使用任意的 UUID v4 吗？

A: 可以，但建议使用系统真实的 MachineGuid 或自动生成的值，以保持一致性。

### Q: 如果不配置会怎样？

A: 扩展会自动生成一个符合 RFC 4122 标准的 UUID v4，对大多数场景已经足够。

### Q: Windows MachineGuid 是 UUID v4 格式吗？

A: Windows MachineGuid 是 UUID 格式，但不一定是 v4。不过格式兼容，可以直接使用。

### Q: 浏览器扩展为什么不能直接读取注册表？

A: 出于安全考虑，浏览器扩展运行在沙箱环境中，无法直接访问系统注册表或执行系统命令。

## 技术说明

### 自动生成方法

使用浏览器内置的 `crypto.randomUUID()` API：
- 符合 RFC 4122 标准
- 使用加密安全的随机数生成器（CSPRNG）
- 自动生成 UUID v4 格式
- 全部转换为小写

### Windows MachineGuid 位置

注册表路径：
```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Cryptography\MachineGuid
```

这是 Windows 系统在安装时生成的唯一标识符，通常不会改变（除非重装系统）。

### RFC 4122 标准

UUID v4 的生成规则：
- 使用随机数或伪随机数生成122位
- 设置版本字段为 `0100`（第13-16位）
- 设置变体字段为 `10`（第17-18位）
- 其余位随机生成
