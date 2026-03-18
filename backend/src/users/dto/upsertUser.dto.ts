import { IsEmail } from 'class-validator';

export class UpsertUserDto {
  @IsEmail()
  email: string;
}
