import { IsObject } from 'class-validator';

export class UpsertCredentialsDto {
  @IsObject()
  credentials!: Record<string, unknown>;
}

