/**
 * Model Context Protocol (MCP) Client
 * สำหรับเชื่อมต่อกับ MCP servers และจัดการ context
 */

class MCPClient {
  constructor(config = {}) {
    this.serverUrl = config.serverUrl || process.env.MCP_SERVER_URL || 'http://localhost:8000';
    this.apiKey = config.apiKey || process.env.MCP_API_KEY;
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
  }

  /**
   * เชื่อมต่อกับ MCP server
   */
  async connect() {
    try {
      const response = await this.makeRequest('/health', 'GET');
      if (response.status === 'ok') {
        console.log('MCP Client connected successfully');
        return true;
      }
      throw new Error('MCP server health check failed');
    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      return false;
    }
  }

  /**
   * ส่ง context ไปยัง MCP server
   */
  async sendContext(context) {
    try {
      const response = await this.makeRequest('/context', 'POST', {
        context,
        timestamp: new Date().toISOString(),
        source: 'unified-ai-workspace'
      });
      return response;
    } catch (error) {
      console.error('Failed to send context to MCP server:', error);
      throw error;
    }
  }

  /**
   * ดึง context จาก MCP server
   */
  async getContext(query) {
    try {
      const response = await this.makeRequest('/context/search', 'POST', {
        query,
        limit: 10,
        includeMetadata: true
      });
      return response.contexts || [];
    } catch (error) {
      console.error('Failed to get context from MCP server:', error);
      return [];
    }
  }

  /**
   * อัปเดต context ที่มีอยู่
   */
  async updateContext(contextId, updates) {
    try {
      const response = await this.makeRequest(`/context/${contextId}`, 'PUT', updates);
      return response;
    } catch (error) {
      console.error('Failed to update context:', error);
      throw error;
    }
  }

  /**
   * ลบ context
   */
  async deleteContext(contextId) {
    try {
      const response = await this.makeRequest(`/context/${contextId}`, 'DELETE');
      return response;
    } catch (error) {
      console.error('Failed to delete context:', error);
      throw error;
    }
  }

  /**
   * ดึงรายการ tools ที่ใช้ได้จาก MCP server
   */
  async getAvailableTools() {
    try {
      const response = await this.makeRequest('/tools', 'GET');
      return response.tools || [];
    } catch (error) {
      console.error('Failed to get available tools:', error);
      return [];
    }
  }

  /**
   * เรียกใช้ tool ผ่าน MCP server
   */
  async callTool(toolName, parameters) {
    try {
      const response = await this.makeRequest('/tools/call', 'POST', {
        tool: toolName,
        parameters,
        context: await this.getCurrentContext()
      });
      return response;
    } catch (error) {
      console.error(`Failed to call tool ${toolName}:`, error);
      throw error;
    }
  }

  /**
   * ดึง context ปัจจุบันจากแอปพลิเคชัน
   */
  async getCurrentContext() {
    // รวบรวม context จากส่วนต่างๆ ของแอปพลิเคชัน
    const context = {
      user: await this.getUserContext(),
      notes: await this.getNotesContext(),
      todos: await this.getTodosContext(),
      aiHistory: await this.getAIHistoryContext(),
      timestamp: new Date().toISOString()
    };
    return context;
  }

  /**
   * ดึง context ของผู้ใช้
   */
  async getUserContext() {
    try {
      // ดึงข้อมูลผู้ใช้จาก localStorage หรือ API
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          id: user.id,
          name: user.name,
          preferences: user.preferences || {},
          settings: user.settings || {}
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to get user context:', error);
      return null;
    }
  }

  /**
   * ดึง context ของบันทึก
   */
  async getNotesContext() {
    try {
      // ดึงบันทึกล่าสุดจาก API
      const response = await fetch('/api/notes?limit=5&recent=true');
      if (response.ok) {
        const notes = await response.json();
        return notes.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content.substring(0, 200), // เอาแค่ 200 ตัวอักษรแรก
          tags: note.tags,
          createdAt: note.createdAt
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get notes context:', error);
      return [];
    }
  }

  /**
   * ดึง context ของรายการงาน
   */
  async getTodosContext() {
    try {
      // ดึงรายการงานที่ยังไม่เสร็จจาก API
      const response = await fetch('/api/todos?status=pending&limit=5');
      if (response.ok) {
        const todos = await response.json();
        return todos.map(todo => ({
          id: todo.id,
          title: todo.title,
          priority: todo.priority,
          dueDate: todo.dueDate,
          status: todo.status
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get todos context:', error);
      return [];
    }
  }

  /**
   * ดึง context ของประวัติ AI
   */
  async getAIHistoryContext() {
    try {
      // ดึงประวัติการสนทนากับ AI ล่าสุด
      const response = await fetch('/api/ai/history?limit=3');
      if (response.ok) {
        const history = await response.json();
        return history.map(session => ({
          id: session.id,
          provider: session.provider,
          lastMessage: session.messages[session.messages.length - 1],
          createdAt: session.createdAt
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get AI history context:', error);
      return [];
    }
  }

  /**
   * ทำ HTTP request ไปยัง MCP server
   */
  async makeRequest(endpoint, method = 'GET', data = null, attempt = 1) {
    const url = `${this.serverUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const config = {
      method,
      headers,
      timeout: this.timeout
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt < this.retryAttempts) {
        console.warn(`MCP request failed, retrying... (${attempt}/${this.retryAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return this.makeRequest(endpoint, method, data, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * ปิดการเชื่อมต่อ
   */
  async disconnect() {
    try {
      await this.makeRequest('/disconnect', 'POST');
      console.log('MCP Client disconnected');
    } catch (error) {
      console.error('Error during MCP disconnect:', error);
    }
  }
}

// สร้าง singleton instance
let mcpClientInstance = null;

export function getMCPClient(config = {}) {
  if (!mcpClientInstance) {
    mcpClientInstance = new MCPClient(config);
  }
  return mcpClientInstance;
}

export default MCPClient;
