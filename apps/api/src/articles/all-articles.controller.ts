import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUserPayload } from '../auth/types/auth-response';
import { ArticlesService } from './articles.service';
import { ArticleActivityQueryDto } from './dto/article-activity-query.dto';

@Controller('articles')
@UseGuards(JwtAuthGuard)
export class AllArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    @Get()
    listAll(@CurrentUser() user: AuthenticatedUserPayload) {
        return this.articlesService.listAllArticlePlans(user.userId);
    }

    @Get('activity')
    listActivity(
        @CurrentUser() user: AuthenticatedUserPayload,
        @Query() query: ArticleActivityQueryDto
    ) {
        return this.articlesService.listArticleActivity(user.userId, query);
    }
}
