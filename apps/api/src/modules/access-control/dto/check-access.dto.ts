import { IsNotEmpty, IsString } from "class-validator";

export class CheckAccessDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;
}
