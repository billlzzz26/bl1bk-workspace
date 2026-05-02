import { AIProviderManager } from './providers.js';
import { prisma } from '../db/prisma.js';
import { opikTracker } from './opik.js';
import { notesAPI } from '../../api/notes.js';

export class RAGEngine {
  constructor(userId) {
    this.userId = userId;
    this.aiManager = new AIProviderManager(userId);
  }

  // Create embeddings for text content
  async createEmbedding(text, providerId) {
    try {
      const embedding = await this.aiManager.generateEmbedding(providerId, text);
      return embedding;
    } catch (error) {
      console.error('Error creating embedding:', error);
      throw error;
    }
  }

  // Index a document for RAG
  async indexDocument(document, providerId) {
    try {
      const { title, content, source, metadata = {} } = document;
      
      // Create embedding for the content
      const embedding = await this.createEmbedding(content, providerId);
      
      // Store in database
      const ragDocument = await prisma.rAGDocument.create({
        data: {
          title,
          content,
          source,
          embedding: JSON.stringify(embedding),
          metadata,
          userId: this.userId
        }
      });

      await opikTracker.trackRAGOperation({
        query: 'index_document',
        documentsRetrieved: 0,
        retrievalMethod: 'indexing',
        response: 'Document indexed successfully',
        relevanceScore: 1.0,
        documentsUsed: 1,
        userId: this.userId,
        vectorStore: 'prisma_sqlite',
        embeddingModel: 'text-embedding-ada-002'
      });

      return ragDocument;
    } catch (error) {
      console.error('Error indexing document:', error);
      throw error;
    }
  }

