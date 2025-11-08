import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoryService', () => {
  let service: CategoryService;
  let repository: Repository<Category>;

  const mockCategory: Category = {
    id: '1',
    code: 'CAT001',
    name: 'Electronics',
    description: 'Electronic products',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repository = module.get<Repository<Category>>(getRepositoryToken(Category));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createDto: CreateCategoryDto = {
        code: 'CAT001',
        name: 'Electronics',
        description: 'Electronic products',
        isActive: true,
      };

      mockCategoryRepository.create.mockReturnValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(mockCategory);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockCategory);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('should return paginated categories', async () => {
      const categories = [mockCategory];
      const total = 1;
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([categories, total]),
      };
      
      mockCategoryRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const paginationDto = { page: 1, limit: 10 };
      const result = await service.findAll(paginationDto);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('category');
      expect(result).toEqual({
        data: categories,
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single category', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow('Category with ID 999 not found');
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto: UpdateCategoryDto = {
        name: 'Updated Electronics',
      };

      const updatedCategory = { ...mockCategory, ...updateDto };
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.update('1', updateDto);

      expect(repository.save).toHaveBeenCalled();
      expect(result.name).toEqual(updateDto.name);
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockCategoryRepository.remove.mockResolvedValue(mockCategory);

      await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(mockCategory);
    });
  });
});
