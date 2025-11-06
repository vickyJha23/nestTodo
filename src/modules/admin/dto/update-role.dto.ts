import { IsOptional } from "class-validator";

export class UpdateRoleChangeDto {
     @IsOptional()
     role: string
 }