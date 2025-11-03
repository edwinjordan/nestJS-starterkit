import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { SaleService } from './sale.service';
import { Sale } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { ItemService } from '../item/item.service';
import { CreateSaleDto } from './dto/create-sale.dto';

describe('SaleService', () => {
  let service: SaleService;
  let saleRepository: Repository<Sale>;
  let itemService: ItemService;
  let dataSource: DataSource;

  const mockSale: Sale = {
    id: '1',
    invoiceNumber: 'INV-20241101-0001',
    saleDate: new Date('2024-11-01'),
    userId: 'user-1',
    branchId: 'branch-1',
    customerName: 'John Doe',
    customerPhone: '081234567890',
    subtotal: 7075000,
    discountPercent: 5,
    discountAmount: 353750,
    taxPercent: 11,
    taxAmount: 739537.5,
    total: 7460787.5,
    paid: 7500000,
    change: 39212.5,
    paymentMethod: 'cash',
    notes: 'Test sale',
    items: [],
    user: {} as any,
    branch: {} as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockItem = {
    id: 'item-1',
    code: 'ITM001',
    name: 'Laptop Dell',
    stock: 10,
    sellingPrice: 7000000,
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockSaleRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockSaleItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockItemService = {
    findOne: jest.fn(),
    updateStock: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaleService,
        {
          provide: getRepositoryToken(Sale),
          useValue: mockSaleRepository,
        },
        {
          provide: getRepositoryToken(SaleItem),
          useValue: mockSaleItemRepository,
        },
        {
          provide: ItemService,
          useValue: mockItemService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<SaleService>(SaleService);
    saleRepository = module.get<Repository<Sale>>(getRepositoryToken(Sale));
    itemService = module.get<ItemService>(ItemService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new sale transaction', async () => {
      const createDto: CreateSaleDto = {
        saleDate: new Date('2024-11-01'),
        branchId: 'branch-1',
        customerName: 'John Doe',
        customerPhone: '081234567890',
        subtotal: 7000000,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: 11,
        taxAmount: 770000,
        total: 7770000,
        paid: 8000000,
        change: 230000,
        paymentMethod: 'cash',
        notes: 'Test sale',
        items: [
          {
            itemId: 'item-1',
            itemName: 'Laptop Dell',
            price: 7000000,
            quantity: 1,
            discountPercent: 0,
            discountAmount: 0,
            subtotal: 7000000,
          },
        ],
      };

      mockItemService.findOne.mockResolvedValue(mockItem);
      mockQueryRunner.manager.count.mockResolvedValue(0);
      mockQueryRunner.manager.save
        .mockResolvedValueOnce(mockSale)
        .mockResolvedValue({});
      mockSaleItemRepository.create.mockReturnValue({});
      mockItemService.updateStock.mockResolvedValue(mockItem);
      mockSaleRepository.findOne.mockResolvedValue(mockSale);

      const result = await service.create(createDto, 'user-1');

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error if item stock insufficient', async () => {
      const createDto: CreateSaleDto = {
        saleDate: new Date('2024-11-01'),
        branchId: 'branch-1',
        customerName: 'John Doe',
        customerPhone: '081234567890',
        subtotal: 7000000,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: 11,
        taxAmount: 770000,
        total: 7770000,
        paid: 8000000,
        change: 230000,
        paymentMethod: 'cash',
        items: [
          {
            itemId: 'item-1',
            itemName: 'Laptop Dell',
            price: 7000000,
            quantity: 20, // More than stock
            discountPercent: 0,
            discountAmount: 0,
            subtotal: 140000000,
          },
        ],
      };

      mockItemService.findOne.mockResolvedValue(mockItem);

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw error if item not found', async () => {
      const createDto: CreateSaleDto = {
        saleDate: new Date('2024-11-01'),
        branchId: 'branch-1',
        customerName: 'John Doe',
        customerPhone: '081234567890',
        subtotal: 7000000,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: 11,
        taxAmount: 770000,
        total: 7770000,
        paid: 8000000,
        change: 230000,
        paymentMethod: 'cash',
        items: [
          {
            itemId: 'invalid-item',
            itemName: 'Invalid Item',
            price: 7000000,
            quantity: 1,
            discountPercent: 0,
            discountAmount: 0,
            subtotal: 7000000,
          },
        ],
      };

      mockItemService.findOne.mockRejectedValue(new BadRequestException('Item with ID invalid-item not found'));

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of sales', async () => {
      const sales = [mockSale];
      mockSaleRepository.find.mockResolvedValue(sales);

      const result = await service.findAll();

      expect(saleRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'branch', 'items', 'items.item'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(sales);
    });
  });

  describe('findOne', () => {
    it('should return a single sale', async () => {
      mockSaleRepository.findOne.mockResolvedValue(mockSale);

      const result = await service.findOne('1');

      expect(saleRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['user', 'branch', 'items', 'items.item'],
      });
      expect(result).toEqual(mockSale);
    });
  });

  describe('findByInvoiceNumber', () => {
    it('should return sale by invoice number', async () => {
      mockSaleRepository.findOne.mockResolvedValue(mockSale);

      const result = await service.findByInvoiceNumber('INV-20241101-0001');

      expect(saleRepository.findOne).toHaveBeenCalledWith({
        where: { invoiceNumber: 'INV-20241101-0001' },
        relations: ['user', 'branch', 'items', 'items.item'],
      });
      expect(result).toEqual(mockSale);
    });
  });

  describe('getSalesReport', () => {
    it('should return sales report for date range', async () => {
      const sales = [mockSale];
      mockSaleRepository.find.mockResolvedValue(sales);

      const result = await service.getSalesReport(
        new Date('2024-11-01'),
        new Date('2024-11-30'),
      );

      expect(result).toBeDefined();
      expect(result.totalSales).toBe(1);
      expect(result.totalRevenue).toBeGreaterThan(0);
    });
  });
});
