import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { Role } from './role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Permission } from '../permission/permission.entity';
import { PaginationDto, PaginatedResponseDto } from '../common';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    let permissions: Permission[] = [];
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      permissions = await this.permissionRepository.find({
        where: { id: In(createRoleDto.permissionIds) }
      });
    }

    const role = this.roleRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
      isActive: createRoleDto.isActive ?? true,
      permissions,
    });

    return this.roleRepository.save(role);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Role>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = paginationDto;
    
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions');
    
    // Search
    if (search) {
      queryBuilder.where(
        '(role.name ILIKE :search OR role.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    // Sorting
    const allowedSortFields = ['name', 'createdAt', 'updatedAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`role.${sortField}`, sortOrder);
    
    // Pagination
    queryBuilder.skip(skip).take(limit);
    
    const [data, total] = await queryBuilder.getManyAndCount();
    
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (updateRoleDto.permissionIds) {
      const permissions = await this.permissionRepository.find({
        where: { id: In(updateRoleDto.permissionIds) }
      });
      role.permissions = permissions;
    }

    Object.assign(role, {
      name: updateRoleDto.name ?? role.name,
      description: updateRoleDto.description ?? role.description,
      isActive: updateRoleDto.isActive ?? role.isActive,
    });

    return this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }
}
