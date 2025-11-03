import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateUnitDto {
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
