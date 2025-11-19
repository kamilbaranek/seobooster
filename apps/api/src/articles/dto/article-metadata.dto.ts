import { ArrayUnique, IsArray, IsOptional, IsString } from 'class-validator';

export class ArticleMetadataDto {
  @IsOptional()
  @IsString()
  wordpressCategoryId?: string;

  @IsOptional()
  @IsString()
  wordpressAuthorId?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];
}
