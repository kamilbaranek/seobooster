import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUserPayload } from '../auth/types/auth-response';
import { WebsService } from './webs.service';
import { CreateWebDto } from './dto/create-web.dto';
import { UpdateWebDto } from './dto/update-web.dto';
import { UpsertCredentialsDto } from './dto/upsert-credentials.dto';
import { UpdateArticlePlanDto } from './dto/update-article-plan.dto';
import { PublishBatchDto } from './dto/publish-batch.dto';

@Controller('webs')
@UseGuards(JwtAuthGuard)
export class WebsController {
  constructor(private readonly websService: WebsService) { }

  @Get()
  list(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.websService.findAll(user.userId);
  }

  @Get(':id')
  getOne(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    return this.websService.findOne(user.userId, id);
  }

  @Get(':id/overview')
  overview(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    return this.websService.getOverview(user.userId, id);
  }

  @Get(':id/article-plans')
  getArticlePlans(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    return this.websService.getArticlePlans(user.userId, id);
  }

  @Patch(':id/article-plans/:planId')
  updateArticlePlan(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('id') id: string,
    @Param('planId') planId: string,
    @Body() payload: UpdateArticlePlanDto
  ) {
    return this.websService.updateArticlePlanDate(user.userId, id, planId, payload);
  }

  @Post(':id/article-plans/:planId/regenerate')
  regenerateArticle(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('id') id: string,
    @Param('planId') planId: string
  ) {
    return this.websService.regenerateArticle(user.userId, id, planId);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUserPayload, @Body() payload: CreateWebDto) {
    return this.websService.create(user.userId, payload);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('id') id: string,
    @Body() payload: UpdateWebDto
  ) {
    return this.websService.update(user.userId, id, payload);
  }

  @Delete(':id')
  delete(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    return this.websService.remove(user.userId, id);
  }

  @Get(':id/credentials')
  getCredentials(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    return this.websService.getCredentials(user.userId, id);
  }

  @Put(':id/credentials')
  upsertCredentials(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('id') id: string,
    @Body() payload: UpsertCredentialsDto
  ) {
    return this.websService.upsertCredentials(user.userId, id, payload);
  }

  @Delete(':id/credentials')
  deleteCredentials(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    return this.websService.deleteCredentials(user.userId, id);
  }

  @Post(':id/generate-article')
  generateArticle(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    return this.websService.triggerArticleGeneration(user.userId, id);
  }

  @Post(':id/refresh-favicon')
  refreshFavicon(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    return this.websService.refreshFavicon(user.userId, id);
  }

  @Post(':id/favicon')
  @UseInterceptors(FileInterceptor('file'))
  uploadFavicon(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.websService.uploadFavicon(user.userId, id, file);
  }

  @Delete(':id/favicon')
  deleteFavicon(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    return this.websService.deleteFavicon(user.userId, id);
  }

  @Post(':id/refresh-screenshot')
  refreshScreenshot(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    return this.websService.refreshScreenshot(user.userId, id);
  }

  @Post(':id/articles/:articleId/publish')
  publishArticle(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('id') id: string,
    @Param('articleId') articleId: string
  ) {
    return this.websService.publishArticle(user.userId, id, articleId);
  }

  @Post(':id/articles/publish-batch')
  publishBatch(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('id') id: string,
    @Body() payload: PublishBatchDto
  ) {
    return this.websService.publishArticles(user.userId, id, payload.articleIds);
  }

  @Post(':id/rescan')
  rescan(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    return this.websService.rescanWebsite(user.userId, id);
  }

  @Post(':id/debug/scan')
  debugScan(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    const debugEnabled = process.env.AI_DEBUG_PIPELINE === 'true' || process.env.NODE_ENV !== 'production';
    if (!debugEnabled) {
      throw new NotFoundException();
    }
    return this.websService.triggerScan(user.userId, id);
  }

  @Post(':id/debug/analyze')
  debugAnalyze(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    const debugEnabled = process.env.AI_DEBUG_PIPELINE === 'true' || process.env.NODE_ENV !== 'production';
    if (!debugEnabled) {
      throw new NotFoundException();
    }
    return this.websService.triggerAnalysis(user.userId, id);
  }

  @Post(':id/debug/strategy')
  debugStrategy(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    const debugEnabled = process.env.AI_DEBUG_PIPELINE === 'true' || process.env.NODE_ENV !== 'production';
    if (!debugEnabled) {
      throw new NotFoundException();
    }
    return this.websService.triggerStrategy(user.userId, id);
  }

  @Get(':id/pipeline-debug')
  getPipelineDebug(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    const debugEnabled = process.env.AI_DEBUG_PIPELINE === 'true' || process.env.NODE_ENV !== 'production';
    if (!debugEnabled) {
      throw new NotFoundException();
    }
    return this.websService.getPipelineDebug(user.userId, id);
  }
}
