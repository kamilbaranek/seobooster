import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUserPayload } from '../auth/types/auth-response';
import { ArticlesService } from './articles.service';

@Controller('articles')
@UseGuards(JwtAuthGuard)
export class AllArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    @Get()
    listAll(@CurrentUser() user: AuthenticatedUserPayload) {
        return this.articlesService.listAllArticlePlans(user.userId);
    }
}
