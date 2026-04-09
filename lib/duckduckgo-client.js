/**
 * DuckDuckGo 邮箱别名客户端
 * 通过 DuckDuckGo Email Protection API 创建临时邮箱别名
 */

/**
 * DuckDuckGo 邮箱客户端
 */
class DuckDuckGoMailClient {
  /**
   * @param {Object} options - 配置选项
   * @param {string} options.token - DuckDuckGo Token
   */
  constructor(options = {}) {
    this.token = options.token || '';
    this.baseUrl = 'https://quack.duckduckgo.com/api';
    this.address = null;
  }

  /**
   * 创建新的邮箱别名
   * @returns {Promise<string>} 邮箱地址
   */
  async createInbox() {
    if (!this.token) {
      throw new Error('未设置 DuckDuckGo Token');
    }

    console.log('[DuckDuckGo] 开始创建别名...');

    try {
      const response = await fetch(`${this.baseUrl}/email/addresses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DuckDuckGo] API 错误:', response.status, errorText);
        throw new Error(`创建别名失败: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('[DuckDuckGo] API 响应:', JSON.stringify(data, null, 2));

      // DuckDuckGo API 返回格式可能是：
      // { "address": "xxx@duck.com" } 或
      // { "address": "xxx" } 或
      // { "email": "xxx@duck.com" } 或其他格式
      
      let emailAddress = null;

      // 尝试多种可能的字段名
      const possibleFields = ['address', 'email', 'alias', 'duck_address', 'private_address'];
      for (const field of possibleFields) {
        if (data[field]) {
          emailAddress = data[field];
          break;
        }
      }

      if (!emailAddress) {
        console.error('[DuckDuckGo] 无法从响应中提取邮箱地址，完整响应:', data);
        throw new Error('无法从 API 响应中提取邮箱地址');
      }

      // 如果返回的地址不包含 @，添加 @duck.com 域名
      if (!emailAddress.includes('@')) {
        console.log(`[DuckDuckGo] 地址不包含域名，添加 @duck.com: ${emailAddress}`);
        emailAddress = `${emailAddress}@duck.com`;
      }

      this.address = emailAddress;
      console.log(`[DuckDuckGo] ✓ 别名创建成功: ${this.address}`);
      return this.address;

    } catch (error) {
      console.error('[DuckDuckGo] 创建别名异常:', error);
      throw error;
    }
  }

  /**
   * 删除邮箱别名
   */
  async deleteInbox() {
    this.address = null;
  }

  /**
   * 获取邮箱信息
   */
  getInfo() {
    return {
      address: this.address,
      type: 'duckduckgo'
    };
  }

  /**
   * 检查是否已配置
   */
  isConfigured() {
    return !!this.token;
  }
}

export { DuckDuckGoMailClient };
