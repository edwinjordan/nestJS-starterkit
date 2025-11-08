import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PaginationDto, PaginatedResponseDto } from '../common';

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
  ) {}

  async create(createUnitDto: CreateUnitDto): Promise<Unit> {
    const unit = this.unitRepository.create(createUnitDto);
    return this.unitRepository.save(unit);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Unit>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = paginationDto;
    
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.unitRepository.createQueryBuilder('unit');
    
    // Search
    if (search) {
      queryBuilder.where(
        '(unit.name ILIKE :search OR unit.abbreviation ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    // Sorting
    const allowedSortFields = ['name', 'abbreviation', 'createdAt', 'updatedAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`unit.${sortField}`, sortOrder);
    
    // Pagination
    queryBuilder.skip(skip).take(limit);
    
    const [data, total] = await queryBuilder.getManyAndCount();
    
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<Unit> {
    const unit = await this.unitRepository.findOne({ where: { id } });
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return unit;
  }

  async update(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {
    const unit = await this.findOne(id);
    Object.assign(unit, updateUnitDto);
    return this.unitRepository.save(unit);
  }

  async remove(id: string): Promise<void> {
    const unit = await this.findOne(id);
    await this.unitRepository.remove(unit);
  }
}
