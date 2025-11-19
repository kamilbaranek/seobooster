import { Controller, Get, Post, Body, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PUBLISH_ARTICLE_QUEUE, PublishArticleJob } from '@seobooster/queue-types';

@Controller('magic-links')
export class MagicLinksController {
    constructor(
        @InjectQueue(PUBLISH_ARTICLE_QUEUE) private publishQueue: Queue<PublishArticleJob>
    ) { }
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
            // Trigger publish job via queue
            if (magicLink.articleId) {
                await this.publishQueue.add('PublishArticle', {
                    articleId: magicLink.articleId,
                    targetStatus: 'publish',
                    trigger: 'email'
                });

                // Update article status to QUEUED to reflect immediate action in UI if needed
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
