import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  code?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
