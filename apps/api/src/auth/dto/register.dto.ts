import { IsEmail, IsString, IsUrl, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsUrl()
  websiteUrl!: string;
}
