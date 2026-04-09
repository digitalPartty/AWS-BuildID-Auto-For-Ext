/**
 * DuckDuckGo + TEmail 邮箱服务客户端
 * 使用 DuckDuckGo 生成别名，邮件转发到 TEmail 自动获取验证码
 */

// 导入 DuckDuckGo 和 TEmail 客户端
import { DuckDuckGoMailClient } from './duckduckgo-client.js';
import { TEmailClient } from './temail-client.js';

/**
 * DuckDuckGo + TEmail 组合客户端
 * 使用 DuckDuckGo 生成别名，邮件转发到 TEmail 自动获取验证码
 */
class DuckDuckGoWithTEmailClient {
  /**
   * @param {Object} options - 配置选项
   * @param {string} options.duckToken - DuckDuckGo Token
   * @param {string} options.temailBaseUrl - TEmail 服务器地址
   * @param {string} options.temailEmail - TEmail 邮箱地址
   * @param {string} [options.temailJwt] - TEmail JWT Token（可选）
   * @param {string} [options.temailAdminPassword] - TEmail Admin 密码（可选）
   */
  constructor(options = {}) {
    this.duckToken = options.duckToken || '';
    this.temailConfig = {
      baseUrl: options.temailBaseUrl || '',
      email: options.temailEmail || '',
      jwt: options.temailJwt || null,
      adminPassword: options.temailAdminPassword || ''
    };
    this.currentDuckAddress = null;
    this.startMailId = null; // 记录起始邮件 ID 而不是时间
  }

  /**
   * 创建邮箱（DuckDuckGo 别名）
   * @returns {Promise<string>} 邮箱地址
   */
  async createInbox() {
    // 1. 获取当前最新邮件 ID（作为基准）
    console.log(`[DuckDuckGo+TEmail] 获取当前最新邮件 ID...`);
    const temailClient = new TEmailClient(this.temailConfig);
    this.startMailId = await temailClient.getLatestMailId();
    console.log(`[DuckDuckGo+TEmail] 起始邮件 ID: ${this.startMailId}`);

    // 2. 创建 DuckDuckGo 别名
    console.log(`[DuckDuckGo+TEmail] 开始创建 DuckDuckGo 别名...`);
    const duckClient = new DuckDuckGoMailClient({ token: this.duckToken });
    this.currentDuckAddress = await duckClient.createInbox();
    
    if (!this.currentDuckAddress || !this.currentDuckAddress.includes('@')) {
      console.error(`[DuckDuckGo+TEmail] 创建的邮箱地址无效: ${this.currentDuckAddress}`);
      throw new Error(`创建的邮箱地址无效: ${this.currentDuckAddress}`);
    }
    
    console.log(`[DuckDuckGo+TEmail] ✓ 别名已创建: ${this.currentDuckAddress}`);

    return this.currentDuckAddress;
  }

  /**
   * 等待并获取验证码（从 TEmail）
   * @param {number} maxAttempts - 最大尝试次数
   * @param {number} interval - 检查间隔（毫秒）
   * @returns {Promise<string>} 验证码
   */
  async waitForVerificationCode(maxAttempts = 30, interval = 2000) {
    if (!this.currentDuckAddress) {
      throw new Error('请先调用 createInbox() 创建别名');
    }

    const temailClient = new TEmailClient(this.temailConfig);

    return await temailClient.waitForVerificationCode({
      startMailId: this.startMailId, // 使用邮件 ID 而不是时间
      maxAttempts,
      interval
    });
  }

  /**
   * 删除邮箱
   */
  async deleteInbox() {
    this.currentDuckAddress = null;
  }

  /**
   * 获取邮箱信息
   */
  getInfo() {
    return {
      duckAddress: this.currentDuckAddress,
      temailAddress: this.temailConfig.email,
      type: 'duckduckgo-temail'
    };
  }

  /**
   * 检查是否已配置
   */
  isConfigured() {
    return !!this.duckToken &&
           !!this.temailConfig.baseUrl &&
           !!this.temailConfig.email &&
           (!!this.temailConfig.jwt || !!this.temailConfig.adminPassword);
  }
}

export {
  DuckDuckGoWithTEmailClient
};
