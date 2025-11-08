import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PaginationDto } from '../common';

@Controller('branches')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Permissions('branch.create')
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchService.create(createBranchDto);
  }

  @Get()
  @Permissions('branch.read')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.branchService.findAll(paginationDto);
  }

  @Get(':id')
  @Permissions('branch.read')
  findOne(@Param('id') id: string) {
    return this.branchService.findOne(id);
  }

  @Patch(':id')
  @Permissions('branch.update')
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchService.update(id, updateBranchDto);
  }

  @Delete(':id')
  @Permissions('branch.delete')
  remove(@Param('id') id: string) {
    return this.branchService.remove(id);
  }
}
