import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemService } from './item.service';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

describe('ItemService', () => {
  let service: ItemService;
  let repository: Repository<Item>;

  const mockItem: Item = {
    id: '1',
    code: 'ITM001',
    name: 'Laptop Dell',
    description: 'Dell Inspiron 15',
    categoryId: 'cat-1',
    unitId: 'unit-1',
    purchasePrice: 6000000,
    sellingPrice: 7000000,
    stock: 10,
    minStock: 5,
    barcode: '1234567890001',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {} as any,
    unit: {} as any,
  };

  const mockItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemService,
        {
          provide: getRepositoryToken(Item),
          useValue: mockItemRepository,
        },
      ],
    }).compile();

    service = module.get<ItemService>(ItemService);
    repository = module.get<Repository<Item>>(getRepositoryToken(Item));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new item', async () => {
      const createDto: CreateItemDto = {
        code: 'ITM001',
        name: 'Laptop Dell',
        description: 'Dell Inspiron 15',
        categoryId: 'cat-1',
        unitId: 'unit-1',
        purchasePrice: 6000000,
        sellingPrice: 7000000,
        stock: 10,
        minStock: 5,
        barcode: '1234567890001',
        isActive: true,
      };

      mockItemRepository.create.mockReturnValue(mockItem);
      mockItemRepository.save.mockResolvedValue(mockItem);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockItem);
      expect(result).toEqual(mockItem);
    });
  });

  describe('findAll', () => {
    it('should return an array of items with relations', async () => {
      const items = [mockItem];
      mockItemRepository.find.mockResolvedValue(items);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        relations: ['category', 'unit'],
      });
      expect(result).toEqual(items);
    });
  });

  describe('findOne', () => {
    it('should return a single item with relations', async () => {
      mockItemRepository.findOne.mockResolvedValue(mockItem);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['category', 'unit'],
      });
      expect(result).toEqual(mockItem);
    });

    it('should throw NotFoundException if item not found', async () => {
      mockItemRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow('Item with ID 999 not found');
    });
  });

  describe('findByBarcode', () => {
    it('should return an item by barcode', async () => {
      mockItemRepository.findOne.mockResolvedValue(mockItem);

      const result = await service.findByBarcode('1234567890001');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { barcode: '1234567890001' },
        relations: ['category', 'unit'],
      });
      expect(result).toEqual(mockItem);
    });
  });

  describe('update', () => {
    it('should update an item', async () => {
      const updateDto: UpdateItemDto = {
        name: 'Updated Laptop',
        stock: 15,
      };

      const updatedItem = { ...mockItem, ...updateDto };
      mockItemRepository.findOne.mockResolvedValue(mockItem);
      mockItemRepository.save.mockResolvedValue(updatedItem);

      const result = await service.update('1', updateDto);

      expect(repository.save).toHaveBeenCalled();
      expect(result.name).toEqual(updateDto.name);
      expect(result.stock).toEqual(updateDto.stock);
    });
  });

  describe('updateStock', () => {
    it('should update item stock', async () => {
      const updatedItem = { ...mockItem, stock: 5 };
      mockItemRepository.findOne.mockResolvedValue(mockItem);
      mockItemRepository.save.mockResolvedValue(updatedItem);

      const result = await service.updateStock('1', 5);

      expect(repository.save).toHaveBeenCalled();
      expect(result.stock).toEqual(5);
    });
  });

  describe('remove', () => {
    it('should delete an item', async () => {
      mockItemRepository.findOne.mockResolvedValue(mockItem);
      mockItemRepository.remove.mockResolvedValue(mockItem);

      await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(mockItem);
    });
  });
});
