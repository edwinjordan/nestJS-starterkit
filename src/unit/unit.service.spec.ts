import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitService } from './unit.service';
import { Unit } from './unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

describe('UnitService', () => {
  let service: UnitService;
  let repository: Repository<Unit>;

  const mockUnit: Unit = {
    id: '1',
    code: 'PCS',
    name: 'Pieces',
    description: 'Unit for countable items',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUnitRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitService,
        {
          provide: getRepositoryToken(Unit),
          useValue: mockUnitRepository,
        },
      ],
    }).compile();

    service = module.get<UnitService>(UnitService);
    repository = module.get<Repository<Unit>>(getRepositoryToken(Unit));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new unit', async () => {
      const createDto: CreateUnitDto = {
        code: 'PCS',
        name: 'Pieces',
        description: 'Unit for countable items',
        isActive: true,
      };

      mockUnitRepository.create.mockReturnValue(mockUnit);
      mockUnitRepository.save.mockResolvedValue(mockUnit);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockUnit);
      expect(result).toEqual(mockUnit);
    });
  });

  describe('findAll', () => {
    it('should return an array of units', async () => {
      const units = [mockUnit];
      mockUnitRepository.find.mockResolvedValue(units);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(units);
    });
  });

  describe('findOne', () => {
    it('should return a single unit', async () => {
      mockUnitRepository.findOne.mockResolvedValue(mockUnit);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockUnit);
    });

    it('should throw NotFoundException if unit not found', async () => {
      mockUnitRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow('Unit with ID 999 not found');
    });
  });

  describe('update', () => {
    it('should update a unit', async () => {
      const updateDto: UpdateUnitDto = {
        name: 'Updated Pieces',
      };

      const updatedUnit = { ...mockUnit, ...updateDto };
      mockUnitRepository.findOne.mockResolvedValue(mockUnit);
      mockUnitRepository.save.mockResolvedValue(updatedUnit);

      const result = await service.update('1', updateDto);

      expect(repository.save).toHaveBeenCalled();
      expect(result.name).toEqual(updateDto.name);
    });
  });

  describe('remove', () => {
    it('should delete a unit', async () => {
      mockUnitRepository.findOne.mockResolvedValue(mockUnit);
      mockUnitRepository.remove.mockResolvedValue(mockUnit);

      await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(mockUnit);
    });
  });
});
