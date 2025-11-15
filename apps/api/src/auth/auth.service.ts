import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, Web, UserRole, WebStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './types/auth-response';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(payload: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const existingWeb = await this.prisma.web.findUnique({ where: { url: payload.websiteUrl } });
    if (existingWeb) {
      throw new BadRequestException('Website already connected');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: payload.email,
          passwordHash,
          webs: {
            create: {
              url: payload.websiteUrl
            }
          }
        },
        include: {
          webs: true
        }
      });

      return this.buildAuthResponse(user);
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Duplicate record detected');
      }
      throw error;
    }
  }

  async login(payload: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
      include: { webs: true }
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
          status: web.status as WebStatus
        }))
      }
    };
  }
}
