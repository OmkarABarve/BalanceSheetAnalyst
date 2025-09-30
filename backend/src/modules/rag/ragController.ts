import { Controller, Post, UploadedFile, Body, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { RAGService } from './ragService'

@Controller('rag')
export class RAGController {
    constructor(private readonly ragService: RAGService) {}

    /*@Post('process')
    @UseInterceptors(FileInterceptor('file'))
    async processPDF(
        @UploadedFile() file: Express.Multer.File,
        @Body('companyId') companyId: string,
        @Body('year') year: number,
        @Body('userId') userId: string = 'default'
    ) {
        console.log('🚀 Processing PDF for RAG:', {
            filename: file.originalname,
            size: file.size,
            companyId,
            year,
            userId
        })

        //const result = await this.ragService.processForRAG(file, userId, companyId, year)
        const result=await this.ragService.processPDFDirect
        console.log('✅ PDF processed successfully:', {
            chunks: result.chunks,
            balanceSheetId: result.balanceSheetId
        })

        return result
    }*/
    @Post('process')
    @UseInterceptors(FileInterceptor('file'))
    async processPDF(
        @UploadedFile() file: Express.Multer.File,
        @Body('companyId') companyId: string,
        @Body('year') year: number,
        @Body('userId') userId: string = 'default'
    ) {
        console.log('🚀 Processing PDF for RAG:', {
            filename: file.originalname,
            size: file.size,
            companyId,
            year,
            userId
        })

        // Use processPDFDirect for in-memory storage
        const result = await this.ragService.processPDFDirect(file)

        console.log('✅ PDF processed successfully:', {
            chunks: result.chunks,
            textLength: result.text.length
        })

        return {
            success: true,
            chunks: result.chunks,
            balanceSheetId: `direct_${Date.now()}`,
            extractedText: result.text
        }
    }

  }

  