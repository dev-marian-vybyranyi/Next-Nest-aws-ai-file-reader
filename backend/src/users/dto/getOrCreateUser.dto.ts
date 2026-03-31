import { IsEmail } from 'class-validator';

export class GetOrCreateUserDto {
  @IsEmail()
  email: string;
}
