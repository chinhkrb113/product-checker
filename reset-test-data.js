/**
 * Script để reset dữ liệu test về trạng thái ban đầu
 * Chạy: node reset-test-data.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function resetTestData() {
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

    // Reset tất cả workflow fields
    console.log('🔄 Đang reset dữ liệu test...');
    
    const [result] = await connection.execute(
      `UPDATE tabItem 
      SET 
        first_check = 0,
        second_check = 0,
        check_result = NULL,
        checked_by = NULL,
        approved_by = NULL,
        check_date = NULL,
        approval_date = NULL,
        new_product_name = NULL,
        new_unit = NULL,
        new_price = NULL,
        stock = NULL,
        image_1 = NULL,
        image_2 = NULL,
        image_3 = NULL
      WHERE name LIKE 'TEST-PRODUCT-%'`
    );

    console.log(`✅ Đã reset ${result.affectedRows} sản phẩm test\n`);

    // Kiểm tra kết quả
    console.log('📊 Trạng thái sau khi reset:');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    
    const [rows] = await connection.execute(
      `SELECT 
        name as item_code,
        item_name,
        first_check,
        second_check,
        check_result
      FROM tabItem 
      WHERE name LIKE 'TEST-PRODUCT-%'
      ORDER BY name`
    );

    console.table(rows);

    console.log('\n✅ Hoàn thành! Tất cả sản phẩm test đã được reset về trạng thái ban đầu.');
    console.log('\n📱 Bây giờ bạn có thể test lại từ đầu.\n');

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
resetTestData();
