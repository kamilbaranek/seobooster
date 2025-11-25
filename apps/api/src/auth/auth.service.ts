import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, Web, UserRole, WebStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
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
    private readonly jwtService: JwtService
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
