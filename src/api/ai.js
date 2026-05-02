import { prisma } from '../lib/db/prisma.js';

// Mock user ID for development
const MOCK_USER_ID = 'dev-user-1';

export const aiAPI = {
  // Get all chat sessions for user
  async getSessions(userId = MOCK_USER_ID) {
    try {
      const sessions = await prisma.chatSession.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: {
          aiProvider: true
        }
      });
      return sessions;
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      throw new Error('Failed to fetch chat sessions');
    }
  },

  // Create new chat session
  async createSession(sessionData, userId = MOCK_USER_ID) {
    try {
      const { title, providerId } = sessionData;
      
      // If no providerId is given, use the first active one or create a dummy
      let actualProviderId = providerId;
      if (!actualProviderId) {
        const provider = await prisma.aIProvider.findFirst({
          where: { userId, isActive: true }
        });
        
        if (provider) {
          actualProviderId = provider.id;
        } else {
          // Create a dummy provider if none exists for development
          const newProvider = await prisma.aIProvider.create({
            data: {
              name: 'Default Provider',
              type: 'openai',
              apiKey: 'encrypted-key',
              userId
            }
          });
          actualProviderId = newProvider.id;
        }
      }

      const session = await prisma.chatSession.create({
        data: {
          title,
          userId,
          aiProviderId: actualProviderId
        },
        include: {
          aiProvider: true,
          messages: true
        }
      });

      return session;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw new Error('Failed to create chat session');
    }
  },

  // Get session with messages
  async getSessionWithMessages(sessionId) {
    try {
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          },
          aiProvider: true
        }
      });
      return session;
    } catch (error) {
      console.error('Error fetching session messages:', error);
      throw new Error('Failed to fetch session messages');
    }
  },

  // Add message to session
  async addMessage(sessionId, messageData, userId = MOCK_USER_ID) {
    try {
      const { content, role, metadata } = messageData;
      
      const message = await prisma.chatMessage.create({
        data: {
          content,
          role,
          sessionId,
          userId,
          metadata: metadata || {}
        }
      });

      // Update session timestamp
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() }
      });

      return message;
    } catch (error) {
      console.error('Error adding message:', error);
      throw new Error('Failed to add message');
    }
  },

  // Delete session
  async deleteSession(sessionId) {
    try {
      await prisma.chatSession.delete({
        where: { id: sessionId }
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error('Failed to delete session');
    }
  },

  // Get active AI providers
  async getProviders(userId = MOCK_USER_ID) {
    try {
      return await prisma.aIProvider.findMany({
        where: { userId, isActive: true }
      });
    } catch (error) {
      console.error('Error fetching AI providers:', error);
      throw new Error('Failed to fetch providers');
    }
  }
};
