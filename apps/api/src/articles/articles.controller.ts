import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUserPayload } from '../auth/types/auth-response';
import { ArticlesService } from './articles.service';
import { ArticleListQueryDto } from './dto/article-list-query.dto';
import { ArticleMetadataDto } from './dto/article-metadata.dto';

@Controller('webs/:webId/articles')
@UseGuards(JwtAuthGuard)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('webId') webId: string,
    @Query() query: ArticleListQueryDto
  ) {
    return this.articlesService.listArticles(user.userId, webId, query);
  }

  @Get(':articleId')
  getOne(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('webId') webId: string,
    @Param('articleId') articleId: string
  ) {
    return this.articlesService.getArticle(user.userId, webId, articleId);
  }

  @Patch(':articleId/metadata')
  updateMetadata(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('webId') webId: string,
    @Param('articleId') articleId: string,
    @Body() dto: ArticleMetadataDto
  ) {
    return this.articlesService.updateArticleMetadata(user.userId, webId, articleId, dto);
  }

}
