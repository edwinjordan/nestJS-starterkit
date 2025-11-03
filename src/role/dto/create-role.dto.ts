import { IsNotEmpty, IsOptional, IsArray, IsUUID, IsBoolean } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];
}
