import { IsString, IsNotEmpty, IsEnum, IsOptional, IsISO8601 } from "class-validator";
import { AccessTier } from "@prisma/client";

export class GrantAccessDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsEnum(AccessTier)
  tier!: AccessTier;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}
