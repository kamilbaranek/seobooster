import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class PublishBatchDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  articleIds!: string[];
}
