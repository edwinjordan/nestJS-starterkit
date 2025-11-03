import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  module?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
