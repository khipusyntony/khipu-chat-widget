/**
 * Khipu Chat Widget - Main Entry Point
 * Sistema de chatbot multiempresa con IA para el mercado peruano
 * @version 1.0.0
 */

import './styles.scss';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { API } from './api';
import { Storage } from './storage';
import { Utils } from './utils';

class KhipuChatWidget {
  constructor(config = {}) {
    this.config = this.mergeConfig(config);
    this.isOpen = false;
    this.isMinimized = false;
    this.messages = [];
    this.sessionId = Storage.getSessionId();
    this.conversationId = Utils.generateId('conv');
    
    this.api = new API(this.config);
    this.storage = new Storage(this.config.botId);
    
    this.init();
  }

  /**
   * Merge user config with defaults
   */
  mergeConfig(userConfig) {
    const defaults = {
      botId: 'default',
      apiUrl: 'https://n8n.khipusyntony.com/webhook/chatbot',
      appearance: {
        primaryColor: '#6366F1',
        position: 'bottom-right',
        offset: { x: 20, y: 20 }
      },
      messages: {
        welcome: '¡Hola! 👋 ¿En qué puedo ayudarte?',
        placeholder: 'Escribe tu mensaje...',
        error: 'Lo siento, hubo un error. Intenta de nuevo.'
      },
      behavior: {
        autoOpen: false,
        showOnLoad: true
      }
    };

    return Utils.deepMerge(defaults, userConfig);
  }

  /**
   * Initialize widget
   */
  async init() {
    try {
      // Load config from server if botId provided
      if (this.config.botId !== 'default') {
        await this.loadRemoteConfig();
      }

      // Load conversation history
      this.messages = this.storage.getMessages();

      // Create DOM elements
      this.createWidget();
      
      // Attach event listeners
      this.attachEventListeners();
      
      // Show welcome message if first time
      if (this.messages.length === 0) {
        this.addMessage({
          text: this.config.messages.welcome,
          sender: 'bot',
          timestamp: new Date().toISOString()
        });
      }

      // Auto open if configured
      if (this.config.behavior.autoOpen) {
        setTimeout(() => this.open(), 1000);
      }

      console.log('Khipu Chat Widget initialized successfully');
    } catch (error) {
      console.error('Error initializing widget:', error);
    }
  }

  /**
   * Load remote configuration
   */
  async loadRemoteConfig() {
    try {
      const configUrl = `https://khipusyntony.github.io/khipu-chat-widget/config/${this.config.botId}.json`;
      const response = await fetch(configUrl);
      
      if (response.ok) {
        const remoteConfig = await response.json();
        this.config = Utils.deepMerge(this.config, remoteConfig);
      }
    } catch (error) {
      console.warn('Could not load remote config, using defaults:', error);
    }
  }

  /**
   * Create widget DOM structure
   */
  createWidget() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'khipu-chat-widget';
    this.container.style.setProperty('--primary-color', this.config.appearance.primaryColor);
    
    // Create button
    this.button = this.createButton();
    
    // Create chat window
    this.chatWindow = this.createChatWindow();
    
    // Append to container
    this.container.appendChild(this.button);
    this.container.appendChild(this.chatWindow);
    
    // Append to body
    document.body.appendChild(this.container);
    
