import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../db/prisma.js';
import { decrypt, encrypt } from '../utils/encryption.js';

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

export class AIProviderManager {
  constructor(userId) {
    this.userId = userId;
  }

  async getProviders() {
    const providers = await prisma.aIProvider.findMany({
      where: { userId: this.userId },
      select: {
        id: true,
        name: true,
        type: true,
        isActive: true,
        config: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return providers;
  }

  async addProvider(type, name, apiKey, config = {}) {
    const encryptedApiKey = encrypt(apiKey);
    
    const provider = await prisma.aIProvider.create({
      data: {
        name,
        type,
        apiKey: encryptedApiKey,
        config,
        userId: this.userId
      }
    });

    return provider;
  }

  async updateProvider(providerId, updates) {
    if (updates.apiKey) {
      updates.apiKey = encrypt(updates.apiKey);
    }

    const provider = await prisma.aIProvider.update({
      where: { 
        id: providerId,
        userId: this.userId 
      },
      data: updates
    });

    return provider;
  }

  async deleteProvider(providerId) {
    await prisma.aIProvider.delete({
      where: { 
        id: providerId,
        userId: this.userId 
      }
    });
  }

  async getProviderClient(providerId) {
    const provider = await prisma.aIProvider.findFirst({
      where: { 
        id: providerId,
        userId: this.userId,
        isActive: true
      }
    });

    if (!provider) {
      throw new Error('Provider not found or inactive');
    }

    const apiKey = decrypt(provider.apiKey);
    
    switch (provider.type) {
      case AI_PROVIDERS.OPENAI:
        return new OpenAI({ apiKey });
      
      case AI_PROVIDERS.GOOGLE:
        return new GoogleGenerativeAI(apiKey);
      
      case AI_PROVIDERS.ANTHROPIC:
        // Would implement Anthropic client
        throw new Error('Anthropic provider not yet implemented');
      
      default:
        throw new Error(`Unsupported provider type: ${provider.type}`);
    }
  }

  async chat(providerId, messages, options = {}) {
    const client = await this.getProviderClient(providerId);
    const provider = await prisma.aIProvider.findFirst({
      where: { id: providerId, userId: this.userId }
    });

    switch (provider.type) {
      case AI_PROVIDERS.OPENAI:
        return await this.chatWithOpenAI(client, messages, options);
      
      case AI_PROVIDERS.GOOGLE:
        return await this.chatWithGoogle(client, messages, options);
      
      default:
        throw new Error(`Chat not implemented for provider: ${provider.type}`);
    }
  }

  async chatWithOpenAI(client, messages, options) {
    const response = await client.chat.completions.create({
      model: options.model || 'gpt-3.5-turbo',
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
      stream: options.stream || false
    });

    return response;
  }

  async chatWithGoogle(client, messages, options) {
    const model = client.getGenerativeModel({ 
      model: options.model || 'gemini-pro' 
    });

    // Convert messages to Google format
    const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: response.text()
        }
      }]
    };
  }

  async generateEmbedding(providerId, text) {
    const client = await this.getProviderClient(providerId);
    const provider = await prisma.aIProvider.findFirst({
      where: { id: providerId, userId: this.userId }
    });

    switch (provider.type) {
      case AI_PROVIDERS.OPENAI:
        const response = await client.embeddings.create({
          model: 'text-embedding-ada-002',
          input: text
        });
        return response.data[0].embedding;
      
      default:
        throw new Error(`Embedding not implemented for provider: ${provider.type}`);
    }
  }
}

export const getDefaultProviders = () => {
  return [
    {
      type: AI_PROVIDERS.OPENAI,
      name: 'OpenAI GPT',
      description: 'GPT-3.5 และ GPT-4 models จาก OpenAI',
      models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
      capabilities: ['chat', 'embedding', 'function-calling']
    },
    {
      type: AI_PROVIDERS.GOOGLE,
      name: 'Google Gemini',
      description: 'Gemini models จาก Google AI',
      models: ['gemini-pro', 'gemini-pro-vision'],
      capabilities: ['chat', 'vision']
    },
    {
      type: AI_PROVIDERS.ANTHROPIC,
      name: 'Anthropic Claude',
      description: 'Claude models จาก Anthropic',
      models: ['claude-3-sonnet', 'claude-3-opus'],
      capabilities: ['chat', 'function-calling']
    },
    {
      type: AI_PROVIDERS.OLLAMA,
      name: 'Ollama (Local)',
      description: 'Local AI models ผ่าน Ollama',
      models: ['llama2', 'mistral', 'codellama'],
      capabilities: ['chat']
    }
  ];
};
