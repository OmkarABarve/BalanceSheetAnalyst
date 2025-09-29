import { Global, Module } from '@nestjs/common'
import { SupabaseService } from './supabaseClient'

@Global()
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class DatabaseModule {}
