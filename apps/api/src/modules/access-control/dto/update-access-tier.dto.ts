import { IsEnum } from "class-validator";
import { AccessTier } from "@prisma/client";

export class UpdateAccessTierDto {
  @IsEnum(AccessTier)
  tier!: AccessTier;
}
