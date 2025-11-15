import { IsString, IsUrl } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsString()
  webId!: string;

  @IsUrl()
  successUrl!: string;

  @IsUrl()
  cancelUrl!: string;
}

