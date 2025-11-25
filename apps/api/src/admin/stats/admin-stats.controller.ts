import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('admin/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN')
export class AdminStatsController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('costs')
    async getCosts() {
        // Aggregated costs per web
        // Cast to any to avoid type errors until client is fully regenerated/picked up
        const costs = await (this.prisma as any).aiCost.groupBy({
            by: ['webId', 'currency'],
            _sum: {
                totalCost: true,
                inputTokens: true,
                outputTokens: true
            }
        });

        // Get web details
        const webIds = costs.map((c: any) => c.webId);
        const webs = await this.prisma.web.findMany({
            where: { id: { in: webIds } },
            select: { id: true, url: true, nickname: true }
        });

        const webMap = new Map(webs.map(w => [w.id, w]));

        const costsByWeb = costs.map((c: any) => ({
            webId: c.webId,
            webUrl: webMap.get(c.webId)?.url,
            webNickname: webMap.get(c.webId)?.nickname,
            totalCost: c._sum.totalCost,
            currency: c.currency,
            inputTokens: c._sum.inputTokens,
            outputTokens: c._sum.outputTokens
        }));

        // Total aggregated cost
        const totalCost = costs.reduce((acc: number, curr: any) => acc + (curr._sum.totalCost || 0), 0);

        return {
            totalCost,
            costsByWeb
        };
    }

    @Get('articles')
    async getArticleCosts(@Query('limit') limit = '50', @Query('offset') offset = '0') {
        const take = parseInt(limit, 10);
        const skip = parseInt(offset, 10);

        // Fetch articles with costs
        // We use any cast for include because generated types might not be picked up yet
        const articles = await this.prisma.article.findMany({
            where: { aiCosts: { some: {} } } as any,
            include: {
                web: { select: { url: true, nickname: true } },
                aiCosts: true
            } as any,
            orderBy: { createdAt: 'desc' },
            take,
            skip
        });

        const result = articles.map((a: any) => {
            const totalCost = a.aiCosts.reduce((sum: number, c: any) => sum + c.totalCost, 0);
            const textCosts = a.aiCosts.filter((c: any) => c.type === 'TEXT');
            const imageCosts = a.aiCosts.filter((c: any) => c.type === 'IMAGE');

            return {
                articleId: a.id,
                title: a.title,
                webUrl: a.web.url,
                webNickname: a.web.nickname,
                totalCost,
                currency: a.aiCosts[0]?.currency ?? 'USD',
                textVersions: textCosts.length,
                imageVersions: imageCosts.length,
                details: a.aiCosts
            };
        });

        const totalArticles = await this.prisma.article.count({
            where: { aiCosts: { some: {} } } as any
        });

        return {
            data: result,
            total: totalArticles,
            page: Math.floor(skip / take) + 1,
            limit: take
        };
    }
}
