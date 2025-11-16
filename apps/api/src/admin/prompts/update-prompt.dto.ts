import { IsOptional, IsString } from 'class-validator';

export class UpdatePromptDto {
  @IsString()
  systemPrompt!: string;

  @IsString()
  userPrompt!: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  model?: string;
}
