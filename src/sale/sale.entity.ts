import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { Branch } from '../branch/branch.entity';
import { SaleItem } from './sale-item.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoiceNumber: string;

  @Column({ type: 'date' })
  saleDate: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ nullable: true })
  branchId: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  customerPhone: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  taxPercent: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  total: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  paid: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  change: number;

  @Column({ default: 'cash' })
  paymentMethod: string;

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => SaleItem, saleItem => saleItem.sale, { cascade: true, eager: true })
  items: SaleItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
