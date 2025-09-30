// backend/src/modules/rag/ragController.ts
import { Controller, Post, Query, UseInterceptors, UploadedFile, Body } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { RAGService } from './ragService'

@Controller('rag')
export class RAGController {
  constructor(private readonly ragService: RAGService) {}

  @Post('process')
  @UseInterceptors(FileInterceptor('file'))
  async processForRAG(
    @UploadedFile() file: Express.Multer.File,
    @Query('userId') userId: string,
    @Query('companyId') companyId?: string,
    @Query('year') year?: number
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