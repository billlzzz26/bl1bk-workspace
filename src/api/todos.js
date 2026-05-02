import { prisma } from '../lib/db/prisma.js';

// Mock user ID for development
const MOCK_USER_ID = 'dev-user-1';

export const todosAPI = {
  // Get all todos for user
  async getTodos(userId = MOCK_USER_ID) {
    try {
      const todos = await prisma.todoItem.findMany({
        where: { userId },
        orderBy: [
          { completed: 'asc' },
          { priority: 'desc' },
          { dueDate: 'asc' }
        ]
      });
      return todos;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw new Error('Failed to fetch todos');
    }
  },

  // Create new todo
  async createTodo(todoData, userId = MOCK_USER_ID) {
    try {
      const { title, description, priority = 'medium', dueDate } = todoData;
      
      const todo = await prisma.todoItem.create({
        data: {
          title,
          description,
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
          userId
        }
      });

      return todo;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw new Error('Failed to create todo');
    }
  },

  // Update todo
  async updateTodo(todoId, todoData, userId = MOCK_USER_ID) {
    try {
      const { title, description, priority, dueDate, completed } = todoData;
      
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (priority !== undefined) updateData.priority = priority;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (completed !== undefined) updateData.completed = completed;

      const todo = await prisma.todoItem.update({
        where: { 
          id: todoId,
          userId 
        },
        data: updateData
      });

      return todo;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw new Error('Failed to update todo');
    }
  },

  // Delete todo
  async deleteTodo(todoId, userId = MOCK_USER_ID) {
    try {
      await prisma.todoItem.delete({
        where: { 
          id: todoId,
          userId 
        }
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw new Error('Failed to delete todo');
    }
  },

  // Toggle todo completion
  async toggleTodo(todoId, userId = MOCK_USER_ID) {
    try {
      const todo = await prisma.todoItem.findUnique({
        where: { id: todoId, userId }
      });

      if (!todo) throw new Error('Todo not found');

      const updatedTodo = await prisma.todoItem.update({
        where: { id: todoId },
        data: { completed: !todo.completed }
      });

      return updatedTodo;
    } catch (error) {
      console.error('Error toggling todo:', error);
      throw new Error('Failed to toggle todo');
    }
  }
};
