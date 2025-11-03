import { IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class UpdateBranchDto {
  @IsOptional()
  code?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
