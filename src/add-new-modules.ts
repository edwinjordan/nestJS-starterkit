import { DataSource } from 'typeorm';
import typeormConfig from './config/typeorm.config';

async function addNewPermissions() {
  const dataSource = await typeormConfig.initialize();

  try {
    console.log('Adding new permissions...');

    const permissionRepo = dataSource.getRepository('Permission');
    
    // Check and add new permissions
    const newPermissions = [
      { name: 'category.create', description: 'Create categories', module: 'category' },
      { name: 'category.read', description: 'Read categories', module: 'category' },
      { name: 'category.update', description: 'Update categories', module: 'category' },
      { name: 'category.delete', description: 'Delete categories', module: 'category' },
      { name: 'unit.create', description: 'Create units', module: 'unit' },
      { name: 'unit.read', description: 'Read units', module: 'unit' },
      { name: 'unit.update', description: 'Update units', module: 'unit' },
      { name: 'unit.delete', description: 'Delete units', module: 'unit' },
      { name: 'item.create', description: 'Create items', module: 'item' },
      { name: 'item.read', description: 'Read items', module: 'item' },
      { name: 'item.update', description: 'Update items', module: 'item' },
      { name: 'item.delete', description: 'Delete items', module: 'item' },
      { name: 'sale.create', description: 'Create sales', module: 'sale' },
      { name: 'sale.read', description: 'Read sales', module: 'sale' },
    ];

    for (const perm of newPermissions) {
      const existing = await permissionRepo.findOne({ where: { name: perm.name } });
      if (!existing) {
        await permissionRepo.save(perm);
        console.log(`✓ Added permission: ${perm.name}`);
      } else {
        console.log(`- Permission exists: ${perm.name}`);
      }
    }

    // Update admin role with new permissions
    const roleRepo = dataSource.getRepository('Role');
    const adminRole = await roleRepo.findOne({
      where: { name: 'Admin' },
      relations: ['permissions'],
    });

    if (adminRole) {
      const allPermissions = await permissionRepo.find();
      adminRole.permissions = allPermissions;
      await roleRepo.save(adminRole);
      console.log('\n✓ Admin role updated with all permissions');
    }

    // Create sample data
    const categoryRepo = dataSource.getRepository('Category');
    const unitRepo = dataSource.getRepository('Unit');
    const itemRepo = dataSource.getRepository('Item');

    // Categories
    let electronics = await categoryRepo.findOne({ where: { code: 'CAT001' } });
    if (!electronics) {
      electronics = await categoryRepo.save({
        code: 'CAT001',
        name: 'Electronics',
        description: 'Electronic items',
      });
      console.log('✓ Category created: Electronics');
    }

    let food = await categoryRepo.findOne({ where: { code: 'CAT002' } });
    if (!food) {
      food = await categoryRepo.save({
        code: 'CAT002',
        name: 'Food & Beverage',
        description: 'Food and beverage products',
      });
      console.log('✓ Category created: Food & Beverage');
    }

    // Units
    let pcs = await unitRepo.findOne({ where: { code: 'PCS' } });
    if (!pcs) {
      pcs = await unitRepo.save({
        code: 'PCS',
        name: 'Pieces',
        description: 'Per piece',
      });
      console.log('✓ Unit created: Pieces');
    }

    let kg = await unitRepo.findOne({ where: { code: 'KG' } });
    if (!kg) {
      kg = await unitRepo.save({
        code: 'KG',
        name: 'Kilogram',
        description: 'Per kilogram',
      });
      console.log('✓ Unit created: Kilogram');
    }

    // Items
    const item1 = await itemRepo.findOne({ where: { code: 'ITM001' } });
    if (!item1) {
      await itemRepo.save({
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
      });
      console.log('✓ Item created: Laptop Dell');
    }

    const item2 = await itemRepo.findOne({ where: { code: 'ITM002' } });
    if (!item2) {
      await itemRepo.save({
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
      });
      console.log('✓ Item created: Mouse Wireless');
    }

    const item3 = await itemRepo.findOne({ where: { code: 'ITM003' } });
    if (!item3) {
      await itemRepo.save({
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
      });
      console.log('✓ Item created: Coffee Arabica');
    }

    console.log('\n=== Setup completed successfully ===');
    console.log('\nNew modules are ready:');
    console.log('- Categories (Kategori)');
    console.log('- Units (Satuan)');
    console.log('- Items (Barang)');
    console.log('- Sales (Penjualan Kasir)');
    console.log('\nLogin with: admin@example.com / admin123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

addNewPermissions();
