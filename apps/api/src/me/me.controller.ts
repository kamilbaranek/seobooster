import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUserPayload } from '../auth/types/auth-response';
import { getPlanById } from '../config/subscription-plans.config';
import { SubscriptionStatus } from '@prisma/client';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly prisma: PrismaService) { }

  @Get()
  async getProfile(@CurrentUser() user: AuthenticatedUserPayload) {
    const me = await this.prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        webs: {
          orderBy: { createdAt: 'asc' }
        },
        subscriptions: {
          where: { status: SubscriptionStatus.ACTIVE },
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return {
      user: {
        id: me?.id ?? user.userId,
        email: me?.email ?? user.email,
        role: me?.role ?? user.role,
        planName: me?.subscriptions?.[0]?.planId ? getPlanById(me.subscriptions[0].planId)?.name : undefined
      },
      webs: me?.webs ?? []
    };
  }
}
