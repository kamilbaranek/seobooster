import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ArticleActivityQueryDto {
  @IsOptional()
  @IsIn(['all', 'published', 'generated'])
  status?: 'all' | 'published' | 'generated';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
