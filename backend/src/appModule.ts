import { Module } from '@nestjs/common'
import { ChatModule } from './modules/chat/chatModule'
// import { AuthModule } from './modules/auth/authModule'  // Auth disabled
import { BalanceSheetModule } from './modules/balancesheet/balanceSheetModule'
import { RAGModule } from './modules/rag/ragModule'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    DatabaseModule,
    ChatModule,
    // AuthModule,  // Auth disabled
    BalanceSheetModule,
    RAGModule
  ],
})
export class AppModule {}