import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { IntegrationType } from '@prisma/client';

export class CreateWebDto {
  @IsUrl()
  url!: string;

  @IsOptional()
  @IsEnum(['NONE', 'WORDPRESS_APPLICATION_PASSWORD', 'WORDPRESS_OAUTH'])
  integrationType?: IntegrationType;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString({ each: true })
  publicationSchedule?: string[];
}

