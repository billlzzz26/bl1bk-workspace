import { prisma } from '../lib/db/prisma.js';
import { FileText, CheckSquare, MessageSquare, Brain } from 'lucide-react';

// Mock user ID for development
const MOCK_USER_ID = 'dev-user-1';

export const dashboardAPI = {
  // Get dashboard summary stats
  async getStats(userId = MOCK_USER_ID) {
    try {
      const [
        totalNotes,
        totalTodos,
        completedTodos,
        chatSessions,
        knowledgeNodes,
        aiInteractions
      ] = await Promise.all([
        prisma.note.count({ where: { userId } }),
        prisma.todoItem.count({ where: { userId } }),
        prisma.todoItem.count({ where: { userId, completed: true } }),
        prisma.chatSession.count({ where: { userId } }),
        prisma.knowledgeNode.count({ where: { userId } }),
        prisma.chatMessage.count({ where: { userId, role: 'assistant' } })
      ]);

      return {
        totalNotes,
        totalTodos,
        completedTodos,
        chatSessions,
        knowledgeNodes,
        aiInteractions
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch stats');
    }
  },

  // Get recent activity across all features
  async getRecentActivity(userId = MOCK_USER_ID, limit = 5) {
    try {
      // Fetch recent items from different models
      const [recentNotes, recentTodos, recentChats] = await Promise.all([
        prisma.note.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          take: limit,
          select: { id: true, title: true, updatedAt: true }
        }),
        prisma.todoItem.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          take: limit,
          select: { id: true, title: true, updatedAt: true }
        }),
        prisma.chatSession.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          take: limit,
          select: { id: true, title: true, updatedAt: true }
        })
      ]);

      // Combine and format activities
      const activities = [
        ...recentNotes.map(n => ({
          id: `note-${n.id}`,
          type: 'note',
          title: n.title,
          timestamp: n.updatedAt,
          icon: 'FileText'
        })),
        ...recentTodos.map(t => ({
          id: `todo-${t.id}`,
          type: 'todo',
          title: t.title,
          timestamp: t.updatedAt,
          icon: 'CheckSquare'
        })),
        ...recentChats.map(c => ({
          id: `chat-${c.id}`,
          type: 'chat',
          title: c.title || 'การสนทนาใหม่',
          timestamp: c.updatedAt,
          icon: 'MessageSquare'
        }))
      ];

      // Sort by timestamp and take the top N
      return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw new Error('Failed to fetch activity');
    }
  }
};
