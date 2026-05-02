// Core Types for Unified AI Workspace

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} name - User name
 * @property {string} image - User profile image URL
 * @property {Date} createdAt - Account creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} AIProvider
 * @property {string} id - Provider ID
 * @property {string} name - Provider name (e.g., "OpenAI", "Google AI")
 * @property {string} type - Provider type (e.g., "openai", "google", "anthropic")
 * @property {string} apiKey - Encrypted API key
 * @property {boolean} isActive - Whether the provider is active
 * @property {Object} config - Provider-specific configuration
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} Note
 * @property {string} id - Note ID
 * @property {string} title - Note title
 * @property {string} content - Note content (Markdown)
 * @property {string[]} tags - Note tags
 * @property {string} userId - Owner user ID
 * @property {boolean} isPublic - Whether the note is public
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} TodoItem
 * @property {string} id - Todo ID
 * @property {string} title - Todo title
 * @property {string} description - Todo description
 * @property {boolean} completed - Whether the todo is completed
 * @property {string} priority - Priority level ("low", "medium", "high")
 * @property {Date} dueDate - Due date
 * @property {string} userId - Owner user ID
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id - Message ID
 * @property {string} content - Message content
 * @property {string} role - Message role ("user", "assistant", "system")
 * @property {string} sessionId - Chat session ID
 * @property {string} userId - User ID
 * @property {Object} metadata - Additional metadata
 * @property {Date} createdAt - Creation date
 */

/**
 * @typedef {Object} ChatSession
 * @property {string} id - Session ID
 * @property {string} title - Session title
 * @property {string} userId - User ID
 * @property {string} aiProviderId - AI provider used
 * @property {ChatMessage[]} messages - Session messages
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} KnowledgeNode
 * @property {string} id - Node ID
 * @property {string} title - Node title
 * @property {string} type - Node type ("note", "todo", "concept")
 * @property {string} content - Node content
 * @property {Object} position - Node position in graph
 * @property {string[]} connections - Connected node IDs
 * @property {string} userId - Owner user ID
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} RAGDocument
 * @property {string} id - Document ID
 * @property {string} title - Document title
 * @property {string} content - Document content
 * @property {string} source - Document source
 * @property {number[]} embedding - Document embedding vector
 * @property {Object} metadata - Additional metadata
 * @property {string} userId - Owner user ID
 * @property {Date} createdAt - Creation date
 */

export const AI_PROVIDERS = {
  OPENAI: 'openai',
  GOOGLE: 'google',
  ANTHROPIC: 'anthropic',
  MISTRAL: 'mistral',
  OLLAMA: 'ollama',
  HUGGINGFACE: 'huggingface',
  XAI: 'xai',
  OPENROUTER: 'openrouter',
  COHERE: 'cohere',
  PERPLEXITY: 'perplexity'
};

export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system'
};

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const NODE_TYPES = {
  NOTE: 'note',
  TODO: 'todo',
  CONCEPT: 'concept',
  PROJECT: 'project'
};
