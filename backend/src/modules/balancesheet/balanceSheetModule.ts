import { Module } from '@nestjs/common'
import { BalanceSheetController } from './balanceSheetController'
import { BalanceSheetService } from './balanceSheetService'

@Module({
  controllers: [BalanceSheetController],
  providers: [BalanceSheetService],
  exports: [BalanceSheetService],
})
export class BalanceSheetModule {}
