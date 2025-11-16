import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PaginationDto, PaginatedResponseDto } from '../common';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
  ) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    const item = this.itemRepository.create(createItemDto);
    return this.itemRepository.save(item);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Item>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = paginationDto;
    
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('item.unit', 'unit');
    
    // Search
    if (search) {
      queryBuilder.where(
        '(item.name ILIKE :search OR item.code ILIKE :search OR item.barcode ILIKE :search OR category.name ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    // Sorting
    const allowedSortFields = ['name', 'code', 'price', 'stock', 'createdAt', 'updatedAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`item.${sortField}`, sortOrder);
    
    // Pagination
    queryBuilder.skip(skip).take(limit);
    
    const [data, total] = await queryBuilder.getManyAndCount();
    
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['category', 'unit'],
    });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  async findByBarcode(barcode: string): Promise<Item | null> {
    return this.itemRepository.findOne({
      where: { barcode },
      relations: ['category', 'unit'],
    });
  }

  async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
    const item = await this.findOne(id);
    Object.assign(item, updateItemDto);
    return this.itemRepository.save(item);
  }

  async updateStock(id: string, quantity: number): Promise<Item> {
    const item = await this.findOne(id);
    item.stock += quantity;
    return this.itemRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.itemRepository.remove(item);
  }
}
