/**
 * Agent Sandbox Integration
 * สำหรับเชื่อมต่อและจัดการ AI Agents ใน Sandbox environment
 */

import { getMCPClient } from '../mcp/mcpClient.js';

class SandboxAgent {
  constructor(config = {}) {
    this.sandboxUrl = config.sandboxUrl || process.env.AGENT_SANDBOX_URL || 'http://localhost:8080';
    this.apiKey = config.apiKey || process.env.AGENT_API_KEY;
    this.mcpClient = getMCPClient();
    this.activeAgents = new Map();
    this.taskQueue = [];
    this.isProcessing = false;
  }

  /**
   * เริ่มต้น Agent Sandbox
   */
  async initialize() {
    try {
      // เชื่อมต่อกับ MCP Client
      await this.mcpClient.connect();
      
      // ตรวจสอบสถานะ Sandbox
      const sandboxStatus = await this.checkSandboxStatus();
      if (!sandboxStatus.available) {
        throw new Error('Agent Sandbox is not available');
      }

      console.log('Agent Sandbox initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Agent Sandbox:', error);
      return false;
    }
  }

  /**
   * ตรวจสอบสถานะ Sandbox
   */
  async checkSandboxStatus() {
    try {
      const response = await this.makeRequest('/status', 'GET');
      return {
        available: response.status === 'ready',
        activeAgents: response.activeAgents || 0,
        maxAgents: response.maxAgents || 10,
        resources: response.resources || {}
      };
    } catch (error) {
      console.error('Failed to check sandbox status:', error);
      return { available: false };
    }
  }

  /**
   * สร้าง Agent ใหม่
   */
  async createAgent(agentConfig) {
    try {
      const config = {
        type: agentConfig.type || 'general',
        name: agentConfig.name || `agent-${Date.now()}`,
        capabilities: agentConfig.capabilities || ['text-processing'],
        model: agentConfig.model || 'gpt-3.5-turbo',
        systemPrompt: agentConfig.systemPrompt || 'You are a helpful AI assistant.',
        tools: agentConfig.tools || [],
        context: await this.mcpClient.getCurrentContext()
      };

      const response = await this.makeRequest('/agents', 'POST', config);
      
      if (response.success) {
        const agent = {
          id: response.agentId,
          ...config,
          status: 'active',
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        };

        this.activeAgents.set(agent.id, agent);
        console.log(`Agent ${agent.name} created successfully`);
        return agent;
      }

      throw new Error(response.error || 'Failed to create agent');
    } catch (error) {
      console.error('Failed to create agent:', error);
      throw error;
    }
  }

