import { IsOptional, IsBoolean } from 'class-validator';

export class UpdatePermissionDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  module?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
