/**
 * TEmail 临时邮箱客户端
 * 支持 JWT Token 和 Admin 密码两种认证方式
 */

/**
 * 提取验证码（支持多种格式）
 * @param {string} raw - 邮件原始内容
 * @returns {string|null} 验证码
 */
function extractVerificationCode(raw) {
  if (!raw) return null;

  // 1. AWS 特定格式：Verification code:: 948971 (注意两个冒号)
  const awsMatch = raw.match(/Verification code::\s*(\d{6})/i);
  if (awsMatch) {
    console.log(`[TEmail] 匹配 AWS 格式: ${awsMatch[1]}`);
    return awsMatch[1];
  }

  // 2. 常见格式：Verification code: 123456 (一个冒号)
  const commonMatch = raw.match(/Verification code:\s*(\d{6})/i);
  if (commonMatch) {
    console.log(`[TEmail] 匹配常见格式: ${commonMatch[1]}`);
    return commonMatch[1];
  }

  // 3. 验证码格式：Your code is 123456
  const codeIsMatch = raw.match(/(?:code|Code)\s+is\s+(\d{6})/i);
  if (codeIsMatch) {
    console.log(`[TEmail] 匹配 'code is' 格式: ${codeIsMatch[1]}`);
    return codeIsMatch[1];
  }

  // 4. 验证码格式：验证码：123456
  const chineseMatch = raw.match(/验证码[：:]\s*(\d{6})/);
  if (chineseMatch) {
    console.log(`[TEmail] 匹配中文格式: ${chineseMatch[1]}`);
    return chineseMatch[1];
  }

  // 5. 通用格式：独立的 6 位数字（最后尝试，避免误匹配）
  const genericMatch = raw.match(/(?<!\d)(\d{6})(?!\d)/);
  if (genericMatch) {
    console.log(`[TEmail] 匹配通用格式: ${genericMatch[1]}`);
    return genericMatch[1];
  }

  console.log(`[TEmail] 未找到验证码`);
  return null;
}

/**
 * TEmail 客户端
 */
