import { Controller, Get, Post, Body, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('magic-links')
export class MagicLinksController {
    @Get(':token')
    async validateToken(@Param('token') token: string) {
        const magicLink = await (prisma as any).magicLink.findUnique({
            where: { token },
            include: { article: true, web: true }
        });

        if (!magicLink) {
            throw new NotFoundException('Invalid token');
        }

        if (magicLink.expiresAt < new Date()) {
            throw new BadRequestException('Token expired');
        }

        if (magicLink.usedAt) {
            throw new BadRequestException('Token already used');
        }

        return {
            valid: true,
            type: magicLink.type,
            articleTitle: magicLink.article?.title,
            webUrl: magicLink.web.url
        };
    }

    @Post(':token/execute')
    async executeAction(
        @Param('token') token: string,
        @Body() body: { rating?: number; comment?: string }
    ) {
        const magicLink = await (prisma as any).magicLink.findUnique({
            where: { token },
            include: { article: true }
        });

        if (!magicLink || magicLink.expiresAt < new Date() || magicLink.usedAt) {
            throw new BadRequestException('Invalid or expired token');
        }

        if (magicLink.type === 'PUBLISH') {
            // Trigger publish job (handled via queue in worker, but for now we update status directly or trigger via API if queue service is available)
            // Ideally, we should inject a Queue service here. For MVP, let's update status to QUEUED and let scheduler pick it up? 
            // Or better: create a PublishArticleJob.
            // Since we don't have Queue injection setup in this simple controller yet, let's update ArticlePlan status to QUEUED if exists, or Article status directly?
            // The requirement says: "po stisku zveřejnit se pouze zobrazí, že už se na to pracuje".

            // Let's mark article as QUEUED for publishing.
            if (magicLink.articleId) {
                // Find associated plan and set to QUEUED
                await prisma.articlePlan.updateMany({
                    where: { articleId: magicLink.articleId },
                    data: { status: 'QUEUED', plannedPublishAt: new Date() } // Publish immediately
                });

                // Also update article status to QUEUED just in case
                await prisma.article.update({
                    where: { id: magicLink.articleId },
                    data: { status: 'QUEUED' }
                });
            }
        } else if (magicLink.type === 'FEEDBACK') {
            if (!body.rating) {
                throw new BadRequestException('Rating is required');
            }
            if (magicLink.articleId) {
                await prisma.article.update({
                    where: { id: magicLink.articleId },
                    data: {
                        feedbackRating: body.rating,
                        feedbackComment: body.comment
                    } as any
                });
            }
        }

        // Mark token as used
        await (prisma as any).magicLink.update({
            where: { id: magicLink.id },
            data: { usedAt: new Date() }
        });

        return { success: true };
    }
}
