import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PaginationDto } from '../common';

@Controller('items')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @Permissions('item.create')
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemService.create(createItemDto);
  }

  @Get()
  @Permissions('item.read')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.itemService.findAll(paginationDto);
  }

  @Get('barcode/:barcode')
  @Permissions('item.read')
  findByBarcode(@Param('barcode') barcode: string) {
    return this.itemService.findByBarcode(barcode);
  }

  @Get(':id')
  @Permissions('item.read')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(id);
  }

  @Patch(':id')
  @Permissions('item.update')
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemService.update(id, updateItemDto);
  }

  @Delete(':id')
  @Permissions('item.delete')
  remove(@Param('id') id: string) {
    return this.itemService.remove(id);
  }
}
