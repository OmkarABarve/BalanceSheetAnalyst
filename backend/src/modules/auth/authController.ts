import { Controller, Post, Get, Body, Req } from '@nestjs/common'
import { AuthService } from './authService'
import { SignInRequest, SignUpRequest } from '../../types'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async signIn(@Body() credentials: SignInRequest) {
    return this.authService.signIn(credentials.email, credentials.password)
  }

  @Post('signup')
  async signUp(@Body() credentials: SignUpRequest) {
    return this.authService.signUp(credentials.email, credentials.password)
  }

  @Post('signout')
  async signOut() {
    return this.authService.signOut()
  }

  @Get('me')
  async getCurrentUser(@Req() request: any) {
    return this.authService.getCurrentUser(/*request.user?.id*/)
  }
}