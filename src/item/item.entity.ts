import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../category/category.entity';
import { Unit } from '../unit/unit.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => Unit, { nullable: true })
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @Column({ nullable: true })
  unitId: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  purchasePrice: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  sellingPrice: number;

  @Column('int', { default: 0 })
  stock: number;

  @Column('int', { default: 0 })
  minStock: number;

  @Column({ nullable: true })
  barcode: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
