import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { Sale } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ItemService } from '../item/item.service';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
    private itemService: ItemService,
    private dataSource: DataSource,
  ) {}

  async create(createSaleDto: CreateSaleDto, userId: string): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();

      // Validate stock for all items
      for (const item of createSaleDto.items) {
        const product = await this.itemService.findOne(item.itemId);
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for item ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`,
          );
        }
      }

      // Create sale
      const sale = this.saleRepository.create({
        invoiceNumber,
        saleDate: createSaleDto.saleDate || new Date(),
        userId,
        branchId: createSaleDto.branchId,
        customerName: createSaleDto.customerName,
        customerPhone: createSaleDto.customerPhone,
        subtotal: createSaleDto.subtotal,
        discountPercent: createSaleDto.discountPercent || 0,
        discountAmount: createSaleDto.discountAmount || 0,
        taxPercent: createSaleDto.taxPercent || 0,
        taxAmount: createSaleDto.taxAmount || 0,
        total: createSaleDto.total,
        paid: createSaleDto.paid,
        change: createSaleDto.change || 0,
        paymentMethod: createSaleDto.paymentMethod || 'cash',
        notes: createSaleDto.notes,
      });

      const savedSale = await queryRunner.manager.save(sale);

      // Create sale items and update stock
      for (const itemDto of createSaleDto.items) {
        const saleItem = this.saleItemRepository.create({
          saleId: savedSale.id,
          itemId: itemDto.itemId,
          itemName: itemDto.itemName,
          price: itemDto.price,
          quantity: itemDto.quantity,
          discountPercent: itemDto.discountPercent || 0,
          discountAmount: itemDto.discountAmount || 0,
          subtotal: itemDto.subtotal,
        });

        await queryRunner.manager.save(saleItem);

        // Update stock
        await this.itemService.updateStock(itemDto.itemId, -itemDto.quantity);
      }

      await queryRunner.commitTransaction();

      return this.findOne(savedSale.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Sale[]> {
    return this.saleRepository.find({
      relations: ['user', 'branch', 'items', 'items.item'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['user', 'branch', 'items', 'items.item'],
    });
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
    return sale;
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    return this.saleRepository.find({
      where: {
        saleDate: Between(startDate, endDate),
      },
      relations: ['user', 'branch', 'items', 'items.item'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { invoiceNumber },
      relations: ['user', 'branch', 'items', 'items.item'],
    });
    if (!sale) {
      throw new NotFoundException(`Sale with invoice number ${invoiceNumber} not found`);
    }
    return sale;
  }

  async getSalesReport(startDate: Date, endDate: Date) {
    const sales = await this.findByDateRange(startDate, endDate);
    
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const totalDiscount = sales.reduce((sum, sale) => sum + Number(sale.discountAmount), 0);
    const totalTax = sales.reduce((sum, sale) => sum + Number(sale.taxAmount), 0);

    return {
      startDate,
      endDate,
      totalSales,
      totalRevenue,
      totalDiscount,
      totalTax,
      sales,
    };
  }

  private async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const prefix = `INV-${year}${month}${day}`;
    
    const lastSale = await this.saleRepository.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    });

    let sequence = 1;
    if (lastSale && lastSale.invoiceNumber.startsWith(prefix)) {
      const lastSequence = parseInt(lastSale.invoiceNumber.split('-')[1]);
      sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }
}
