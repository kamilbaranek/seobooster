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
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUserPayload } from '../auth/types/auth-response';
import { WebsService } from './webs.service';
import { CreateWebDto } from './dto/create-web.dto';
import { UpdateWebDto } from './dto/update-web.dto';
import { UpsertCredentialsDto } from './dto/upsert-credentials.dto';

@Controller('webs')
@UseGuards(JwtAuthGuard)
export class WebsController {
  constructor(private readonly websService: WebsService) {}

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

  @Post(':id/debug/scan')
  debugScan(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new NotFoundException();
    }
    return this.websService.triggerScan(user.userId, id);
  }

  @Post(':id/debug/analyze')
  debugAnalyze(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new NotFoundException();
    }
    return this.websService.triggerAnalysis(user.userId, id);
  }

  @Post(':id/debug/strategy')
  debugStrategy(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new NotFoundException();
    }
    return this.websService.triggerStrategy(user.userId, id);
  }

  @Get(':id/pipeline-debug')
  getPipelineDebug(@CurrentUser() user: AuthenticatedUserPayload, @Param('id') id: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new NotFoundException();
    }
    return this.websService.getPipelineDebug(user.userId, id);
  }
}
