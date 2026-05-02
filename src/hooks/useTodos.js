import { useState, useEffect, useCallback } from 'react';
import { todosAPI } from '../api/todos.js';

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedTodos = await todosAPI.getTodos();
      setTodos(fetchedTodos);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTodo = async (todoData) => {
    try {
      const newTodo = await todosAPI.createTodo(todoData);
      setTodos(prev => [newTodo, ...prev]);
      return newTodo;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTodo = async (todoId, todoData) => {
    try {
      const updatedTodo = await todosAPI.updateTodo(todoId, todoData);
      setTodos(prev => prev.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      ));
      return updatedTodo;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTodo = async (todoId) => {
    try {
      await todosAPI.deleteTodo(todoId);
      setTodos(prev => prev.filter(todo => todo.id !== todoId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const toggleTodo = async (todoId) => {
    try {
      const updatedTodo = await todosAPI.toggleTodo(todoId);
      setTodos(prev => prev.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      ));
      return updatedTodo;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    refetch: fetchTodos
  };
}
