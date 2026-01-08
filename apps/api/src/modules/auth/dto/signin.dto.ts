import { IsString, MinLength } from "class-validator";

export class SigninDto {
  @IsString()
  @MinLength(1)
  emailOrUsername!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
