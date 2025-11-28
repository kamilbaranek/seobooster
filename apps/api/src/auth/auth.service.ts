import { BadRequestException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, Web, UserRole, WebStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { EmailService, getPasswordResetEmail } from '@seobooster/email';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './types/auth-response';
import { getPlanById } from '../config/subscription-plans.config';
import { SubscriptionStatus, Subscription } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService
  ) { }

  async register(payload: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    if (payload.websiteUrl) {
      const existingWeb = await this.prisma.web.findUnique({ where: { url: payload.websiteUrl } });
      if (existingWeb) {
        throw new BadRequestException('Website already connected');
      }
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: payload.email,
          passwordHash,
          webs: payload.websiteUrl ? {
            create: {
              url: payload.websiteUrl
            }
          } : undefined
        },
        include: {
          webs: true,
          subscriptions: {
            where: { status: SubscriptionStatus.ACTIVE },
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      return this.buildAuthResponse(user);
    } catch (_error: unknown) {
      if (_error instanceof PrismaClientKnownRequestError && _error.code === 'P2002') {
        throw new BadRequestException('Duplicate record detected');
      }
      throw _error;
    }
  }

  async login(payload: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
      include: {
        webs: true,
        subscriptions: {
          where: { status: SubscriptionStatus.ACTIVE },
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpires: expires
      }
    });

    const link = `${process.env.WEB_APP_URL}/auth/new-password?token=${token}`;
    const emailContent = getPasswordResetEmail(link);

    await this.emailService.sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html
    });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() }
      }
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null
      }
    });
  }

  async validateGoogleUser(details: { email: string; firstName: string; lastName: string; picture: string; googleId: string }): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: details.email },
      include: {
        webs: true,
        subscriptions: {
          where: { status: SubscriptionStatus.ACTIVE },
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (user) {
      // Link googleId if not present
      if (!user.googleId) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: details.googleId, avatarUrl: details.picture }
        });
      }
      return this.buildAuthResponse(user);
    }

    // Create new user
    const newUser = await this.prisma.user.create({
      data: {
        email: details.email,
        googleId: details.googleId,
        avatarUrl: details.picture,
        passwordHash: '', // No password for Google users
        role: UserRole.USER,
      },
      include: {
        webs: true,
        subscriptions: {
          where: { status: SubscriptionStatus.ACTIVE },
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return this.buildAuthResponse(newUser);
  }

  private buildAuthResponse(
    user: User & {
      webs: Web[];
      subscriptions: Subscription[];
    }
  ): AuthResponse {
    return {
      accessToken: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role
      }),
      user: {
        id: user.id,
        email: user.email,
        role: user.role as UserRole,
        webs: user.webs.map((web) => ({
          id: web.id,
          url: web.url,
          status: web.status as WebStatus,
          onboardingStep: web.onboardingStep ?? undefined
        })),
        planName: user.subscriptions[0]?.planId ? getPlanById(user.subscriptions[0].planId)?.name : undefined
      }
    };
  }
}
