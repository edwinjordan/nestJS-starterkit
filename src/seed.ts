import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import typeormConfig from './config/typeorm.config';

async function seed() {
  const dataSource = await typeormConfig.initialize();

  try {
    console.log('Starting seed...');

    // Create permissions
    const permissionRepo = dataSource.getRepository('Permission');
    const permissions = await permissionRepo.save([
      // Role permissions
      { name: 'role.create', description: 'Create roles', module: 'role' },
      { name: 'role.read', description: 'Read roles', module: 'role' },
      { name: 'role.update', description: 'Update roles', module: 'role' },
      { name: 'role.delete', description: 'Delete roles', module: 'role' },
      
      // Permission permissions
      { name: 'permission.create', description: 'Create permissions', module: 'permission' },
      { name: 'permission.read', description: 'Read permissions', module: 'permission' },
      { name: 'permission.update', description: 'Update permissions', module: 'permission' },
      { name: 'permission.delete', description: 'Delete permissions', module: 'permission' },
      
      // Branch permissions
      { name: 'branch.create', description: 'Create branches', module: 'branch' },
      { name: 'branch.read', description: 'Read branches', module: 'branch' },
      { name: 'branch.update', description: 'Update branches', module: 'branch' },
      { name: 'branch.delete', description: 'Delete branches', module: 'branch' },
      
      // Employee permissions
      { name: 'employee.create', description: 'Create employees', module: 'employee' },
      { name: 'employee.read', description: 'Read employees', module: 'employee' },
      { name: 'employee.update', description: 'Update employees', module: 'employee' },
      { name: 'employee.delete', description: 'Delete employees', module: 'employee' },
      
      // User permissions
      { name: 'user.create', description: 'Create users', module: 'user' },
      { name: 'user.read', description: 'Read users', module: 'user' },
      { name: 'user.update', description: 'Update users', module: 'user' },
      { name: 'user.delete', description: 'Delete users', module: 'user' },

      // Category permissions
      { name: 'category.create', description: 'Create categories', module: 'category' },
      { name: 'category.read', description: 'Read categories', module: 'category' },
      { name: 'category.update', description: 'Update categories', module: 'category' },
      { name: 'category.delete', description: 'Delete categories', module: 'category' },

      // Unit permissions
      { name: 'unit.create', description: 'Create units', module: 'unit' },
      { name: 'unit.read', description: 'Read units', module: 'unit' },
      { name: 'unit.update', description: 'Update units', module: 'unit' },
      { name: 'unit.delete', description: 'Delete units', module: 'unit' },

      // Item permissions
      { name: 'item.create', description: 'Create items', module: 'item' },
      { name: 'item.read', description: 'Read items', module: 'item' },
      { name: 'item.update', description: 'Update items', module: 'item' },
      { name: 'item.delete', description: 'Delete items', module: 'item' },

      // Sale permissions
      { name: 'sale.create', description: 'Create sales', module: 'sale' },
      { name: 'sale.read', description: 'Read sales', module: 'sale' },
    ]);

    console.log('Permissions created:', permissions.length);

    // Create roles
    const roleRepo = dataSource.getRepository('Role');
    const adminRole = await roleRepo.save({
      name: 'Admin',
      description: 'Administrator with full access',
      permissions: permissions,
    });

    const userRole = await roleRepo.save({
      name: 'User',
      description: 'Regular user with limited access',
      permissions: permissions.filter(p => p.name.includes('.read')),
    });

    console.log('Roles created: Admin, User');

    // Create branch
    const branchRepo = dataSource.getRepository('Branch');
    const branch = await branchRepo.save({
      code: 'HQ001',
      name: 'Head Quarter',
      address: 'Jl. Sudirman No. 123, Jakarta',
      phone: '021-12345678',
      email: 'hq@company.com',
    });

    console.log('Branch created:', branch.name);

    // Create admin user
    const userRepo = dataSource.getRepository('User');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await userRepo.save({
      email: 'admin@example.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      phone: '081234567890',
      branch: branch,
      roles: [adminRole],
    });

    console.log('Admin user created:', adminUser.email);
    console.log('Password: admin123');

    // Create sample employee
    const employeeRepo = dataSource.getRepository('Employee');
    await employeeRepo.save({
      employeeCode: 'EMP001',
      fullName: 'John Doe',
      email: 'john@company.com',
      phone: '081234567891',
      address: 'Jl. Example No. 456',
      position: 'Manager',
      department: 'IT',
      hireDate: new Date('2024-01-01'),
      branch: branch,
    });

    console.log('Sample employee created');

    // Create categories
    const categoryRepo = dataSource.getRepository('Category');
    const electronics = await categoryRepo.save({
      code: 'CAT001',
      name: 'Electronics',
      description: 'Electronic items',
    });

    const food = await categoryRepo.save({
      code: 'CAT002',
      name: 'Food & Beverage',
      description: 'Food and beverage products',
    });

    console.log('Categories created');

    // Create units
    const unitRepo = dataSource.getRepository('Unit');
    const pcs = await unitRepo.save({
      code: 'PCS',
      name: 'Pieces',
      description: 'Per piece',
    });

    const kg = await unitRepo.save({
      code: 'KG',
      name: 'Kilogram',
      description: 'Per kilogram',
    });

    console.log('Units created');

    // Create items
    const itemRepo = dataSource.getRepository('Item');
    await itemRepo.save([
      {
        code: 'ITM001',
        name: 'Laptop Dell',
        description: 'Dell Laptop 14 inch',
        categoryId: electronics.id,
        unitId: pcs.id,
        purchasePrice: 5000000,
        sellingPrice: 7000000,
        stock: 10,
        minStock: 2,
        barcode: '1234567890001',
      },
      {
        code: 'ITM002',
        name: 'Mouse Wireless',
        description: 'Wireless Mouse',
        categoryId: electronics.id,
        unitId: pcs.id,
        purchasePrice: 50000,
        sellingPrice: 75000,
        stock: 50,
        minStock: 10,
        barcode: '1234567890002',
      },
      {
        code: 'ITM003',
        name: 'Coffee Arabica',
        description: 'Premium Arabica Coffee',
        categoryId: food.id,
        unitId: kg.id,
        purchasePrice: 100000,
        sellingPrice: 150000,
        stock: 20,
        minStock: 5,
        barcode: '1234567890003',
      },
    ]);

    console.log('Sample items created');
    
    console.log('\n=== Seed completed successfully ===');
    console.log('\nLogin credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();
