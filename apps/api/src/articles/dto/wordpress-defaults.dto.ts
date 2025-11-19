import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WordpressTagsMode } from '@prisma/client';

export class WordpressDefaultsDto {
  @IsOptional()
  @IsString()
  defaultCategoryId?: string;

  @IsOptional()
  @IsString()
  defaultAuthorId?: string;

  @IsOptional()
  @IsEnum(WordpressTagsMode)
  tagsMode?: WordpressTagsMode;
}
