import { Module } from '@nestjs/common'
import { BalanceSheetController } from './balance-sheet.controller'
import { BalanceSheetService } from './balance-sheet.service'

@Module({
  controllers: [BalanceSheetController],
  providers: [BalanceSheetService],
  exports: [BalanceSheetService],
})
export class BalanceSheetModule {}
