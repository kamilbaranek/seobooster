import { IsEmail, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;
}
