import { IsString, IsNotEmpty } from "class-validator";

export class CheckAccessDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;
}
