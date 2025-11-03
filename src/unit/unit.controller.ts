import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('units')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  @Permissions('unit.create')
  create(@Body() createUnitDto: CreateUnitDto) {
    return this.unitService.create(createUnitDto);
  }

  @Get()
  @Permissions('unit.read')
  findAll() {
    return this.unitService.findAll();
  }

  @Get(':id')
  @Permissions('unit.read')
  findOne(@Param('id') id: string) {
    return this.unitService.findOne(id);
  }

  @Patch(':id')
  @Permissions('unit.update')
  update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitService.update(id, updateUnitDto);
  }

  @Delete(':id')
  @Permissions('unit.delete')
  remove(@Param('id') id: string) {
    return this.unitService.remove(id);
  }
}
