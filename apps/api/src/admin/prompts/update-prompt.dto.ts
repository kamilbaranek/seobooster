import { IsString } from 'class-validator';

export class UpdatePromptDto {
  @IsString()
  systemPrompt!: string;

  @IsString()
  userPrompt!: string;
}

