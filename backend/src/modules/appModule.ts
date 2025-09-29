import { Module } from '@nestjs/common'
import { ChatModule } from './chat/chatModule'
import { AuthModule } from './auth/authModule'
import { BalanceSheetModule } from './balancesheet/balanceSheetModule'
import { RAGModule } from './rag/ragModule'

@Module({
  imports: [
    ChatModule,
    AuthModule,
    BalanceSheetModule,
    RAGModule
  ],
})
export class AppModule {}


