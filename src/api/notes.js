import { prisma } from '../lib/db/prisma.js';

// Mock user ID for development
const MOCK_USER_ID = 'dev-user-1';

export const notesAPI = {
  // Get all notes for user
  async getNotes(userId = MOCK_USER_ID) {
    try {
      const notes = await prisma.note.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      });

      // Parse tags from string to array
      return notes.map(note => ({
        ...note,
        tags: note.tags ? note.tags.split(',').filter(tag => tag.trim()) : []
      }));
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw new Error('Failed to fetch notes');
    }
  },

  // Create new note
  async createNote(noteData, userId = MOCK_USER_ID) {
    try {
      const { title, content, tags = [], isPublic = false } = noteData;
      
      const note = await prisma.note.create({
        data: {
          title,
          content,
          tags: Array.isArray(tags) ? tags.join(',') : tags,
          isPublic,
          userId
        }
      });

      return {
        ...note,
        tags: note.tags ? note.tags.split(',').filter(tag => tag.trim()) : []
      };
    } catch (error) {
      console.error('Error creating note:', error);
      throw new Error('Failed to create note');
    }
  },

  // Update note
  async updateNote(noteId, noteData, userId = MOCK_USER_ID) {
    try {
      const { title, content, tags, isPublic } = noteData;
      
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (tags !== undefined) {
        updateData.tags = Array.isArray(tags) ? tags.join(',') : tags;
      }
      if (isPublic !== undefined) updateData.isPublic = isPublic;

      const note = await prisma.note.update({
        where: { 
          id: noteId,
          userId // Ensure user can only update their own notes
        },
        data: updateData
      });

      return {
        ...note,
        tags: note.tags ? note.tags.split(',').filter(tag => tag.trim()) : []
      };
    } catch (error) {
      console.error('Error updating note:', error);
      throw new Error('Failed to update note');
    }
  },

  // Delete note
  async deleteNote(noteId, userId = MOCK_USER_ID) {
    try {
      await prisma.note.delete({
        where: { 
          id: noteId,
          userId // Ensure user can only delete their own notes
        }
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error('Failed to delete note');
    }
  },

  // Search notes
  async searchNotes(query, userId = MOCK_USER_ID) {
    try {
      const notes = await prisma.note.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { tags: { contains: query, mode: 'insensitive' } }
          ]
        },
        orderBy: { updatedAt: 'desc' }
      });

      return notes.map(note => ({
        ...note,
        tags: note.tags ? note.tags.split(',').filter(tag => tag.trim()) : []
      }));
    } catch (error) {
      console.error('Error searching notes:', error);
      throw new Error('Failed to search notes');
    }
  },

  // Get notes by tag
  async getNotesByTag(tag, userId = MOCK_USER_ID) {
    try {
      const notes = await prisma.note.findMany({
        where: {
          userId,
          tags: { contains: tag }
        },
        orderBy: { updatedAt: 'desc' }
      });

      return notes.map(note => ({
        ...note,
        tags: note.tags ? note.tags.split(',').filter(tag => tag.trim()) : []
      }));
    } catch (error) {
      console.error('Error fetching notes by tag:', error);
      throw new Error('Failed to fetch notes by tag');
    }
  },

  // Get all unique tags for user
  async getTags(userId = MOCK_USER_ID) {
    try {
      const notes = await prisma.note.findMany({
        where: { userId },
        select: { tags: true }
      });

      const allTags = new Set();
      notes.forEach(note => {
        if (note.tags) {
          note.tags.split(',').forEach(tag => {
            const trimmedTag = tag.trim();
            if (trimmedTag) allTags.add(trimmedTag);
          });
        }
      });

      return Array.from(allTags).sort();
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw new Error('Failed to fetch tags');
    }
  }
};
