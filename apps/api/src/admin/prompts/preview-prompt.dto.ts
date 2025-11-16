import { IsOptional, IsString } from 'class-validator';

export class PreviewPromptDto {
  @IsOptional()
  @IsString()
  webId?: string;

  @IsOptional()
  @IsString()
  url?: string;
}
