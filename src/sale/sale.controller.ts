import { Controller, Get, Post, Body, Param, UseGuards, Query, Req } from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  @Permissions('sale.create')
  create(@Body() createSaleDto: CreateSaleDto, @Req() req: any) {
    return this.saleService.create(createSaleDto, req.user.id);
  }

  @Get()
  @Permissions('sale.read')
  findAll() {
    return this.saleService.findAll();
  }

  @Get('invoice/:invoiceNumber')
  @Permissions('sale.read')
  findByInvoice(@Param('invoiceNumber') invoiceNumber: string) {
    return this.saleService.findByInvoiceNumber(invoiceNumber);
  }

  @Get('report')
  @Permissions('sale.read')
  getSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.saleService.getSalesReport(new Date(startDate), new Date(endDate));
  }

  @Get(':id')
  @Permissions('sale.read')
  findOne(@Param('id') id: string) {
    return this.saleService.findOne(id);
  }
}