class TEmailClient {
  /**
   * @param {Object} options - 配置选项
   * @param {string} options.baseUrl - TEmail 服务器地址
   * @param {string} options.email - TEmail 邮箱地址
   * @param {string} [options.jwt] - JWT Token（可选）
   * @param {string} [options.adminPassword] - Admin 密码（可选）
   */
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl || '').replace(/\/$/, '');
    this.email = options.email || '';
    this.jwt = options.jwt || null;
    this.adminPassword = options.adminPassword || '';
  }

  /**
   * 通过 Admin API 获取 JWT Token
   * @returns {Promise<string>} JWT Token
   */
  async fetchJwtToken() {
    if (!this.adminPassword) {
      throw new Error('未设置 Admin 密码');
    }

    const emailName = this.email.split('@')[0];

    // 1. 查询邮箱地址 ID
    const listResponse = await fetch(
      `${this.baseUrl}/admin/address?limit=100&offset=0&query=${emailName}`,
      {
        headers: {
          'x-admin-auth': this.adminPassword,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!listResponse.ok) {
      throw new Error(`查询邮箱失败: ${listResponse.status}`);
    }

    const listData = await listResponse.json();
    if (!listData.results || listData.results.length === 0) {
      throw new Error(`找不到邮箱: ${this.email}`);
    }

    const addressId = listData.results[0].id;

    // 2. 获取 JWT Token
    const jwtResponse = await fetch(
      `${this.baseUrl}/admin/show_password/${addressId}`,
      {
        headers: {
          'x-admin-auth': this.adminPassword,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!jwtResponse.ok) {
      throw new Error(`获取 JWT 失败: ${jwtResponse.status}`);
    }

    const jwtData = await jwtResponse.json();
    this.jwt = jwtData.jwt;
    console.log('[TEmail] 通过 Admin API 获取 JWT Token 成功');
    return this.jwt;
  }

  /**
   * 确保有可用的 JWT Token
   * @returns {Promise<string>} JWT Token
   */
  async ensureJwtToken() {
    if (this.jwt) {
      return this.jwt;
    }

    if (this.adminPassword) {
      return await this.fetchJwtToken();
    }

    throw new Error('未设置 JWT Token 或 Admin 密码');
  }

  /**
   * 查询邮件列表
   * @param {number} limit - 限制数量
   * @param {number} offset - 偏移量
   * @returns {Promise<Array>} 邮件列表
   */
  async fetchMails(limit = 20, offset = 0) {
    await this.ensureJwtToken();

    const response = await fetch(
      `${this.baseUrl}/api/mails?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${this.jwt}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`获取邮件失败: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  }

  /**
   * 等待并获取验证码（优化版 - 使用邮件 ID 排序而非时间比较）
   * @param {Object} options - 选项
   * @param {number} [options.startMailId] - 起始邮件 ID（可选）
   * @param {number} [options.maxAttempts=30] - 最大尝试次数
   * @param {number} [options.interval=2000] - 检查间隔（毫秒）
   * @returns {Promise<string>} 验证码
   */
  async waitForVerificationCode(options = {}) {
    const {
      startMailId = null,
      maxAttempts = 30,
      interval = 2000
    } = options;

    await this.ensureJwtToken();

    console.log(`[TEmail] 开始监听验证码`);
    if (startMailId) {
      console.log(`[TEmail] 起始邮件 ID: ${startMailId}（只处理 ID > ${startMailId} 的邮件）`);
    } else {
      console.log(`[TEmail] 未指定起始邮件 ID，将处理所有新邮件`);
    }

    const processedMailIds = new Set(); // 记录已处理的邮件 ID

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`[TEmail] 尝试 ${attempt}/${maxAttempts}...`);

      try {
        const mails = await this.fetchMails(20, 0);
        console.log(`[TEmail] 收到 ${mails.length} 封邮件`);

        for (const mail of mails) {
          // 跳过已处理的邮件
          if (processedMailIds.has(mail.id)) {
            continue;
          }

          console.log(`[TEmail] 检查邮件 ID ${mail.id}`);
          console.log(`[TEmail]   创建时间: ${mail.created_at}`);

          // 如果指定了起始邮件 ID，只处理 ID 更大的邮件
          // 邮件 ID 通常是递增的，新邮件 ID 更大
          if (startMailId !== null && mail.id <= startMailId) {
            console.log(`[TEmail]   ✗ 跳过旧邮件 (ID ${mail.id} <= ${startMailId})`);
            processedMailIds.add(mail.id);
            continue;
          }

          console.log(`[TEmail]   ✓ 邮件 ID 符合条件`);

          // 检查邮件来源（可选，增加准确性）
          const source = (mail.source || '').toLowerCase();
          console.log(`[TEmail]   来源: ${source}`);

          // 直接提取验证码
          const code = extractVerificationCode(mail.raw);
          if (code) {
            console.log(`[TEmail]   ✓✓✓ 找到验证码: ${code}`);
            return code;
          }

          console.log(`[TEmail]   ✗ 邮件中未找到验证码`);
          processedMailIds.add(mail.id);
        }
      } catch (error) {
        console.error(`[TEmail] 获取邮件时出错:`, error);
      }

      // 等待下一次检查
      if (attempt < maxAttempts) {
        console.log(`[TEmail] 等待 ${interval}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    throw new Error('超时：未能在规定时间内收到验证码');
  }

  /**
   * 获取最新邮件的 ID
   * @returns {Promise<number|null>} 最新邮件 ID
   */
  async getLatestMailId() {
    try {
      await this.ensureJwtToken();
      const mails = await this.fetchMails(1, 0);
      if (mails.length > 0) {
        const latestId = mails[0].id;
        console.log(`[TEmail] 当前最新邮件 ID: ${latestId}`);
        return latestId;
      }
      console.log(`[TEmail] 邮箱为空，无邮件`);
      return null;
    } catch (error) {
      console.error(`[TEmail] 获取最新邮件 ID 失败:`, error);
      return null;
    }
  }

  /**
   * 检查是否已配置
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.baseUrl &&
           !!this.email &&
           (!!this.jwt || !!this.adminPassword);
  }
}

export { TEmailClient, extractVerificationCode };
