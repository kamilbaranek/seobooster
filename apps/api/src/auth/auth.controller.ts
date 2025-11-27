import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './types/auth-response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() payload: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(payload);
  }

  @Post('login')
  login(@Body() payload: LoginDto): Promise<AuthResponse> {
    return this.authService.login(payload);
  }

  @Post('forgot-password')
  forgotPassword(@Body() payload: { email: string }): Promise<void> {
    return this.authService.forgotPassword(payload.email);
  }

  @Post('reset-password')
  resetPassword(@Body() payload: { token: string; password: string }): Promise<void> {
    return this.authService.resetPassword(payload.token, payload.password);
  }
}
