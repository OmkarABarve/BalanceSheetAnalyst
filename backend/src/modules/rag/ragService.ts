import { Injectable } from '@nestjs/common'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { SupabaseService } from '../../database/supabaseClient'
//./ragController
import { BalanceSheetService } from '../balancesheet/balanceSheetService'
import { combineDocs } from './ragUtil'
    
@Injectable()
export class RAGService {
  constructor(
    private readonly balanceSheetService: BalanceSheetService,
    private readonly supabaseService: SupabaseService
  ) {}

  async processForRAG(file: Express.Multer.File, userId: string) {
    try {
      // Use BalanceSheetService to handle upload and text extraction
      const processedData = await this.balanceSheetService.uploadBalanceSheet(file, '', 0, userId)
      
      // Create text chunks from extracted text
      const chunks = await this.createTextChunks(processedData.extracted_text)
      
      // Generate embeddings
      const embeddings = await this.generateEmbeddings(chunks)
      
      // Store embeddings in vector database
      await this.storeEmbeddings(embeddings, {
        userId,
        balanceSheetId: processedData.id,
        filename: file.originalname
      })
      
      return { success: true, chunks: chunks.length }
    } catch (error) {
      console.error('Error processing for RAG:', error)
      throw error
    }
  }

  async queryRAG(question: string, userId: string, k = 3) {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY!, // ✅ Fixed: No VITE_ prefix
      model: "models/embedding-001",
    })

    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: this.supabaseService.getClient(),
      tableName: "Vector_Embeddings",
      queryName: "match_documents",
    })

    const retriever = vectorStore.asRetriever(k)
    const docs = await retriever.getRelevantDocuments(question)

    return combineDocs(docs)
  }

  private async createTextChunks(text: string): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })
    
    const chunks = await splitter.createDocuments([text])
    return chunks.map(chunk => chunk.pageContent)
  }

  private async generateEmbeddings(chunks: string[]): Promise<Array<{chunk: string, embedding: number[]}>> {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY!, // ✅ Fixed: No VITE_ prefix
      model: "models/embedding-001",
    })
    
    const results = []
    for (const chunk of chunks) {
      const embedding = await embeddings.embedQuery(chunk)
      results.push({ chunk, embedding })
    }
    
    return results
  }

  private async storeEmbeddings(
    embeddings: Array<{chunk: string, embedding: number[]}>,
    metadata: { userId: string, balanceSheetId: string, filename: string }
  ): Promise<void> {
    // Store embeddings in vector database
    // Implementation depends on your vector storage solution
    console.log('Storing embeddings:', embeddings.length, 'chunks for user:', metadata.userId)
  }
}
