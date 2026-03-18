import { IsEmail, IsString } from 'class-validator';

export class CreateFileDto {
  @IsEmail()
  email: string;

  @IsString()
  filename: string;

  @IsString()
  s3Key: string;
}
