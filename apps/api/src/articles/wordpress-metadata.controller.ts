import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUserPayload } from '../auth/types/auth-response';
import { ArticlesService } from './articles.service';
import { WordpressDefaultsDto } from './dto/wordpress-defaults.dto';

@Controller('webs/:webId/wordpress')
@UseGuards(JwtAuthGuard)
export class WordpressMetadataController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('metadata')
  metadata(@CurrentUser() user: AuthenticatedUserPayload, @Param('webId') webId: string) {
    return this.articlesService.getWordpressMetadata(user.userId, webId);
  }

  @Post('refresh-metadata')
  refresh(@CurrentUser() user: AuthenticatedUserPayload, @Param('webId') webId: string) {
    return this.articlesService.refreshWordpressMetadata(user.userId, webId);
  }

  @Patch('defaults')
  updateDefaults(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('webId') webId: string,
    @Body() dto: WordpressDefaultsDto
  ) {
    return this.articlesService.updateWordpressDefaults(user.userId, webId, dto);
  }
}
