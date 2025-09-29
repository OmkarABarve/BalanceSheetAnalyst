import { Injectable } from '@nestjs/common'
import { GoogleGenerativeAI } from '@google/generative-ai'

@Injectable()
export class ChatService {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    })
  }

  async askChat(query: string, context?: string): Promise<string> {
    const prompt = context
      ? `Context:\n${context}\n\nQuestion:\n${query}`
      : query

    const result = await this.model.generateContent(prompt)
    return result.response.text()
  }
}
