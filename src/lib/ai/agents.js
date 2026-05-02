import { AIProviderManager } from './providers.js';
import { opikTracker } from './opik.js';
import { notesAPI } from '../../api/notes.js';
import { generateId } from '../../utils/index.js';

export class AIAgent {
  constructor(name, description, capabilities = []) {
    this.id = generateId();
    this.name = name;
    this.description = description;
    this.capabilities = capabilities;
    this.isActive = true;
    this.createdAt = new Date();
  }

  async execute(task, context = {}) {
    throw new Error('Execute method must be implemented by subclass');
  }

  async log(action, data) {
    await opikTracker.trackAgentAction({
      agentType: this.name,
      action,
      parameters: data.parameters || {},
      context: data.context || {},
      result: data.result,
      success: data.success,
      executionTime: data.executionTime,
      userId: data.userId
    });
  }
}

// Note Summarizer Agent
export class NoteSummarizerAgent extends AIAgent {
  constructor() {
    super(
      'NoteSummarizer',
      'สรุปเนื้อหาบันทึกและสร้าง key insights',
      ['text-analysis', 'summarization', 'insight-generation']
    );
  }

  async execute(task, context) {
    const startTime = Date.now();
    const { noteId, userId, aiProviderId } = context;

    try {
      // Get note content
      const notes = await notesAPI.getNotes(userId);
      const note = notes.find(n => n.id === noteId);
      
      if (!note) {
        throw new Error('Note not found');
      }

      // Use AI to summarize
      const aiManager = new AIProviderManager(userId);
      const response = await aiManager.chat(aiProviderId, [
        {
          role: 'system',
          content: 'คุณเป็นผู้เชี่ยวชาญในการสรุปเนื้อหา กรุณาสรุปเนื้อหาต่อไปนี้และให้ key insights ที่สำคัญ'
        },
        {
          role: 'user',
          content: `กรุณาสรุปบันทึกนี้:\n\nชื่อ: ${note.title}\n\nเนื้อหา:\n${note.content}`
        }
      ]);

      const summary = response.choices[0].message.content;
      const executionTime = Date.now() - startTime;

      await this.log('summarize_note', {
        parameters: { noteId, noteTitle: note.title },
        context: { userId, aiProviderId },
        result: { summary, originalLength: note.content.length },
        success: true,
        executionTime,
        userId
      });

      return {
        success: true,
        summary,
        originalNote: note,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await this.log('summarize_note', {
        parameters: { noteId },
        context: { userId, aiProviderId, error: error.message },
        result: null,
        success: false,
        executionTime,
        userId
      });

      throw error;
    }
  }
}

// Knowledge Graph Builder Agent
export class KnowledgeGraphAgent extends AIAgent {
  constructor() {
    super(
      'KnowledgeGraph',
      'สร้างและจัดการ knowledge graph จากบันทึกและข้อมูล',
      ['graph-analysis', 'relationship-extraction', 'knowledge-mapping']
    );
  }

  async execute(task, context) {
    const startTime = Date.now();
    const { userId, aiProviderId } = context;

    try {
      // Get all user notes
      const notes = await notesAPI.getNotes(userId);
      
      // Use AI to extract relationships and concepts
      const aiManager = new AIProviderManager(userId);
      const response = await aiManager.chat(aiProviderId, [
        {
          role: 'system',
          content: `คุณเป็นผู้เชี่ยวชาญในการวิเคราะห์ความสัมพันธ์ของข้อมูล กรุณาวิเคราะห์บันทึกต่อไปนี้และสร้าง knowledge graph โดยระบุ:
1. แนวคิดหลัก (concepts)
2. ความสัมพันธ์ระหว่างแนวคิด (relationships)
3. หมวดหมู่ (categories)

ตอบกลับในรูปแบบ JSON`
        },
        {
          role: 'user',
          content: `บันทึกทั้งหมด:\n${notes.map(note => `${note.title}: ${note.content.substring(0, 200)}...`).join('\n\n')}`
        }
      ]);

      let knowledgeGraph;
      try {
        knowledgeGraph = JSON.parse(response.choices[0].message.content);
      } catch {
        // Fallback if AI doesn't return valid JSON
        knowledgeGraph = {
          concepts: notes.map(note => ({
            id: note.id,
            title: note.title,
            type: 'note',
            tags: note.tags
          })),
          relationships: [],
          categories: [...new Set(notes.flatMap(note => note.tags))]
        };
      }

      const executionTime = Date.now() - startTime;

      await this.log('build_knowledge_graph', {
        parameters: { notesCount: notes.length },
        context: { userId, aiProviderId },
        result: { 
          conceptsCount: knowledgeGraph.concepts?.length || 0,
          relationshipsCount: knowledgeGraph.relationships?.length || 0 
        },
        success: true,
        executionTime,
        userId
      });

      return {
        success: true,
        knowledgeGraph,
        notesAnalyzed: notes.length,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await this.log('build_knowledge_graph', {
        parameters: {},
        context: { userId, aiProviderId, error: error.message },
        result: null,
        success: false,
        executionTime,
        userId
      });

      throw error;
    }
  }
}

// Smart Todo Assistant Agent
export class TodoAssistantAgent extends AIAgent {
  constructor() {
    super(
      'TodoAssistant',
      'ช่วยจัดการและแนะนำ todo items อย่างชาญฉลาด',
      ['task-management', 'priority-analysis', 'scheduling']
    );
  }

