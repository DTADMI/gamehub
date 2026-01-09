import { AccessTier } from "@prisma/client";
import { IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString } from "class-validator";

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