  /**
   * ส่งงานให้ Agent
   */
  async assignTask(agentId, task) {
    try {
      const agent = this.activeAgents.get(agentId);
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      const taskData = {
        id: `task-${Date.now()}`,
        agentId,
        type: task.type || 'general',
        instruction: task.instruction,
        data: task.data || {},
        priority: task.priority || 'normal',
        timeout: task.timeout || 300000, // 5 minutes default
        context: await this.mcpClient.getCurrentContext(),
        createdAt: new Date().toISOString()
      };

      const response = await this.makeRequest(`/agents/${agentId}/tasks`, 'POST', taskData);
      
      if (response.success) {
        // อัปเดต context ใน MCP
        await this.mcpClient.sendContext({
          type: 'agent-task',
          agentId,
          taskId: taskData.id,
          instruction: task.instruction,
          timestamp: taskData.createdAt
        });

        return {
          taskId: response.taskId,
          status: 'assigned',
          estimatedCompletion: response.estimatedCompletion
        };
      }

      throw new Error(response.error || 'Failed to assign task');
    } catch (error) {
      console.error('Failed to assign task:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบสถานะงาน
   */
  async getTaskStatus(taskId) {
    try {
      const response = await this.makeRequest(`/tasks/${taskId}`, 'GET');
      return {
        id: taskId,
        status: response.status,
        progress: response.progress || 0,
        result: response.result,
        error: response.error,
        startedAt: response.startedAt,
        completedAt: response.completedAt
      };
    } catch (error) {
      console.error('Failed to get task status:', error);
      return { id: taskId, status: 'error', error: error.message };
    }
  }

  /**
   * รอผลลัพธ์จากงาน
   */
  async waitForTaskCompletion(taskId, timeout = 300000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const status = await this.getTaskStatus(taskId);
      
      if (status.status === 'completed') {
        return status.result;
      }
      
      if (status.status === 'failed' || status.status === 'error') {
        throw new Error(status.error || 'Task failed');
      }
      
      // รอ 2 วินาทีก่อนตรวจสอบอีกครั้ง
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Task timeout');
  }

  /**
   * ยกเลิกงาน
   */
  async cancelTask(taskId) {
    try {
      const response = await this.makeRequest(`/tasks/${taskId}/cancel`, 'POST');
      return response.success;
    } catch (error) {
      console.error('Failed to cancel task:', error);
      return false;
    }
  }

  /**
   * ดึงรายการ Agent ที่ใช้งานได้
   */
  getActiveAgents() {
    return Array.from(this.activeAgents.values());
  }

  /**
   * หยุดการทำงานของ Agent
   */
  async stopAgent(agentId) {
    try {
      const response = await this.makeRequest(`/agents/${agentId}/stop`, 'POST');
      
      if (response.success) {
        this.activeAgents.delete(agentId);
        console.log(`Agent ${agentId} stopped successfully`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to stop agent:', error);
      return false;
    }
  }

  /**
   * ดึงข้อมูลการใช้งาน Agent
   */
  async getAgentMetrics(agentId) {
    try {
      const response = await this.makeRequest(`/agents/${agentId}/metrics`, 'GET');
      return {
        tasksCompleted: response.tasksCompleted || 0,
        averageExecutionTime: response.averageExecutionTime || 0,
        successRate: response.successRate || 0,
        resourceUsage: response.resourceUsage || {},
        uptime: response.uptime || 0
      };
    } catch (error) {
      console.error('Failed to get agent metrics:', error);
      return {};
    }
  }

  /**
   * สร้าง Agent สำหรับงานเฉพาะ
   */
  async createSpecializedAgent(type, config = {}) {
    const agentConfigs = {
      'note-analyzer': {
        type: 'note-analyzer',
        name: 'Note Analyzer Agent',
        capabilities: ['text-analysis', 'summarization', 'tagging'],
        systemPrompt: 'You are an expert at analyzing notes and documents. You can summarize content, extract key points, suggest tags, and identify relationships between different pieces of information.',
        tools: ['text-analyzer', 'tag-generator', 'summarizer']
      },
      'task-manager': {
        type: 'task-manager',
        name: 'Task Manager Agent',
        capabilities: ['task-planning', 'scheduling', 'prioritization'],
        systemPrompt: 'You are a task management expert. You can help organize tasks, set priorities, create schedules, and suggest optimal workflows.',
        tools: ['calendar', 'priority-calculator', 'workflow-optimizer']
      },
      'research-assistant': {
        type: 'research-assistant',
        name: 'Research Assistant Agent',
        capabilities: ['web-search', 'information-synthesis', 'fact-checking'],
        systemPrompt: 'You are a research assistant that can help gather information, verify facts, and synthesize knowledge from multiple sources.',
        tools: ['web-search', 'fact-checker', 'citation-generator']
      },
      'code-helper': {
        type: 'code-helper',
        name: 'Code Helper Agent',
        capabilities: ['code-analysis', 'debugging', 'documentation'],
        systemPrompt: 'You are a programming assistant that can help with code analysis, debugging, documentation, and best practices.',
        tools: ['code-analyzer', 'debugger', 'doc-generator']
      }
    };

    const agentConfig = { ...agentConfigs[type], ...config };
    return await this.createAgent(agentConfig);
  }

  /**
   * ทำ HTTP request ไปยัง Agent Sandbox
   */
  async makeRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.sandboxUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const config = {
      method,
      headers
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * ปิดการทำงานของ Sandbox
   */
  async shutdown() {
    try {
      // หยุดการทำงานของ Agent ทั้งหมด
      const stopPromises = Array.from(this.activeAgents.keys()).map(agentId => 
        this.stopAgent(agentId)
      );
      await Promise.all(stopPromises);

      // ปิดการเชื่อมต่อ MCP
      await this.mcpClient.disconnect();

      console.log('Agent Sandbox shutdown completed');
    } catch (error) {
      console.error('Error during sandbox shutdown:', error);
    }
  }
}

// สร้าง singleton instance
let sandboxAgentInstance = null;

export function getSandboxAgent(config = {}) {
  if (!sandboxAgentInstance) {
    sandboxAgentInstance = new SandboxAgent(config);
  }
  return sandboxAgentInstance;
}

export default SandboxAgent;
