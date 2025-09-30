import { Injectable } from '@nestjs/common'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
//import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { SupabaseService } from '../../database/supabaseClient'
//./ragController
import { BalanceSheetService } from '../balancesheet/balanceSheetService'
import { combineDocs } from './ragUtil'
import { Inject, forwardRef } from '@nestjs/common'
@Injectable()
export class RAGService {
  private pdfChunks: string[]=[]
  constructor(
    private readonly supabaseService: SupabaseService
  ) {}

  async processForRAG(file: Express.Multer.File, userId: string, companyId: string, year: number) {
    try {
      // Extract text from PDF directly (returns string)
      const extractedText = await this.extractTextFromPDF(file.buffer)

      // Create text chunks from extracted text
      const chunks = await this.createTextChunks(extractedText)

      // Generate embeddings
      const embeddings = await this.generateEmbeddings(chunks)

      // Generate a simple ID for this processing session
      const balanceSheetId = `rag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Store embeddings in vector database
      await this.storeEmbeddings(embeddings, {
        userId,
        balanceSheetId,
        filename: file.originalname
      })

      return {
        success: true,
        chunks: chunks.length,
        balanceSheetId,
        extractedText
      }
    } catch (error) {
      console.error('Error processing for RAG:', error)
      throw error
    }
  }

  async queryRAG(question: string, userId?: string, k = 3) {
    console.log('🔍 Direct RAG query for:', question)
    
    if (this.pdfChunks.length === 0) {
      console.log('⚠️ No PDF content available')
      return 'No PDF content available for questions.'
    }

    // Simple keyword-based relevance scoring
    const questionWords = question.toLowerCase().split(' ')
    const scoredChunks = this.pdfChunks.map(chunk => {
      const chunkLower = chunk.toLowerCase()
      let score = 0
      
      questionWords.forEach(word => {
        if (chunkLower.includes(word) && word.length > 3) {
          score += 1
        }
      })
      
      return { chunk, score }
    })
    
    scoredChunks.sort((a, b) => b.score - a.score)
    const relevantChunks = scoredChunks.slice(0, k).map(item => item.chunk)
    
    console.log(`✅ Found ${relevantChunks.length} relevant chunks`)
    return relevantChunks.join('\n\n')
  }

  // Direct method for chat service - combines query and context retrieval
  async getContextForQuestion(question: string): Promise<string> {
    try {
      return await this.queryRAG(question, undefined, 3)
    } catch (error) {
      console.error('Context retrieval failed:', error)
      return 'Unable to retrieve relevant context.'
    }
  }

  // Direct PDF processing method
  async processPDFDirect(file: Express.Multer.File): Promise<{chunks: number, text: string}> {
    console.log('📄 Starting PDF processing:', file.originalname)

    const extractedText = await this.extractTextFromPDF(file.buffer)
    console.log('📝 Text extracted, length:', extractedText.length)

    const chunks = await this.createTextChunks(extractedText)
    console.log('✂️ Created', chunks.length, 'text chunks')

    // Store in memory for immediate querying
    this.pdfChunks = chunks
    console.log('💾 Stored chunks in memory for RAG querying')

    return {
      chunks: chunks.length,
      text: extractedText
    }
  }
////////////////////////////////////////////// PUBLIC IMPORTANT ABOVE,PRIVATE HELPERS BELOW ////////////////////////////////////////////
   async createTextChunks(text: string): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })
    
    const chunks = await splitter.createDocuments([text])
    console.log('✂️ Created', chunks.length, 'text chunks')
    return chunks.map(chunk => chunk.pageContent)
  }

   async generateEmbeddings(chunks: string[]): Promise<Array<{chunk: string, embedding: number[]}>> {
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
  //Alr used in balanceSheetService which has its own implementation
  public async extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
    const pdfParse = require('pdf-parse')
    try {
      const data = await pdfParse(fileBuffer)
      console.log('📝 Text extracted, length:', data.text.length)
      return data.text
    } catch (error) {
      console.error('PDF extraction error:', error)
      throw new Error('Failed to extract text from PDF')
    }
  }
    

  public async storeEmbeddings(
    embeddings: Array<{chunk: string, embedding: number[]}>,
    metadata: { userId: string, balanceSheetId: string, filename: string }
  ): Promise<void> {
    const supabase = this.supabaseService.getClient()

    // Store each embedding chunk in the Vector_embeddings table
    const embeddingsData = embeddings.map(({ chunk, embedding }) => ({
      balance_sheet_data_id: metadata.balanceSheetId,
      user_id: metadata.userId,
      content: chunk,
      embedding: JSON.stringify(embedding), // Store as JSON string for Supabase
      filename: metadata.filename,
      created_at: new Date().toISOString()
    }))

    const { error } = await supabase
      .from('Vector_embeddings')
      .insert(embeddingsData)

    if (error) {
      console.error('Error storing embeddings:', error)
      throw new Error(`Failed to store embeddings: ${error.message}`)
    }

    console.log(`✅ Stored ${embeddings.length} embeddings for ${metadata.filename}`)
  }
}