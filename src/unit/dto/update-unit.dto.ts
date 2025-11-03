import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateUnitDto {
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
