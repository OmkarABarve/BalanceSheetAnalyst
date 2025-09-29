// backend/src/modules/rag/ragModule.ts
import { Module } from '@nestjs/common'
import { RAGService } from './ragService'
import { BalanceSheetModule } from '../balancesheet/balanceSheetModule'
import { RAGController } from './ragController'

@Module({
  imports: [BalanceSheetModule], // Import BalanceSheetService
  providers: [RAGService],
  controllers: [RAGController],
  exports: [RAGService], // Export for use in other modules
})
export class RAGModule {}