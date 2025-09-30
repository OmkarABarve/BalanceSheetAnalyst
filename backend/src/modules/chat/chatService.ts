import { Injectable } from '@nestjs/common'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { generateSystemPrompt } from './systemprompt'
import { RAGService } from '../rag/ragService'
@Injectable()
export class ChatService {
  private genAI: GoogleGenerativeAI
  private model: any
  private systemPrompt: string
  
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    })
    this.systemPrompt = generateSystemPrompt()
  }
/*
  async askChat(query: string, context?: string, ragService?: any): Promise<string> {
    let ragContext = ''

    // Use passed RAGService or get from global
    try {
      const serviceToUse = ragService || (global as any).ragServiceInstance
      if (serviceToUse) {
        ragContext = await serviceToUse.queryRAG(query, undefined, 3)
        console.log('📥 Retrieved RAG context, length:', ragContext.length)
      } else {
        ragContext = 'RAG service not available.'
      }
    } catch (error) {
      console.error('❌ Error retrieving RAG context:', error)
      ragContext = 'Error retrieving context from documents.'
    }
    
    const combinedContext = [ragContext, context].filter(Boolean).join('\n\n')
    
    const prompt = combinedContext
      ? `${this.systemPrompt}\n\nContext:\n${combinedContext}\n\nQuestion:\n${query}`
      : `${this.systemPrompt}\n\nQuestion:\n${query}`    

    const result = await this.model.generateContent(prompt)
    return result.response.text()
  }
*/


async askChat(query: string, context?: string, ragService?: any): Promise<string> {
  let ragContext = ''

  // Use simplified RAG method
  try {
  
    const serviceToUse = ragService || (global as any).ragServiceInstance
    if (serviceToUse) {
    ragContext = await serviceToUse.getContextForQuestion(query)
    console.log('📥 Retrieved context, length:', ragContext.length)
      } else {
        ragContext = 'RAG service not available.'
      }
  } catch (error) {
    console.error('❌ Context retrieval failed:', error)
    ragContext = 'Unable to retrieve document context.'
  }
  
  const combinedContext = [ragContext, context].filter(Boolean).join('\n\n')
  
  const prompt = combinedContext
    ? `${this.systemPrompt}\n\nContext:\n${combinedContext}\n\nQuestion:\n${query}`
    : `${this.systemPrompt}\n\nQuestion:\n${query}`    

  const result = await this.model.generateContent(prompt)
  return result.response.text()
}
}