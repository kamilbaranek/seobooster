import { IsArray, IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, IsUrl } from 'class-validator';
import { IntegrationType, WebStatus } from '@prisma/client';

export class UpdateWebDto {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsEnum(['PENDING_PAYMENT', 'ACTIVE', 'PAUSED', 'CANCELED', 'ARCHIVED'])
  status?: WebStatus;

  @IsOptional()
  @IsEnum(['NONE', 'WORDPRESS_APPLICATION_PASSWORD', 'WORDPRESS_OAUTH'])
  integrationType?: IntegrationType;

  @IsOptional()
  @IsBoolean()
  articleImageGenerationEnabled?: boolean;

  @IsOptional()
  @IsString()
  businessDescription?: string;

  @IsOptional()
  @IsString()
  businessTargetAudience?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  publicationSchedule?: string[];

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsInt()
  onboardingStep?: number;

  @IsOptional()
  @IsString()
  projectType?: string;

  @IsOptional()
  @IsString()
  webAge?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  businessGoal?: string[];

  @IsOptional()
  @IsObject()
  audience?: Record<string, any>;

  @IsOptional()
  @IsObject()
  competitors?: Record<string, any>;

  @IsOptional()
  @IsString()
  conversionGoal?: string;

  @IsOptional()
  @IsString()
  additionalInfo?: string;
}
