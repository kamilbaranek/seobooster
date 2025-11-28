import { Body, Controller, Post, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: Request) {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const authResponse = await this.authService.validateGoogleUser(req.user);
    const frontendUrl = process.env.WEB_APP_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${authResponse.accessToken}`);
  }
}
