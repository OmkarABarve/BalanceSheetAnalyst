// backend/src/modules/rag/ragController.ts
import { Controller, Post, Body, Query } from '@nestjs/common'
import { RAGService } from './ragService'

@Controller('rag')
export class RAGController {
  constructor(private readonly ragService: RAGService) {}

  @Post('process')
  async processForRAG(
    @Body() file: Express.Multer.File,
    @Query('userId') userId: string
  ) {
    return this.ragService.processForRAG(file, userId)
  }

  @Post('query')
  async queryRAG(
    @Body('question') question: string,
    @Query('userId') userId: string,
    @Query('k') k?: number
  ) {
    return this.ragService.queryRAG(question, userId, k)
  }
}