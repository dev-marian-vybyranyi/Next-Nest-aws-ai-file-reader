import { IsEmail, IsString, MinLength } from 'class-validator';

export class AskQuestionDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  question: string;
}
