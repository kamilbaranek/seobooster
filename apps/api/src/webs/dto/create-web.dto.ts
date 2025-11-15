import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { IntegrationType } from '@prisma/client';

export class CreateWebDto {
  @IsUrl()
  url!: string;

  @IsOptional()
  @IsEnum(IntegrationType)
  integrationType?: IntegrationType;

  @IsOptional()
  @IsString()
  nickname?: string;
}

