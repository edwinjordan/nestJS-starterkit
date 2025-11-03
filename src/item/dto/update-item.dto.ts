import { IsOptional, IsBoolean, IsUUID, IsNumber, Min } from 'class-validator';

export class UpdateItemDto {
  @IsOptional()
  code?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  unitId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @IsOptional()
  barcode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
