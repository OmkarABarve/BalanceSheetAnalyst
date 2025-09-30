import { Module } from '@nestjs/common'
import { ChatController } from './chatController'
import { ChatService } from './chatService'
import {RAGModule} from '../rag/ragModule'
@Module({
  imports: [RAGModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService], // Export if other modules need to inject ChatService
})
export class ChatModule {}
