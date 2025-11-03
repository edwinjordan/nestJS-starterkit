import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Sale } from './sale.entity';
import { Item } from '../item/item.entity';

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Sale, sale => sale.items)
  @JoinColumn({ name: 'saleId' })
  sale: Sale;

  @Column()
  saleId: string;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @Column()
  itemId: string;

  @Column()
  itemName: string;

  @Column('decimal', { precision: 15, scale: 2 })
  price: number;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column('decimal', { precision: 15, scale: 2 })
  subtotal: number;
}
