import { Module } from '@nestjs/common'
import { AuthController } from './authController'
import { AuthService } from './authService'

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService], // Export if other modules need to inject AuthService
})
export class AuthModule {}
