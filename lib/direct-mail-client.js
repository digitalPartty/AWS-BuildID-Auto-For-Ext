/**
 * 直接邮件 API 客户端
 * 使用 GET 请求直接获取新邮件，替代 DuckDuckGo + TEmail 组合模式
 */

/**
 * 提取验证码（支持多种格式）
 * @param {string} text - 邮件内容
 * @returns {string|null} 验证码
 */
function extractVerificationCode(text) {
  if (!text) return null;

  // 1. AWS 特定格式：Verification code:: 948971
  const awsMatch = text.match(/Verification code::\s*(\d{6})/i);
  if (awsMatch) return awsMatch[1];

  // 2. 常见格式：Verification code: 123456
  const commonMatch = text.match(/Verification code:\s*(\d{6})/i);
  if (commonMatch) return commonMatch[1];

  // 3. Your code is 123456
  const codeIsMatch = text.match(/(?:code|Code)\s+is\s+(\d{6})/i);
  if (codeIsMatch) return codeIsMatch[1];

  // 4. 验证码：123456
  const chineseMatch = text.match(/验证码[：:]\s*(\d{6})/);
  if (chineseMatch) return chineseMatch[1];

  // 5. 通用格式：独立的 6 位数字
  const genericMatch = text.match(/(?<!\d)(\d{6})(?!\d)/);
  if (genericMatch) return genericMatch[1];

  return null;
}

/**
 * 直接邮件 API 客户端
 * 通过 GET 请求直接获取新邮件和验证码
 */
class DirectMailClient {
  /**
   * @param {Object} options - 配置选项
   * @param {string} options.baseUrl - API 服务器地址
   * @param {string} options.refreshToken - 刷新令牌
   * @param {string} options.clientId - 客户端 ID
   * @param {string} options.email - 邮箱地址
   * @param {string} [options.mailbox='INBOX'] - 邮箱名称
   * @param {string} [options.responseType='json'] - 响应类型
   */
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl || '').replace(/\/$/, '');
    this.refreshToken = options.refreshToken || '';
    this.clientId = options.clientId || '';
    this.email = options.email || '';
    this.mailbox = options.mailbox || 'INBOX';
    this.responseType = options.responseType || 'json';
  }

  /**
   * 创建邮箱（此模式下邮箱已存在，直接返回）
   * @returns {Promise<string>} 邮箱地址
   */
  async createInbox() {
    console.log(`[DirectMail] 使用现有邮箱: ${this.email}`);
    return this.email;
  }

  /**
   * 获取新邮件
   * @returns {Promise<Object>} 邮件数据
   */
  async fetchNewMails() {
    // 构建 URL 参数
    const params = new URLSearchParams({
      refresh_token: this.refreshToken,
      client_id: this.clientId,
      email: this.email,
      mailbox: this.mailbox,
      response_type: this.responseType
    });

    // 拼接完整 URL
    const url = `${this.baseUrl}/api/mail-new?${params.toString()}`;

    console.log(`[DirectMail] GET 请求获取新邮件...`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`请求失败: HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(`[DirectMail] 请求成功，收到 ${data.mails?.length || 0} 封邮件`);
      return data;

    } catch (error) {
      console.error(`[DirectMail] 请求错误: ${error.message}`);
      throw error;
    }
  }

  /**
   * 等待并获取验证码
   * @param {number} maxAttempts - 最大尝试次数
   * @param {number} interval - 检查间隔（毫秒）
   * @returns {Promise<string>} 验证码
   */
  async waitForVerificationCode(maxAttempts = 30, interval = 2000) {
    console.log(`[DirectMail] 开始监听验证码，最多尝试 ${maxAttempts} 次`);

    const processedMailIds = new Set(); // 记录已处理的邮件 ID

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`[DirectMail] 尝试 ${attempt}/${maxAttempts}...`);

      try {
        const data = await this.fetchNewMails();
        const mails = data.mails || [];

        for (const mail of mails) {
          // 跳过已处理的邮件
          const mailId = mail.id || mail.uid || mail.messageId;
          if (processedMailIds.has(mailId)) {
            continue;
          }

          console.log(`[DirectMail] 检查邮件: ${mail.subject || '(无主题)'}`);

          // 从邮件内容中提取验证码
          const content = mail.text || mail.body || mail.raw || '';
          const code = extractVerificationCode(content);

          if (code) {
            console.log(`[DirectMail] ✓✓✓ 找到验证码: ${code}`);
            return code;
          }

          console.log(`[DirectMail] ✗ 邮件中未找到验证码`);
          processedMailIds.add(mailId);
        }
      } catch (error) {
        console.error(`[DirectMail] 获取邮件时出错:`, error);
      }

      // 等待下一次检查
      if (attempt < maxAttempts) {
        console.log(`[DirectMail] 等待 ${interval}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    throw new Error('超时：未能在规定时间内收到验证码');
  }

  /**
   * 删除邮箱（此模式下不需要删除）
   */
  async deleteInbox() {
    console.log(`[DirectMail] 邮箱保持不变`);
  }

  /**
   * 获取邮箱信息
   */
  getInfo() {
    return {
      email: this.email,
      mailbox: this.mailbox,
      type: 'direct-mail'
    };
  }

  /**
   * 检查是否已配置
   */
  isConfigured() {
    return !!this.baseUrl &&
           !!this.refreshToken &&
           !!this.clientId &&
           !!this.email;
  }
}

export { DirectMailClient, extractVerificationCode };
