import { Module } from '@nestjs/common'
import { BalanceSheetController } from './balanceSheetController'
import { BalanceSheetService } from './balanceSheetService'
import { RAGModule } from '../rag/ragModule'
@Module({
  imports: [RAGModule],
  controllers: [BalanceSheetController],
  providers: [BalanceSheetService],
  exports: [BalanceSheetService],
})
export class BalanceSheetModule {}
