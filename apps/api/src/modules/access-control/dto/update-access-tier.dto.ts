import { AccessTier } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateAccessTierDto {
  @IsEnum(AccessTier)
  tier!: AccessTier;
}
