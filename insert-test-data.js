/**
 * Script để insert 5 dữ liệu mẫu vào bảng tabItem
 * Chạy: node insert-test-data.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const testProducts = [
  {
    name: 'TEST-PRODUCT-001',
    item_code: 'TEST-PRODUCT-001',
    item_name: 'Nước ngọt Coca Cola 330ml',
    standard_rate: 12000.00,
    stock_uom: 'Lon'
  },
  {
    name: 'TEST-PRODUCT-002',
    item_code: 'TEST-PRODUCT-002',
    item_name: 'Bánh mì sandwich 60g',
    standard_rate: 8500.00,
    stock_uom: 'Cái'
  },
  {
    name: 'TEST-PRODUCT-003',
    item_code: 'TEST-PRODUCT-003',
    item_name: 'Sữa tươi Vinamilk hộp 1L',
    standard_rate: 35000.00,
    stock_uom: 'Hộp'
  },
  {
    name: 'TEST-PRODUCT-004',
    item_code: 'TEST-PRODUCT-004',
    item_name: 'Mì gói Hảo Hảo tôm chua cay',
    standard_rate: 3500.00,
    stock_uom: 'Gói'
  },
  {
    name: 'TEST-PRODUCT-005',
    item_code: 'TEST-PRODUCT-005',
    item_name: 'Nước suối Lavie 500ml',
    standard_rate: 5000.00,
    stock_uom: 'Chai'
  }
];

async function insertTestData() {
  let connection;
  
  try {
    console.log('🔌 Đang kết nối database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    console.log('✅ Kết nối database thành công!\n');

    // Insert từng sản phẩm
    for (const product of testProducts) {
      try {
        const [result] = await connection.execute(
          `INSERT INTO tabItem (
            name, 
            item_code, 
            item_name, 
            standard_rate, 
            stock_uom, 
            disabled, 
            is_sales_item, 
            is_fixed_asset, 
            is_stock_item,
            creation, 
            modified, 
            owner, 
            modified_by, 
            docstatus, 
            idx,
            first_check,
            second_check
          ) VALUES (?, ?, ?, ?, ?, 0, 1, 0, 1, NOW(), NOW(), 'Administrator', 'Administrator', 0, 0, 0, 0)
          ON DUPLICATE KEY UPDATE 
            item_name = VALUES(item_name),
            standard_rate = VALUES(standard_rate),
            stock_uom = VALUES(stock_uom),
            modified = NOW()`,
          [
            product.name,
            product.item_code,
            product.item_name,
            product.standard_rate,
            product.stock_uom
          ]
        );

        console.log(`✅ ${product.item_code}: ${product.item_name} - ${product.standard_rate.toLocaleString('vi-VN')}đ`);
      } catch (error) {
        console.error(`❌ Lỗi khi insert ${product.item_code}:`, error.message);
      }
    }

    console.log('\n📊 Kiểm tra dữ liệu đã insert:');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    
    const [rows] = await connection.execute(
      `SELECT 
        name as item_code,
        item_name,
        standard_rate as price,
        stock_uom as unit,
        first_check,
        second_check
      FROM tabItem 
      WHERE name LIKE 'TEST-PRODUCT-%'
      ORDER BY name`
    );

    console.table(rows);

    console.log('\n✅ Hoàn thành! Đã tạo', rows.length, 'sản phẩm mẫu.');
    console.log('\n📱 Bây giờ bạn có thể:');
    console.log('  1. Đăng nhập hệ thống');
    console.log('  2. Quét barcode: TEST-PRODUCT-001 đến TEST-PRODUCT-005');
    console.log('  3. Test workflow double-check\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Đã đóng kết nối database.');
    }
  }
}

// Run script
insertTestData();
