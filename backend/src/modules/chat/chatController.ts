import { Controller, Post, Body } from '@nestjs/common'
import { chatService } from './chatService'
import { ChatRequest, ChatResponse } from '../../types'

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async askChat(@Body() chatRequest: ChatRequest): Promise<ChatResponse> {
    const response = await this.chatService.askChat(
      chatRequest.query,
      chatRequest.context
    )
    return { response }
  }
}
