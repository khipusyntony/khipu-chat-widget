/**
 * API Module - Communication with n8n backend
 */

export class API {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.integration?.webhookUrl || config.apiUrl;
  }

  /**
   * Send message to n8n webhook
   */
  async sendMessage(payload) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Token': this.config.integration?.clientToken || ''
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Load remote configuration
   */
  async loadConfig(botId) {
    try {
      const configUrl = `https://khipusyntony.github.io/khipu-chat-widget/config/${botId}.json`;
      const response = await fetch(configUrl);
      
      if (!response.ok) {
        throw new Error(`Config not found: ${botId}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Could not load config:', error);
      return null;
    }
  }
}