  async execute(task, context) {
    const startTime = Date.now();
    const { userId, aiProviderId, action } = context;

    try {
      let result;

      switch (action) {
        case 'prioritize_todos':
          result = await this.prioritizeTodos(userId, aiProviderId);
          break;
        case 'suggest_todos':
          result = await this.suggestTodos(userId, aiProviderId);
          break;
        case 'analyze_productivity':
          result = await this.analyzeProductivity(userId, aiProviderId);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      const executionTime = Date.now() - startTime;

      await this.log(action, {
        parameters: { action },
        context: { userId, aiProviderId },
        result,
        success: true,
        executionTime,
        userId
      });

      return {
        success: true,
        ...result,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await this.log(context.action || 'unknown_action', {
        parameters: { action: context.action },
        context: { userId, aiProviderId, error: error.message },
        result: null,
        success: false,
        executionTime,
        userId
      });

      throw error;
    }
  }

  async prioritizeTodos(userId, aiProviderId) {
    // Mock implementation - would integrate with actual todo API
    return {
      prioritizedTodos: [],
      recommendations: [
        'เริ่มต้นด้วยงานที่มี deadline ใกล้ที่สุด',
        'จัดกลุ่มงานที่คล้ายกันเพื่อทำพร้อมกัน',
        'แบ่งงานใหญ่เป็นงานย่อยที่จัดการได้ง่าย'
      ]
    };
  }

  async suggestTodos(userId, aiProviderId) {
    const notes = await notesAPI.getNotes(userId);
    
    // Use AI to suggest todos based on notes
    const aiManager = new AIProviderManager(userId);
    const response = await aiManager.chat(aiProviderId, [
      {
        role: 'system',
        content: 'วิเคราะห์บันทึกและแนะนำ todo items ที่เป็นประโยชน์'
      },
      {
        role: 'user',
        content: `จากบันทึกเหล่านี้ กรุณาแนะนำ todo items:\n${notes.map(note => note.title).join('\n')}`
      }
    ]);

    return {
      suggestedTodos: response.choices[0].message.content,
      basedOnNotes: notes.length
    };
  }

  async analyzeProductivity(userId, aiProviderId) {
    // Mock productivity analysis
    return {
      productivityScore: 75,
      insights: [
        'คุณมีแนวโน้มทำงานได้ดีในช่วงเช้า',
        'งานที่เกี่ยวกับ AI มักใช้เวลานานกว่าที่คาดไว้',
        'การแบ่งงานเป็นช่วงเวลาสั้นๆ ช่วยเพิ่มประสิทธิภาพ'
      ],
      recommendations: [
        'ตั้งเป้าหมายรายวันที่ชัดเจน',
        'ใช้เทคนิค Pomodoro สำหรับงานที่ต้องสมาธิ',
        'ทบทวนความคืบหน้าทุกสัปดาห์'
      ]
    };
  }
}

// Content Enhancement Agent
export class ContentEnhancementAgent extends AIAgent {
  constructor() {
    super(
      'ContentEnhancer',
      'ปรับปรุงและเสริมเนื้อหาบันทึกให้ดีขึ้น',
      ['content-improvement', 'grammar-check', 'style-enhancement']
    );
  }

  async execute(task, context) {
    const startTime = Date.now();
    const { noteId, userId, aiProviderId, enhancementType } = context;

    try {
      const notes = await notesAPI.getNotes(userId);
      const note = notes.find(n => n.id === noteId);
      
      if (!note) {
        throw new Error('Note not found');
      }

      const aiManager = new AIProviderManager(userId);
      let prompt;

      switch (enhancementType) {
        case 'grammar':
          prompt = 'ตรวจสอบและแก้ไขไวยากรณ์ของข้อความต่อไปนี้';
          break;
        case 'structure':
          prompt = 'ปรับปรุงโครงสร้างและการจัดระเบียบของเนื้อหาต่อไปนี้';
          break;
        case 'expand':
          prompt = 'ขยายและเพิ่มรายละเอียดให้กับเนื้อหาต่อไปนี้';
          break;
        default:
          prompt = 'ปรับปรุงเนื้อหาต่อไปนี้ให้ดีขึ้น';
      }

      const response = await aiManager.chat(aiProviderId, [
        {
          role: 'system',
          content: prompt
        },
        {
          role: 'user',
          content: note.content
        }
      ]);

      const enhancedContent = response.choices[0].message.content;
      const executionTime = Date.now() - startTime;

      await this.log('enhance_content', {
        parameters: { noteId, enhancementType },
        context: { userId, aiProviderId },
        result: { 
          originalLength: note.content.length,
          enhancedLength: enhancedContent.length 
        },
        success: true,
        executionTime,
        userId
      });

      return {
        success: true,
        originalContent: note.content,
        enhancedContent,
        enhancementType,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await this.log('enhance_content', {
        parameters: { noteId, enhancementType },
        context: { userId, aiProviderId, error: error.message },
        result: null,
        success: false,
        executionTime,
        userId
      });

      throw error;
    }
  }
}

// Agent Manager
export class AgentManager {
  constructor() {
    this.agents = new Map();
    this.registerDefaultAgents();
  }

  registerDefaultAgents() {
    this.registerAgent(new NoteSummarizerAgent());
    this.registerAgent(new KnowledgeGraphAgent());
    this.registerAgent(new TodoAssistantAgent());
    this.registerAgent(new ContentEnhancementAgent());
  }

  registerAgent(agent) {
    this.agents.set(agent.name, agent);
  }

  getAgent(name) {
    return this.agents.get(name);
  }

  getAllAgents() {
    return Array.from(this.agents.values());
  }

  async executeAgent(agentName, task, context) {
    const agent = this.getAgent(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }

    if (!agent.isActive) {
      throw new Error(`Agent ${agentName} is not active`);
    }

    return await agent.execute(task, context);
  }
}

// Create singleton instance
export const agentManager = new AgentManager();
