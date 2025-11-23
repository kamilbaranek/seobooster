import { IsISO8601 } from 'class-validator';

export class UpdateArticlePlanDto {
  @IsISO8601()
  plannedPublishAt!: string;
}
