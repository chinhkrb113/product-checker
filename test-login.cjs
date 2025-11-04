const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function testLogin() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    console.log('=== Kiểm tra bảng tabEmployee ===\n');

    // Lấy tất cả employees với status khác nhau
    const [allEmployees] = await pool.query(
      `SELECT name, employee_name, status, 
              CHAR_LENGTH(name) as name_length,
              HEX(name) as name_hex
       FROM tabEmployee 
       LIMIT 10`
    );
    
    console.log('10 Employee đầu tiên (tất cả status):');
    console.table(allEmployees);

    // Kiểm tra status values
    const [statusValues] = await pool.query(
      `SELECT DISTINCT status, COUNT(*) as count 
       FROM tabEmployee 
       GROUP BY status`
    );
    
    console.log('\nCác giá trị status trong bảng:');
    console.table(statusValues);

    // Test query với một username cụ thể
    if (allEmployees.length > 0) {
      const testUsername = allEmployees[0].name;
      console.log(`\n=== Test query với username: "${testUsername}" ===`);
      
      const [result1] = await pool.query(
        `SELECT name, employee_name, status 
         FROM tabEmployee 
         WHERE name = ?`,
        [testUsername]
      );
      console.log('Query không có điều kiện status:');
      console.table(result1);

      const [result2] = await pool.query(
        `SELECT name, employee_name, status 
         FROM tabEmployee 
         WHERE name = ? AND status = 'Active'`,
        [testUsername]
      );
      console.log('\nQuery với status = "Active":');
      console.table(result2);
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

testLogin();