    // Position widget
    this.positionWidget();
  }

  /**
   * Create floating button
   */
  createButton() {
    const button = document.createElement('button');
    button.className = 'khipu-chat-button';
    button.setAttribute('aria-label', 'Abrir chat');
    button.innerHTML = `
      <svg class="khipu-chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <span class="khipu-chat-badge" style="display: none;">0</span>
    `;
    
    return button;
  }

  /**
   * Create chat window
   */
  createChatWindow() {
    const window = document.createElement('div');
    window.className = 'khipu-chat-window';
    window.style.display = 'none';
    
    window.innerHTML = `
      <div class="khipu-chat-header">
        <div class="khipu-chat-header-info">
          <div class="khipu-chat-avatar">
            ${this.config.appearance.botAvatar 
              ? `<img src="${this.config.appearance.botAvatar}" alt="Bot" />`
              : '<span>💬</span>'
            }
          </div>
          <div class="khipu-chat-header-text">
            <div class="khipu-chat-title">${this.config.appearance.headerTitle || 'Asistente Virtual'}</div>
            <div class="khipu-chat-status">En línea</div>
          </div>
        </div>
        <div class="khipu-chat-header-actions">
          <button class="khipu-chat-minimize" aria-label="Minimizar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button class="khipu-chat-close" aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="khipu-chat-messages" id="khipu-messages"></div>
      
      <div class="khipu-chat-input-container">
        <textarea 
          class="khipu-chat-input" 
          placeholder="${this.config.messages.placeholder}"
          rows="1"
          maxlength="500"
        ></textarea>
        <button class="khipu-chat-send" aria-label="Enviar mensaje">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    `;
    
    return window;
  }

  /**
   * Position widget on screen
   */
  positionWidget() {
    const { position, offset } = this.config.appearance;
    const [vertical, horizontal] = position.split('-');
    
    this.container.style[vertical] = `${offset.y}px`;
    this.container.style[horizontal] = `${offset.x}px`;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Toggle chat
    this.button.addEventListener('click', () => this.toggle());
    
    // Close button
    const closeBtn = this.chatWindow.querySelector('.khipu-chat-close');
    closeBtn.addEventListener('click', () => this.close());
    
    // Minimize button
    const minimizeBtn = this.chatWindow.querySelector('.khipu-chat-minimize');
    minimizeBtn.addEventListener('click', () => this.minimize());
    
    // Send message
    const sendBtn = this.chatWindow.querySelector('.khipu-chat-send');
    const input = this.chatWindow.querySelector('.khipu-chat-input');
    
    sendBtn.addEventListener('click', () => this.sendMessage());
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });
  }

  /**
   * Toggle chat window
   */
  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  /**
   * Open chat window
   */
  open() {
    this.isOpen = true;
    this.isMinimized = false;
    this.chatWindow.style.display = 'flex';
    this.button.classList.add('khipu-chat-button-hidden');
    
    // Focus input
    setTimeout(() => {
      const input = this.chatWindow.querySelector('.khipu-chat-input');
      input.focus();
    }, 300);
    
    // Scroll to bottom
    this.scrollToBottom();
    
    // Clear badge
    this.updateBadge(0);
  }

  /**
   * Close chat window
   */
  close() {
    this.isOpen = false;
    this.chatWindow.style.display = 'none';
    this.button.classList.remove('khipu-chat-button-hidden');
  }

  /**
   * Minimize chat window
   */
  minimize() {
    this.isMinimized = !this.isMinimized;
    const messagesContainer = this.chatWindow.querySelector('.khipu-chat-messages');
    const inputContainer = this.chatWindow.querySelector('.khipu-chat-input-container');
    
    if (this.isMinimized) {
      messagesContainer.style.display = 'none';
      inputContainer.style.display = 'none';
      this.chatWindow.style.height = 'auto';
    } else {
      messagesContainer.style.display = 'flex';
      inputContainer.style.display = 'flex';
      this.chatWindow.style.height = '';
    }
  }

  /**
   * Send user message
   */
  async sendMessage() {
    const input = this.chatWindow.querySelector('.khipu-chat-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    // Add user message to UI
    this.addMessage({
      text,
      sender: 'user',
      timestamp: new Date().toISOString()
    });
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Show typing indicator
    this.showTypingIndicator();
    
    try {
      // Send to API
      const response = await this.api.sendMessage({
        message: { text, timestamp: new Date().toISOString() },
        user: { sessionId: this.sessionId },
        context: {
          conversationId: this.conversationId,
          currentPage: window.location.pathname
        },
        metadata: { botId: this.config.botId, source: 'web_widget' }
      });
      
      // Remove typing indicator
      this.hideTypingIndicator();
      
      // Add bot response
      if (response.success && response.data) {
        this.addMessage({
          text: response.data.message.text,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          quickReplies: response.data.quickReplies
        });
      }
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage({
        text: this.config.messages.error,
        sender: 'bot',
        timestamp: new Date().toISOString()
      });
      console.error('Error sending message:', error);
    }
  }

  /**
   * Add message to chat
   */
  addMessage(message) {
    this.messages.push(message);
    this.storage.saveMessage(message);
    
    const messagesContainer = this.chatWindow.querySelector('.khipu-chat-messages');
    const messageEl = this.createMessageElement(message);
    
    messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
    
    // Update badge if window is closed
    if (!this.isOpen && message.sender === 'bot') {
      this.updateBadge(1);
    }
  }

  /**
   * Create message DOM element
   */
  createMessageElement(message) {
    const div = document.createElement('div');
    div.className = `khipu-chat-message khipu-chat-message-${message.sender}`;
    
    // Sanitize and render markdown
    const sanitizedHtml = DOMPurify.sanitize(marked.parse(message.text));
    
    div.innerHTML = `
      <div class="khipu-chat-message-content">
        <div class="khipu-chat-message-text">${sanitizedHtml}</div>
        <div class="khipu-chat-message-time">${Utils.formatTime(message.timestamp)}</div>
      </div>
    `;
    
    // Add quick replies if present
    if (message.quickReplies && message.quickReplies.length > 0) {
      const quickRepliesEl = document.createElement('div');
      quickRepliesEl.className = 'khipu-chat-quick-replies';
      
      message.quickReplies.forEach(reply => {
        const button = document.createElement('button');
        button.className = 'khipu-chat-quick-reply';
        button.textContent = reply.label;
        button.addEventListener('click', () => {
          // Simulate user sending this message
          const input = this.chatWindow.querySelector('.khipu-chat-input');
          input.value = reply.label;
          this.sendMessage();
          
          // Remove quick replies after use
          quickRepliesEl.remove();
        });
        
        quickRepliesEl.appendChild(button);
      });
      
      div.appendChild(quickRepliesEl);
    }
    
    return div;
  }

  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    const messagesContainer = this.chatWindow.querySelector('.khipu-chat-messages');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'khipu-chat-typing';
    typingDiv.id = 'khipu-typing-indicator';
    typingDiv.innerHTML = `
      <div class="khipu-chat-typing-dot"></div>
      <div class="khipu-chat-typing-dot"></div>
      <div class="khipu-chat-typing-dot"></div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    this.scrollToBottom();
  }

  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    const indicator = document.getElementById('khipu-typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * Scroll messages to bottom
   */
  scrollToBottom() {
    const messagesContainer = this.chatWindow.querySelector('.khipu-chat-messages');
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  }

  /**
   * Update unread badge
   */
  updateBadge(increment = 0) {
    const badge = this.button.querySelector('.khipu-chat-badge');
    let count = parseInt(badge.textContent) || 0;
    
    count += increment;
    
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  /**
   * Public API Methods
   */
  
  // Open chat programmatically
  openChat() {
    this.open();
  }
  
  // Close chat programmatically
  closeChat() {
    this.close();
  }
  
  // Send message programmatically
  sendCustomMessage(text) {
    const input = this.chatWindow.querySelector('.khipu-chat-input');
    input.value = text;
    this.sendMessage();
  }
  
  // Update user data
  setUser(userData) {
    this.user = { ...this.user, ...userData };
  }
}

// Auto-initialize from script tag
function autoInit() {
  const script = document.currentScript || document.querySelector('script[data-bot-id]');
  
  if (script && script.hasAttribute('data-bot-id')) {
    const config = {
      botId: script.getAttribute('data-bot-id'),
      appearance: {
        primaryColor: script.getAttribute('data-color') || '#6366F1'
      }
    };
    
    // Wait for DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const instance = new KhipuChatWidget(config);
        
        // Expose public methods globally
        window.KhipuChat = {
          open: () => instance.openChat(),
          close: () => instance.closeChat(),
          sendMessage: (text) => instance.sendCustomMessage(text),
          setUser: (userData) => instance.setUser(userData),
          instance: instance
        };
        
        console.log('Khipu Chat Widget ready with public API');
      });
    } else {
      const instance = new KhipuChatWidget(config);
      
      // Expose public methods globally
      window.KhipuChat = {
        open: () => instance.openChat(),
        close: () => instance.closeChat(),
        sendMessage: (text) => instance.sendCustomMessage(text),
        setUser: (userData) => instance.setUser(userData),
        instance: instance
      };
      
      console.log('Khipu Chat Widget ready with public API');
    }
  }
}

// Run auto-init
autoInit();

// Export for manual initialization
export default KhipuChatWidget;
