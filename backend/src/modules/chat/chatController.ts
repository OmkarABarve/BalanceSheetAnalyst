import { Controller, Post, Body } from '@nestjs/common'
import { ChatService } from './chatService'
import { ChatRequest, ChatResponse } from '../../types'
import { RAGService } from '../rag/ragService'

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService, private readonly ragService: RAGService) {}

  @Post()
  async askChat(@Body() chatRequest: ChatRequest): Promise<ChatResponse> {
    const response = await this.chatService.askChat(
      chatRequest.query,
      chatRequest.context,
      this.ragService
    )
    return { response }
  }
}
