import { useState, useEffect, useCallback } from 'react';
import { getSandboxAgent } from '@/lib/ai/agents/sandboxAgent';
import { getMCPClient } from '@/lib/ai/mcp/mcpClient';

export function useAgents() {
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sandboxStatus, setSandboxStatus] = useState({ available: false });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const sandboxAgent = getSandboxAgent();
  const mcpClient = getMCPClient();

  // Initialize sandbox and load data
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize sandbox
      const initialized = await sandboxAgent.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize sandbox');
      }

      // Check sandbox status
      const status = await sandboxAgent.checkSandboxStatus();
      setSandboxStatus(status);

      // Load existing agents and tasks
      await loadAgents();
      await loadTasks();

    } catch (err) {
      console.error('Failed to initialize agents:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load agents from sandbox
  const loadAgents = useCallback(async () => {
    try {
      const activeAgents = sandboxAgent.getActiveAgents();
      setAgents(activeAgents);
    } catch (err) {
      console.error('Failed to load agents:', err);
    }
  }, []);

  // Load tasks from local storage and update status
  const loadTasks = useCallback(async () => {
    try {
      const savedTasks = localStorage.getItem('agent-tasks');
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        
        // Update task status for running tasks
        const updatedTasks = await Promise.all(
          parsedTasks.map(async (task) => {
            if (task.status === 'running' || task.status === 'assigned') {
              try {
                const taskStatus = await sandboxAgent.getTaskStatus(task.id);
                return { ...task, ...taskStatus };
              } catch (err) {
                console.error(`Failed to get status for task ${task.id}:`, err);
                return task;
              }
            }
            return task;
          })
        );

        setTasks(updatedTasks);
        localStorage.setItem('agent-tasks', JSON.stringify(updatedTasks));
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  }, []);

  // Create a new agent
  const createAgent = useCallback(async (agentConfig) => {
    try {
      setError(null);
      
      let agent;
      if (agentConfig.type && ['note-analyzer', 'task-manager', 'research-assistant', 'code-helper'].includes(agentConfig.type)) {
        agent = await sandboxAgent.createSpecializedAgent(agentConfig.type, agentConfig);
      } else {
        agent = await sandboxAgent.createAgent(agentConfig);
      }

      setAgents(prev => [...prev, agent]);
      
      // Send context to MCP
      await mcpClient.sendContext({
        type: 'agent-created',
        agentId: agent.id,
        agentType: agent.type,
        timestamp: new Date().toISOString()
      });

      return agent;
    } catch (err) {
      console.error('Failed to create agent:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Stop an agent
  const stopAgent = useCallback(async (agentId) => {
    try {
      setError(null);
      
      const success = await sandboxAgent.stopAgent(agentId);
      if (success) {
        setAgents(prev => prev.filter(agent => agent.id !== agentId));
        
        // Send context to MCP
        await mcpClient.sendContext({
          type: 'agent-stopped',
          agentId,
          timestamp: new Date().toISOString()
        });
      }
      return success;
    } catch (err) {
      console.error('Failed to stop agent:', err);
      setError(err.message);
      return false;
    }
  }, []);

  // Assign task to agent
  const assignTask = useCallback(async (agentId, taskConfig) => {
    try {
      setError(null);
      
      const result = await sandboxAgent.assignTask(agentId, taskConfig);
      const agent = agents.find(a => a.id === agentId);
      
      const newTask = {
        id: result.taskId,
        agentId,
        agentName: agent?.name || 'Unknown Agent',
        instruction: taskConfig.instruction,
        type: taskConfig.type || 'general',
        priority: taskConfig.priority || 'normal',
        status: result.status,
        progress: 0,
        createdAt: new Date().toISOString(),
        estimatedCompletion: result.estimatedCompletion
      };

      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      localStorage.setItem('agent-tasks', JSON.stringify(updatedTasks));

      // Send context to MCP
      await mcpClient.sendContext({
        type: 'task-assigned',
        taskId: newTask.id,
        agentId,
        instruction: taskConfig.instruction,
        timestamp: new Date().toISOString()
      });

      return newTask;
    } catch (err) {
      console.error('Failed to assign task:', err);
      setError(err.message);
      throw err;
    }
  }, [agents, tasks]);

  // Cancel a task
  const cancelTask = useCallback(async (taskId) => {
    try {
      setError(null);
      
      const success = await sandboxAgent.cancelTask(taskId);
      if (success) {
        const updatedTasks = tasks.map(task => 
          task.id === taskId ? { ...task, status: 'cancelled' } : task
        );
        setTasks(updatedTasks);
        localStorage.setItem('agent-tasks', JSON.stringify(updatedTasks));
      }
      return success;
    } catch (err) {
      console.error('Failed to cancel task:', err);
      setError(err.message);
      return false;
    }
  }, [tasks]);

  // Get task result
  const getTaskResult = useCallback(async (taskId) => {
    try {
      const result = await sandboxAgent.waitForTaskCompletion(taskId);
      
      // Update task status
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed', result, completedAt: new Date().toISOString() }
          : task
      );
      setTasks(updatedTasks);
      localStorage.setItem('agent-tasks', JSON.stringify(updatedTasks));

      return result;
    } catch (err) {
      console.error('Failed to get task result:', err);
      
      // Update task status to failed
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'failed', error: err.message }
          : task
      );
      setTasks(updatedTasks);
      localStorage.setItem('agent-tasks', JSON.stringify(updatedTasks));

      throw err;
    }
  }, [tasks]);

  // Get agent metrics
  const getAgentMetrics = useCallback(async (agentId) => {
    try {
      return await sandboxAgent.getAgentMetrics(agentId);
    } catch (err) {
      console.error('Failed to get agent metrics:', err);
      return {};
    }
  }, []);

  // Update sandbox status
  const updateStatus = useCallback(async () => {
    try {
      const status = await sandboxAgent.checkSandboxStatus();
      setSandboxStatus(status);
      
      // Reload tasks to update their status
      await loadTasks();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  }, [loadTasks]);

  // Auto-update status every 10 seconds
  useEffect(() => {
    const interval = setInterval(updateStatus, 10000);
    return () => clearInterval(interval);
  }, [updateStatus]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup function will be called when component unmounts
      sandboxAgent.shutdown().catch(console.error);
    };
  }, []);

  return {
    // State
    agents,
    tasks,
    sandboxStatus,
    isLoading,
    error,

    // Actions
    createAgent,
    stopAgent,
    assignTask,
    cancelTask,
    getTaskResult,
    getAgentMetrics,
    updateStatus,
    loadAgents,
    loadTasks,

    // Utilities
    getActiveAgents: () => agents.filter(agent => agent.status === 'active'),
    getRunningTasks: () => tasks.filter(task => ['running', 'assigned'].includes(task.status)),
    getCompletedTasks: () => tasks.filter(task => task.status === 'completed'),
    getFailedTasks: () => tasks.filter(task => task.status === 'failed')
  };
}
