import { Controller, Get, NotFoundException, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin/ai-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class AdminAiLogsController {
  constructor(private readonly prisma: PrismaService) { }

  @Get()
  async list(
    @Query('webId') webId?: string,
    @Query('task') task?: string,
    @Query('provider') provider?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ) {
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    const logs = await this.prisma.aiCallLog.findMany({
      where: {
        ...(webId ? { webId } : {}),
        ...(task ? { task } : {}),
        ...(provider ? { provider } : {})
      },
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        createdAt: true,
        webId: true,
        task: true,
        provider: true,
        model: true,
        status: true,
        variables: true
      }
    });

    return logs;
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    const log = await this.prisma.aiCallLog.findUnique({ where: { id } });
    if (!log) {
      throw new NotFoundException('AI log not found');
    }
    return log;
  }
}
