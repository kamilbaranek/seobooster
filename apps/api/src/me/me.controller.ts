import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUserPayload } from '../auth/types/auth-response';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getProfile(@CurrentUser() user: AuthenticatedUserPayload) {
    const me = await this.prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        webs: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return {
      user: {
        id: me?.id ?? user.userId,
        email: me?.email ?? user.email
      },
      webs: me?.webs ?? []
    };
  }
}

