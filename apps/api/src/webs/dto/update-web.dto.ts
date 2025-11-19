import { IsBoolean, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { IntegrationType, WebStatus } from '@prisma/client';

export class UpdateWebDto {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsEnum(WebStatus)
  status?: WebStatus;

  @IsOptional()
  @IsEnum(IntegrationType)
  integrationType?: IntegrationType;

  @IsOptional()
  @IsBoolean()
  articleImageGenerationEnabled?: boolean;
}