  // Index all user notes
  async indexAllNotes(providerId) {
    try {
      const notes = await notesAPI.getNotes(this.userId);
      const indexedDocuments = [];

      for (const note of notes) {
        try {
          const document = {
            title: note.title,
            content: note.content,
            source: 'user_note',
            metadata: {
              noteId: note.id,
              tags: note.tags,
              isPublic: note.isPublic,
              createdAt: note.createdAt,
              updatedAt: note.updatedAt
            }
          };

          const ragDoc = await this.indexDocument(document, providerId);
          indexedDocuments.push(ragDoc);
        } catch (error) {
          console.error(`Error indexing note ${note.id}:`, error);
        }
      }

      return indexedDocuments;
    } catch (error) {
      console.error('Error indexing all notes:', error);
      throw error;
    }
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  // Retrieve relevant documents for a query
  async retrieveDocuments(query, providerId, options = {}) {
    const { 
      limit = 5, 
      minSimilarity = 0.7,
      sources = [] 
    } = options;

    try {
      // Create embedding for the query
      const queryEmbedding = await this.createEmbedding(query, providerId);

      // Get all documents from database
      const whereClause = { userId: this.userId };
      if (sources.length > 0) {
        whereClause.source = { in: sources };
      }

      const documents = await prisma.rAGDocument.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });

      // Calculate similarities and rank documents
      const rankedDocuments = documents
        .map(doc => {
          try {
            const docEmbedding = JSON.parse(doc.embedding);
            const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
            
            return {
              ...doc,
              similarity,
              metadata: typeof doc.metadata === 'string' ? JSON.parse(doc.metadata) : doc.metadata
            };
          } catch (error) {
            console.error(`Error processing document ${doc.id}:`, error);
            return null;
          }
        })
        .filter(doc => doc && doc.similarity >= minSimilarity)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      await opikTracker.trackRAGOperation({
        query,
        documentsRetrieved: rankedDocuments.length,
        retrievalMethod: 'cosine_similarity',
        response: `Retrieved ${rankedDocuments.length} relevant documents`,
        relevanceScore: rankedDocuments[0]?.similarity || 0,
        documentsUsed: rankedDocuments.length,
        userId: this.userId,
        vectorStore: 'prisma_sqlite',
        embeddingModel: 'text-embedding-ada-002'
      });

      return rankedDocuments;
    } catch (error) {
      console.error('Error retrieving documents:', error);
      throw error;
    }
  }

  // Generate answer using RAG
  async generateAnswer(query, providerId, options = {}) {
    const startTime = Date.now();

    try {
      // Retrieve relevant documents
      const relevantDocs = await this.retrieveDocuments(query, providerId, options);

      if (relevantDocs.length === 0) {
        return {
          answer: 'ขออภัย ไม่พบข้อมูลที่เกี่ยวข้องกับคำถามของคุณในฐานความรู้',
          sources: [],
          relevantDocuments: []
        };
      }

      // Prepare context from relevant documents
      const context = relevantDocs
        .map(doc => `${doc.title}\n${doc.content}`)
        .join('\n\n---\n\n');

      // Generate answer using AI
      const response = await this.aiManager.chat(providerId, [
        {
          role: 'system',
          content: `คุณเป็นผู้ช่วยที่ตอบคำถามโดยอิงจากข้อมูลที่ให้มา กรุณาตอบคำถามโดยใช้ข้อมูลจากบริบทที่ให้มาเท่านั้น หากไม่มีข้อมูลที่เกี่ยวข้อง ให้บอกว่าไม่พบข้อมูล

บริบท:
${context}`
        },
        {
          role: 'user',
          content: query
        }
      ]);

      const answer = response.choices[0].message.content;
      const responseTime = Date.now() - startTime;

      await opikTracker.trackRAGOperation({
        query,
        documentsRetrieved: relevantDocs.length,
        retrievalMethod: 'rag_generation',
        response: answer,
        relevanceScore: relevantDocs[0]?.similarity || 0,
        documentsUsed: relevantDocs.length,
        userId: this.userId,
        vectorStore: 'prisma_sqlite',
        embeddingModel: 'text-embedding-ada-002'
      });

      return {
        answer,
        sources: relevantDocs.map(doc => ({
          id: doc.id,
          title: doc.title,
          source: doc.source,
          similarity: doc.similarity,
          metadata: doc.metadata
        })),
        relevantDocuments: relevantDocs,
        responseTime
      };

    } catch (error) {
      console.error('Error generating RAG answer:', error);
      throw error;
    }
  }

  // Search documents by text
  async searchDocuments(searchTerm, options = {}) {
    const { limit = 10, sources = [] } = options;

    try {
      const whereClause = {
        userId: this.userId,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { content: { contains: searchTerm, mode: 'insensitive' } }
        ]
      };

      if (sources.length > 0) {
        whereClause.source = { in: sources };
      }

      const documents = await prisma.rAGDocument.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return documents.map(doc => ({
        ...doc,
        metadata: typeof doc.metadata === 'string' ? JSON.parse(doc.metadata) : doc.metadata
      }));
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  // Delete document from RAG index
  async deleteDocument(documentId) {
    try {
      await prisma.rAGDocument.delete({
        where: {
          id: documentId,
          userId: this.userId
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Get RAG statistics
  async getStatistics() {
    try {
      const totalDocuments = await prisma.rAGDocument.count({
        where: { userId: this.userId }
      });

      const documentsBySource = await prisma.rAGDocument.groupBy({
        by: ['source'],
        where: { userId: this.userId },
        _count: { id: true }
      });

      const recentDocuments = await prisma.rAGDocument.findMany({
        where: { userId: this.userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          source: true,
          createdAt: true
        }
      });

      return {
        totalDocuments,
        documentsBySource: documentsBySource.reduce((acc, item) => {
          acc[item.source] = item._count.id;
          return acc;
        }, {}),
        recentDocuments
      };
    } catch (error) {
      console.error('Error getting RAG statistics:', error);
      throw error;
    }
  }
}

// Helper functions
export const createRAGEngine = (userId) => {
  return new RAGEngine(userId);
};

export const indexUserNotes = async (userId, providerId) => {
  const ragEngine = new RAGEngine(userId);
  return await ragEngine.indexAllNotes(providerId);
};

export const askRAG = async (userId, query, providerId, options = {}) => {
  const ragEngine = new RAGEngine(userId);
  return await ragEngine.generateAnswer(query, providerId, options);
};
