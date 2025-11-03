import { IsOptional, IsBoolean, IsEmail, IsUUID, IsDateString } from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  employeeCode?: string;

  @IsOptional()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  position?: string;

  @IsOptional()
  department?: string;

  @IsOptional()
  @IsDateString()
  hireDate?: Date;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
