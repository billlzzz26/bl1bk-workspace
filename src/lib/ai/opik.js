import { Opik } from 'opik';

// Initialize Opik client
let opikClient = null;

export function initializeOpik() {
  if (!opikClient && process.env.OPIK_API_KEY) {
    try {
      opikClient = new Opik({
        apiKey: process.env.OPIK_API_KEY,
        projectName: process.env.OPIK_PROJECT_NAME || 'unified-ai-workspace'
      });
      console.log('Opik initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Opik:', error);
    }
  }
  return opikClient;
}

export class OpikTracker {
  constructor() {
    this.client = initializeOpik();
  }

  // Track AI chat interactions
  async trackChatInteraction(data) {
    if (!this.client) return null;

    try {
      const trace = await this.client.trace({
        name: 'ai_chat_interaction',
        input: {
          message: data.userMessage,
          provider: data.aiProvider,
          model: data.model,
          sessionId: data.sessionId
        },
        output: {
          response: data.aiResponse,
          tokensUsed: data.tokensUsed,
          responseTime: data.responseTime
        },
        metadata: {
          userId: data.userId,
          timestamp: new Date().toISOString(),
          provider: data.aiProvider,
          model: data.model
        },
        tags: ['chat', 'ai-interaction']
      });

      return trace;
    } catch (error) {
      console.error('Error tracking chat interaction:', error);
      return null;
    }
  }

  // Track RAG operations
  async trackRAGOperation(data) {
    if (!this.client) return null;

    try {
      const trace = await this.client.trace({
        name: 'rag_operation',
        input: {
          query: data.query,
          documentsRetrieved: data.documentsRetrieved,
          retrievalMethod: data.retrievalMethod
        },
        output: {
          response: data.response,
          relevanceScore: data.relevanceScore,
          documentsUsed: data.documentsUsed
        },
        metadata: {
          userId: data.userId,
          timestamp: new Date().toISOString(),
          vectorStore: data.vectorStore,
          embeddingModel: data.embeddingModel
        },
        tags: ['rag', 'retrieval', 'knowledge-base']
      });

      return trace;
    } catch (error) {
      console.error('Error tracking RAG operation:', error);
      return null;
    }
  }

  // Track note creation and updates
  async trackNoteOperation(data) {
    if (!this.client) return null;

    try {
      const trace = await this.client.trace({
        name: 'note_operation',
        input: {
          operation: data.operation, // 'create', 'update', 'delete'
          noteId: data.noteId,
          title: data.title,
          tags: data.tags
        },
        output: {
          success: data.success,
          noteLength: data.content?.length || 0
        },
        metadata: {
          userId: data.userId,
          timestamp: new Date().toISOString(),
          operation: data.operation
        },
        tags: ['note-management', 'user-action']
      });

      return trace;
    } catch (error) {
      console.error('Error tracking note operation:', error);
      return null;
    }
  }

  // Track AI agent actions
  async trackAgentAction(data) {
    if (!this.client) return null;

    try {
      const trace = await this.client.trace({
        name: 'ai_agent_action',
        input: {
          agentType: data.agentType,
          action: data.action,
          parameters: data.parameters,
          context: data.context
        },
        output: {
          result: data.result,
          success: data.success,
          executionTime: data.executionTime
        },
        metadata: {
          userId: data.userId,
          timestamp: new Date().toISOString(),
          agentType: data.agentType,
          action: data.action
        },
        tags: ['ai-agent', 'automation']
      });

      return trace;
    } catch (error) {
      console.error('Error tracking agent action:', error);
      return null;
    }
  }

  // Track user behavior and app usage
  async trackUserBehavior(data) {
    if (!this.client) return null;

    try {
      const trace = await this.client.trace({
        name: 'user_behavior',
        input: {
          action: data.action,
          page: data.page,
          feature: data.feature,
          duration: data.duration
        },
        output: {
          success: data.success,
          result: data.result
        },
        metadata: {
          userId: data.userId,
          timestamp: new Date().toISOString(),
          userAgent: data.userAgent,
          sessionId: data.sessionId
        },
        tags: ['user-behavior', 'analytics']
      });

      return trace;
    } catch (error) {
      console.error('Error tracking user behavior:', error);
      return null;
    }
  }

  // Track API performance
  async trackAPIPerformance(data) {
    if (!this.client) return null;

    try {
      const trace = await this.client.trace({
        name: 'api_performance',
        input: {
          endpoint: data.endpoint,
          method: data.method,
          parameters: data.parameters
        },
        output: {
          statusCode: data.statusCode,
          responseTime: data.responseTime,
          dataSize: data.dataSize
        },
        metadata: {
          userId: data.userId,
          timestamp: new Date().toISOString(),
          endpoint: data.endpoint,
          method: data.method
        },
        tags: ['api', 'performance']
      });

      return trace;
    } catch (error) {
      console.error('Error tracking API performance:', error);
      return null;
    }
  }

  // Get analytics and insights
  async getAnalytics(timeRange = '7d') {
    if (!this.client) return null;

    try {
      // This would use Opik's analytics API
      // For now, return mock data structure
      return {
        chatInteractions: {
          total: 0,
          byProvider: {},
          averageResponseTime: 0
        },
        ragOperations: {
          total: 0,
          averageRelevanceScore: 0,
          documentsRetrieved: 0
        },
        userBehavior: {
          activeUsers: 0,
          mostUsedFeatures: [],
          averageSessionDuration: 0
        },
        performance: {
          averageApiResponseTime: 0,
          errorRate: 0,
          throughput: 0
        }
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  }
}

// Create singleton instance
export const opikTracker = new OpikTracker();

// Helper functions for common tracking scenarios
export const trackChatMessage = async (userMessage, aiResponse, metadata) => {
  return await opikTracker.trackChatInteraction({
    userMessage,
    aiResponse,
    ...metadata
  });
};

export const trackNoteCreated = async (noteData, userId) => {
  return await opikTracker.trackNoteOperation({
    operation: 'create',
    noteId: noteData.id,
    title: noteData.title,
    content: noteData.content,
    tags: noteData.tags,
    success: true,
    userId
  });
};

export const trackRAGQuery = async (query, response, metadata) => {
  return await opikTracker.trackRAGOperation({
    query,
    response,
    ...metadata
  });
};

export const trackUserAction = async (action, page, userId, metadata = {}) => {
  return await opikTracker.trackUserBehavior({
    action,
    page,
    userId,
    success: true,
    ...metadata
  });
};
