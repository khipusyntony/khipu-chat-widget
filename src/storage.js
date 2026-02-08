/**
 * Storage Module - LocalStorage management
 */

export class Storage {
  constructor(botId) {
    this.botId = botId;
    this.storageKey = `khipu_chat_${botId}`;
    this.sessionKey = `khipu_session`;
  }

  /**
   * Get or create session ID
   */
  static getSessionId() {
    let sessionId = localStorage.getItem('khipu_session');
    
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('khipu_session', sessionId);
    }
    
    return sessionId;
  }

  /**
   * Get stored messages
   */
  getMessages() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      
      // Check if messages are expired (30 days)
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        this.clearMessages();
        return [];
      }
      
      return parsed.messages || [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  /**
   * Save a message
   */
  saveMessage(message) {
    try {
      const messages = this.getMessages();
      messages.push(message);
      
      // Keep only last 50 messages
      const trimmed = messages.slice(-50);
      
      const data = {
        messages: trimmed,
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  /**
   * Clear all messages
   */
  clearMessages() {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Get user data
   */
  getUserData() {
    try {
      const data = localStorage.getItem(`${this.storageKey}_user`);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Save user data
   */
  saveUserData(userData) {
    try {
      localStorage.setItem(`${this.storageKey}_user`, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }
}
