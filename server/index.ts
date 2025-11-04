import express from 'express';
import cors from 'cors';
import pool from './db';
import { RowDataPacket } from 'mysql2';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Interface cho Item từ database
interface TabItem extends RowDataPacket {
  name: string;
  item_name: string;
  standard_rate: number;
  stock_uom: string;
  disabled: number;
  is_sales_item: number;
  
  // Double-check workflow fields
  first_check: number;
  second_check: number;
  checked_by: string | null;
  checked_at: string | null;
  check_result: string | null;
  new_product_name: string | null;
  new_unit: string | null;
  new_barcode: string | null;
  new_price: number | null;
  image_1: string | null;
  image_2: string | null;
  image_3: string | null;
  stock: number | null;
}

// Interface cho Employee
interface TabEmployee extends RowDataPacket {
  name: string;
  employee_name: string;
  status: string;
}

// Interface cho Barcode
interface TabItemBarcode extends RowDataPacket {
  barcode: string;
  parent: string;
}

// API: Verify username từ tabEmployee  
app.post('/api/login', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const trimmedUsername = username.trim();

    // Tìm employee theo name - không filter status trước
    const [employees] = await pool.query<TabEmployee[]>(
      `SELECT 
        name,
        employee_name,
        status
      FROM tabEmployee 
      WHERE name = ?
      LIMIT 1`,
      [trimmedUsername]
    );

    if (!employees || employees.length === 0) {
      return res.status(401).json({ error: 'Username không tồn tại' });
    }

    const employee = employees[0];
    
    // Check status - flexible comparison
    const status = employee.status?.trim().toLowerCase();
    if (status !== 'active') {
      return res.status(401).json({ 
        error: 'Tài khoản không hoạt động',
        status: employee.status 
      });
    }
    
    res.json({
      success: true,
      username: employee.name,
      employeeName: employee.employee_name || employee.name
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API: Lấy tất cả sản phẩm với pagination
app.get('/api/products', async (req, res) => {
  try {
    // Lấy pagination parameters từ query string
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Query lấy items từ tabItem với pagination
    const [items] = await pool.query<TabItem[]>(
      `SELECT 
        name as item_code,
        item_name,
        standard_rate,
        stock_uom,
        disabled,
        is_sales_item
      FROM tabItem 
      WHERE disabled = 0 
        AND is_sales_item = 1
        AND is_fixed_asset = 0
      ORDER BY item_name ASC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    if (!items || items.length === 0) {
      return res.json([]);
    }

    // Transform data sang format của frontend
    // Sử dụng item_code làm barcode vì bảng tabItem Barcode không tồn tại
    const products = items.map(item => {
      return {
        barcode: item.item_code, // Dùng item_code làm barcode
        name: item.item_name || item.item_code,
        price: item.standard_rate || 0,
        unit: item.stock_uom || 'cái',
        checked: false // Mặc định là chưa check
      };
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API: Lấy danh sách sản phẩm chưa check lần 1
app.get('/api/products/pending-first-check', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const [items] = await pool.query<TabItem[]>(
      `SELECT 
        name as item_code,
        item_name,
        standard_rate,
        stock_uom,
        first_check,
        second_check,
        checked_by,
        checked_at,
        stock
      FROM tabItem 
      WHERE disabled = 0 
        AND is_sales_item = 1
        AND is_fixed_asset = 0
        AND (first_check = 0 OR first_check IS NULL)
      ORDER BY item_name ASC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const products = items.map(item => ({
      barcode: item.item_code,
      name: item.item_name,
      price: item.standard_rate || 0,
      unit: item.stock_uom || 'cái',
      first_check: item.first_check || 0,
      second_check: item.second_check || 0,
      checked_by: item.checked_by,
      checked_at: item.checked_at,
      stock: item.stock
    }));

    res.json(products);
  } catch (error) {
    console.error('Error fetching pending first check products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API: Lấy danh sách sản phẩm đã first_check, chờ second_check
app.get('/api/products/pending-second-check', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const [items] = await pool.query<TabItem[]>(
      `SELECT 
        name as item_code,
        item_name,
        standard_rate,
        stock_uom,
        first_check,
        second_check,
        checked_by,
        checked_at,
        check_result,
        new_product_name,
        new_unit,
        new_barcode,
        new_price,
        stock,
        image_1,
        image_2,
        image_3
      FROM tabItem 
      WHERE disabled = 0 
        AND is_sales_item = 1
        AND is_fixed_asset = 0
        AND first_check = 1
        AND (second_check = 0 OR second_check IS NULL)
      ORDER BY checked_at DESC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const products = items.map(item => ({
      barcode: item.item_code,
      name: item.item_name,
      price: item.standard_rate || 0,
      unit: item.stock_uom || 'cái',
      first_check: item.first_check,
      second_check: item.second_check || 0,
      checked_by: item.checked_by,
      checked_at: item.checked_at,
      check_result: item.check_result,
      new_product_name: item.new_product_name,
      new_unit: item.new_unit,
      new_barcode: item.new_barcode,
      new_price: item.new_price,
      stock: item.stock,
      images: [item.image_1, item.image_2, item.image_3].filter(Boolean)
    }));

    res.json(products);
  } catch (error) {
    console.error('Error fetching pending second check products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API: Thống kê workflow
app.get('/api/check-workflow/stats', async (req, res) => {
  try {
    const [stats] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN (first_check = 0 OR first_check IS NULL) THEN 1 ELSE 0 END) as pending_first_check,
        SUM(CASE WHEN first_check = 1 AND (second_check = 0 OR second_check IS NULL) THEN 1 ELSE 0 END) as pending_second_check,
        SUM(CASE WHEN first_check = 1 AND second_check = 1 THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN check_result = 'correct' THEN 1 ELSE 0 END) as correct_count,
        SUM(CASE WHEN check_result = 'needs_correction' THEN 1 ELSE 0 END) as needs_correction_count,
        SUM(CASE WHEN check_result = 'incorrect' THEN 1 ELSE 0 END) as incorrect_count
      FROM tabItem 
      WHERE disabled = 0 
        AND is_sales_item = 1
        AND is_fixed_asset = 0`
    );

    if (!stats || stats.length === 0) {
      return res.json({
        total: 0,
        pending_first_check: 0,
        pending_second_check: 0,
        completed: 0,
        correct_count: 0,
        needs_correction_count: 0,
        incorrect_count: 0,
        progress_percentage: 0
      });
    }

    const stat = stats[0];
    const total = Number(stat.total) || 0;
    const pending_first_check = Number(stat.pending_first_check) || 0;
    const pending_second_check = Number(stat.pending_second_check) || 0;
    const completed = Number(stat.completed) || 0;

    res.json({
      total,
      pending_first_check,
      pending_second_check,
      completed,
      correct_count: Number(stat.correct_count) || 0,
      needs_correction_count: Number(stat.needs_correction_count) || 0,
      incorrect_count: Number(stat.incorrect_count) || 0,
      progress_percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    });
  } catch (error) {
    console.error('Error fetching workflow stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API: Lấy sản phẩm theo barcode
app.get('/api/products/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;

    // Tìm item theo item_code (vì đang dùng item_code làm barcode)
    const [items] = await pool.query<TabItem[]>(
      `SELECT 
        name as item_code,
        item_name,
        standard_rate,
        stock_uom,
        disabled,
        is_sales_item
      FROM tabItem 
      WHERE name = ? 
        AND disabled = 0 
        AND is_sales_item = 1
      LIMIT 1`,
      [barcode]
    );

    if (!items || items.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const item = items[0];

    const product = {
      barcode: item.item_code, // Dùng item_code làm barcode
      name: item.item_name || item.item_code,
      price: item.standard_rate || 0,
      unit: item.stock_uom || 'cái',
      checked: false
    };

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API: Tạo sản phẩm mới
app.post('/api/products', async (req, res) => {
  try {
    const { barcode, name, price, unit } = req.body;

    // Validate input
    if (!barcode || !name || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if item already exists
    const [existing] = await pool.query<TabItemBarcode[]>(
      `SELECT parent FROM \`tabItem Barcode\` WHERE barcode = ? LIMIT 1`,
      [barcode]
    );

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Product with this barcode already exists' });
    }

    // Note: Tạo item mới trong ERPNext/Frappe cần nhiều bước phức tạp
    // Tạm thời return success với mock data
    // Trong production, cần gọi Frappe API để tạo item đúng cách

    res.json({
      success: true,
      message: 'Product creation requires Frappe API integration',
      product: { barcode, name, price, unit, checked: true }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      error: 'Failed to create product',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API: Update sản phẩm
app.put('/api/products/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    const { name, price, unit, checked } = req.body;

    // Note: Update item trong ERPNext/Frappe cần gọi API
    // Tạm thời return success
    
    res.json({
      success: true,
      message: 'Product update requires Frappe API integration',
      product: { barcode, name, price, unit, checked }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      error: 'Failed to update product',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== DOUBLE-CHECK WORKFLOW APIs ====================

// API: First Check - Nhân viên A kiểm tra lần đầu
app.patch('/api/products/:barcode/first-check', async (req, res) => {
  try {
    const { barcode } = req.params;
    const {
      checked_by,
      check_result,
      new_product_name,
      new_unit,
      new_barcode,
      new_price,
      stock,
      image_1,
      image_2,
      image_3
    } = req.body;

    // Validate check_result
    const validResults = ['correct', 'needs_correction', 'incorrect'];
    if (check_result && !validResults.includes(check_result)) {
      return res.status(400).json({ 
        error: 'Invalid check_result',
        validValues: validResults 
      });
    }

    // Update item with first check
    const [result] = await pool.query(
      `UPDATE tabItem
       SET 
         first_check = 1,
         checked_by = ?,
         checked_at = NOW(),
         check_result = ?,
         new_product_name = ?,
         new_unit = ?,
         new_barcode = ?,
         new_price = ?,
         stock = ?,
         image_1 = ?,
         image_2 = ?,
         image_3 = ?
       WHERE name = ?`,
      [
        checked_by,
        check_result,
        new_product_name,
        new_unit,
        new_barcode,
        new_price,
        stock,
        image_1,
        image_2,
        image_3,
        barcode
      ]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'First check completed successfully',
      barcode,
      checked_by,
      checked_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in first check:', error);
    res.status(500).json({ 
      error: 'Failed to complete first check',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API: Second Check - Supervisor kiểm tra lần 2 và duyệt
app.patch('/api/products/:barcode/second-check', async (req, res) => {
  try {
    const { barcode } = req.params;
    const { checked_by, approved } = req.body;

    // Kiểm tra xem đã first_check chưa
    const [items] = await pool.query<TabItem[]>(
      'SELECT * FROM tabItem WHERE name = ? AND first_check = 1',
      [barcode]
    );

    if (!items || items.length === 0) {
      return res.status(400).json({ 
        error: 'First check not completed yet' 
      });
    }

    const item = items[0];

    // Nếu approved = true và có thay đổi, cập nhật vào fields chính
    if (approved && item.check_result === 'needs_correction') {
      const [updateResult] = await pool.query(
        `UPDATE tabItem
         SET 
           second_check = 1,
           item_name = COALESCE(new_product_name, item_name),
           stock_uom = COALESCE(new_unit, stock_uom),
           standard_rate = COALESCE(new_price, standard_rate)
         WHERE name = ?`,
        [barcode]
      );

      res.json({
        success: true,
        message: 'Second check approved - Changes applied',
        barcode,
        approved: true,
        changes_applied: true
      });
    } else if (approved) {
      // Chỉ đánh dấu second_check mà không thay đổi
      await pool.query(
        'UPDATE tabItem SET second_check = 1 WHERE name = ?',
        [barcode]
      );

      res.json({
        success: true,
        message: 'Second check approved - No changes needed',
        barcode,
        approved: true,
        changes_applied: false
      });
    } else {
      // Rejected - reset về pending
      await pool.query(
        `UPDATE tabItem 
         SET 
           first_check = 0,
           second_check = 0,
           check_result = 'rejected'
         WHERE name = ?`,
        [barcode]
      );

      res.json({
        success: true,
        message: 'Second check rejected - Reset to pending',
        barcode,
        approved: false
      });
    }
  } catch (error) {
    console.error('Error in second check:', error);
    res.status(500).json({ 
      error: 'Failed to complete second check',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   POST /api/login - Login with username`);
  console.log(`   GET  /api/products - Get all products`);
  console.log(`   GET  /api/products/:barcode - Get product by barcode`);
  console.log(`   POST /api/products - Create new product`);
  console.log(`   PUT  /api/products/:barcode - Update product`);
  console.log(`\n✅ DOUBLE-CHECK WORKFLOW APIs:`);
  console.log(`   PATCH /api/products/:barcode/first-check - First check`);
  console.log(`   PATCH /api/products/:barcode/second-check - Second check & approval`);
  console.log(`   GET   /api/products/pending-first-check - Products pending first check`);
  console.log(`   GET   /api/products/pending-second-check - Products pending second check`);
  console.log(`   GET   /api/check-workflow/stats - Workflow statistics`);
});

export default app;
