import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ArticleActivityQueryDto {
  @IsOptional()
  @IsIn(['all', 'published', 'generated'])
  status?: 'all' | 'published' | 'generated';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
