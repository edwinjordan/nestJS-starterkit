import { IsNotEmpty, IsOptional, IsUUID, IsNumber, Min, IsDateString, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class SaleItemDto {
  @IsNotEmpty()
  @IsUUID()
  itemId: string;

  @IsNotEmpty()
  itemName: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  subtotal: number;
}

export class CreateSaleDto {
  @IsOptional()
  @IsDateString()
  saleDate?: Date;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  customerName?: string;

  @IsOptional()
  customerPhone?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  total: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  paid: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  change?: number;

  @IsOptional()
  @IsIn(['cash', 'card', 'transfer', 'qris'])
  paymentMethod?: string;

  @IsOptional()
  notes?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
