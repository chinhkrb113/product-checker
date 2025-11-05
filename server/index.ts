import express from 'express';
import cors from 'cors';
import pool from './db';
import { RowDataPacket } from 'mysql2';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Tạo thư mục image_upload nếu chưa tồn tại
const UPLOAD_DIR = path.join(__dirname, '..', 'image_upload');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files từ thư mục image_upload
app.use('/uploads', express.static(UPLOAD_DIR));

// Interface cho Item từ database
interface TabItem extends RowDataPacket {
  name: string;
  item_name: string;
  standard_rate: number;
  stock_uom: string;
  disabled: number;
  is_sales_item: number;
  owner: string | null;
  item_group: string | null;
  
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

// Helper function: Lưu base64 image thành file và trả về đường dẫn
function saveBase64Image(base64Data: string | null | undefined): string | null {
  if (!base64Data || base64Data.trim() === '') {
    return null;
  }

  try {
    // Nếu đã là đường dẫn (bắt đầu bằng /uploads/), giữ nguyên
    if (base64Data.startsWith('/uploads/')) {
      return base64Data;
    }

    // Xử lý base64 string
    const matches = base64Data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches) {
      console.error('Invalid base64 format');
      return null;
    }

    const imageType = matches[1]; // jpeg, png, etc.
    const imageBuffer = Buffer.from(matches[2], 'base64');
    
    // Tạo tên file unique bằng timestamp + random string
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${imageType}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    
    // Lưu file
    fs.writeFileSync(filePath, imageBuffer);
    
    // Trả về đường dẫn tương đối (để lưu vào DB)
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error saving image:', error);
    return null;
  }
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

    // Query đếm tổng số items
    const [countResult] = await pool.query<any[]>(
      `SELECT COUNT(*) as total
      FROM tabItem 
      WHERE disabled = 0 
        AND is_sales_item = 1
        AND is_fixed_asset = 0`
    );
    const total = countResult[0]?.total || 0;

    // Query lấy items từ tabItem với pagination
    const [items] = await pool.query<TabItem[]>(
      `SELECT 
        name as item_code,
        item_name,
        standard_rate,
        stock_uom,
        disabled,
        is_sales_item,
        item_group,
        stock,
        first_check,
        second_check
      FROM tabItem 
      WHERE disabled = 0 
        AND is_sales_item = 1
        AND is_fixed_asset = 0
      ORDER BY item_name ASC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    if (!items || items.length === 0) {
      return res.json({ data: [], total: 0 });
    }

    // Transform data sang format của frontend
    // Sử dụng item_code làm barcode vì bảng tabItem Barcode không tồn tại
    const products = items.map(item => {
      return {
        barcode: item.item_code, // Dùng item_code làm barcode
        name: item.item_name || item.item_code,
        price: item.standard_rate || 0,
        unit: item.stock_uom || 'cái',
        item_group: item.item_group,
        stock: item.stock,
        checked: item.first_check === 1 && item.second_check === 1,
        first_check: item.first_check || 0,
        second_check: item.second_check || 0
      };
    });

    res.json({ data: products, total });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API: Lấy sản phẩm theo status filter
app.get('/api/products/filter', async (req, res) => {
  try {
    const status = req.query.status as string;
    const searchTerm = (req.query.q as string) || '';
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    let statusCondition = '';
    
    // Xác định điều kiện filter theo status
    if (status === 'unchecked') {
      statusCondition = 'AND (first_check = 0 OR first_check IS NULL)';
    } else if (status === 'first-checked') {
      statusCondition = 'AND first_check = 1 AND (second_check = 0 OR second_check IS NULL)';
    } else if (status === 'completed') {
      statusCondition = 'AND first_check = 1 AND second_check = 1';
    }

    // Điều kiện search (nếu có)
    let searchCondition = '';
    const queryParams: any[] = [];
    
    if (searchTerm.trim()) {
      const searchPattern = `%${searchTerm}%`;
      searchCondition = 'AND (item_name LIKE ? OR name LIKE ?)';
      queryParams.push(searchPattern, searchPattern);
    }

    // Đếm tổng số sản phẩm
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tabItem 
      WHERE disabled = 0 
        AND is_sales_item = 1
        AND is_fixed_asset = 0
        ${statusCondition}
        ${searchCondition}
    `;
    
    const [countResult] = await pool.query<any[]>(countQuery, queryParams);
    const total = countResult[0]?.total || 0;

    // Lấy danh sách sản phẩm
    const selectQuery = `
      SELECT 
        name as item_code,
        item_name,
        standard_rate,
        stock_uom,
        item_group,
        stock,
        first_check,
        second_check
      FROM tabItem 
      WHERE disabled = 0 
        AND is_sales_item = 1
        AND is_fixed_asset = 0
        ${statusCondition}
        ${searchCondition}
      ORDER BY item_name ASC
      LIMIT ? OFFSET ?
    `;
    
    const [items] = await pool.query<TabItem[]>(
      selectQuery, 
      [...queryParams, limit, offset]
    );

    const products = items.map(item => ({
      barcode: item.item_code,
      name: item.item_name || item.item_code,
      price: item.standard_rate || 0,
      unit: item.stock_uom || 'cái',
      item_group: item.item_group,
      stock: item.stock,
      checked: item.first_check === 1 && item.second_check === 1,
      first_check: item.first_check || 0,
      second_check: item.second_check || 0
    }));

    res.json({ data: products, total });
  } catch (error) {
    console.error('Error filtering products:', error);
    res.status(500).json({ 
      error: 'Failed to filter products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API: Tìm kiếm sản phẩm theo tên hoặc barcode
app.get('/api/products/search', async (req, res) => {
  try {
    const searchTerm = (req.query.q as string) || '';
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!searchTerm.trim()) {
      // Nếu không có search term, đếm tổng và trả về danh sách bình thường
      const [countResult] = await pool.query<any[]>(
        `SELECT COUNT(*) as total
        FROM tabItem 
        WHERE disabled = 0 
          AND is_sales_item = 1
          AND is_fixed_asset = 0`
      );
      const total = countResult[0]?.total || 0;

      const [items] = await pool.query<TabItem[]>(
        `SELECT 
          name as item_code,
          item_name,
          standard_rate,
          stock_uom,
          item_group,
          stock,
          first_check,
          second_check
        FROM tabItem 
        WHERE disabled = 0 
          AND is_sales_item = 1
          AND is_fixed_asset = 0
        ORDER BY item_name ASC
        LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      const products = items.map(item => ({
        barcode: item.item_code,
        name: item.item_name || item.item_code,
        price: item.standard_rate || 0,
        unit: item.stock_uom || 'cái',
        item_group: item.item_group,
        stock: item.stock,
        checked: item.first_check === 1 && item.second_check === 1,
        first_check: item.first_check || 0,
        second_check: item.second_check || 0
      }));

      return res.json({ data: products, total });
    }

    // Đếm tổng kết quả tìm kiếm
    const searchPattern = `%${searchTerm}%`;
    const [countResult] = await pool.query<any[]>(
      `SELECT COUNT(*) as total
      FROM tabItem 
      WHERE disabled = 0 
        AND is_sales_item = 1
        AND is_fixed_asset = 0
        AND (
          item_name LIKE ? 
          OR name LIKE ?
        )`,
      [searchPattern, searchPattern]
    );
    const total = countResult[0]?.total || 0;

    // Tìm kiếm theo tên hoặc item_code
    const [items] = await pool.query<TabItem[]>(
      `SELECT 
        name as item_code,
        item_name,
        standard_rate,
        stock_uom,
        item_group,
        stock,
        first_check,
        second_check
      FROM tabItem 
      WHERE disabled = 0 
        AND is_sales_item = 1
        AND is_fixed_asset = 0
        AND (
          item_name LIKE ? 
          OR name LIKE ?
        )
      ORDER BY 
        CASE 
          WHEN item_name LIKE ? THEN 1
          WHEN name LIKE ? THEN 2
          ELSE 3
        END,
        item_name ASC
      LIMIT ? OFFSET ?`,
      [searchPattern, searchPattern, `${searchTerm}%`, `${searchTerm}%`, limit, offset]
    );

    const products = items.map(item => ({
      barcode: item.item_code,
      name: item.item_name || item.item_code,
      price: item.standard_rate || 0,
      unit: item.stock_uom || 'cái',
      item_group: item.item_group,
      stock: item.stock,
      checked: item.first_check === 1 && item.second_check === 1,
      first_check: item.first_check || 0,
      second_check: item.second_check || 0
    }));

    res.json({ data: products, total });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ 
      error: 'Failed to search products',
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
        item_group,
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
      item_group: item.item_group,
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
        is_sales_item,
        item_group,
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
      item_group: item.item_group,
      checked: item.first_check === 1 && item.second_check === 1,
      first_check: item.first_check || 0,
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
    const { barcode, name, price, unit, owner } = req.body;

    // Validate input
    if (!barcode || !name || price === undefined || !unit) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if item already exists (dùng item_code làm barcode)
    const [existing] = await pool.query<TabItem[]>(
      `SELECT name FROM tabItem WHERE name = ? LIMIT 1`,
      [barcode]
    );

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Product with this barcode already exists' });
    }

    // Insert new item vào tabItem
    await pool.query(
      `INSERT INTO tabItem (
        name, 
        item_code, 
        item_name, 
        stock_uom, 
        standard_rate,
        disabled,
        is_sales_item,
        is_stock_item,
        is_fixed_asset,
        first_check,
        second_check,
        owner,
        creation,
        modified
      ) VALUES (?, ?, ?, ?, ?, 0, 1, 1, 0, 0, 0, ?, NOW(), NOW())`,
      [barcode, barcode, name, unit, price, owner || null]
    );

    res.json({
      success: true,
      message: 'Product created successfully',
      product: { 
        barcode, 
        name, 
        price, 
        unit, 
        checked: false,
        first_check: 0,
        second_check: 0,
        owner: owner || null
      }
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
  const startTime = Date.now();
  console.log(`\n[FIRST-CHECK] 🔍 Started - Barcode: ${req.params.barcode}`);
  
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

    console.log(`[FIRST-CHECK] 👤 Checked by: ${checked_by}`);
    console.log(`[FIRST-CHECK] 📊 Result: ${check_result}`);
    console.log(`[FIRST-CHECK] 📸 Images: ${[image_1, image_2, image_3].filter(Boolean).length} file(s)`);

    // Validate check_result
    const validResults = ['correct', 'needs_correction', 'incorrect'];
    if (check_result && !validResults.includes(check_result)) {
      console.log(`[FIRST-CHECK] ❌ Invalid check_result: ${check_result}`);
      return res.status(400).json({ 
        error: 'Invalid check_result',
        validValues: validResults 
      });
    }

    // Lưu images dưới dạng file và lấy đường dẫn
    console.log(`[FIRST-CHECK] 💾 Saving images...`);
    const savedImage1 = saveBase64Image(image_1);
    const savedImage2 = saveBase64Image(image_2);
    const savedImage3 = saveBase64Image(image_3);
    console.log(`[FIRST-CHECK] ✅ Images saved: ${[savedImage1, savedImage2, savedImage3].filter(Boolean).length} file(s)`);

    console.log(`[FIRST-CHECK] ✅ Images saved: ${[savedImage1, savedImage2, savedImage3].filter(Boolean).length} file(s)`);

    // Update item with first check
    console.log(`[FIRST-CHECK] 🗄️  Updating database...`);
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
        savedImage1,
        savedImage2,
        savedImage3,
        barcode
      ]
    );

    if ((result as any).affectedRows === 0) {
      console.log(`[FIRST-CHECK] ❌ Product not found: ${barcode}`);
      return res.status(404).json({ error: 'Product not found' });
    }

    const duration = Date.now() - startTime;
    console.log(`[FIRST-CHECK] ✅ Success - Duration: ${duration}ms\n`);
    
    res.json({
      success: true,
      message: 'First check completed successfully',
      barcode,
      checked_by,
      checked_at: new Date().toISOString()
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[FIRST-CHECK] ❌ Error after ${duration}ms:`, error);
    res.status(500).json({ 
      error: 'Failed to complete first check',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API: Second Check - Người 2 check lại (đè lên kết quả check lần 1)
app.patch('/api/products/:barcode/second-check', async (req, res) => {
  const startTime = Date.now();
  console.log(`\n[SECOND-CHECK] 🔍 Started - Barcode: ${req.params.barcode}`);
  
  try {
    const { barcode } = req.params;
    const { checked_by, check_result, new_product_name, new_unit, new_price, stock, image_1, image_2, image_3 } = req.body;

    console.log(`[SECOND-CHECK] 👤 Checked by: ${checked_by}`);
    console.log(`[SECOND-CHECK] 📊 Result: ${check_result}`);
    console.log(`[SECOND-CHECK] 📸 Images: ${[image_1, image_2, image_3].filter(Boolean).length} file(s)`);

    // Kiểm tra xem đã first_check chưa
    console.log(`[SECOND-CHECK] 🔍 Verifying first check status...`);
    const [items] = await pool.query<TabItem[]>(
      'SELECT * FROM tabItem WHERE name = ? AND first_check = 1',
      [barcode]
    );

    if (!items || items.length === 0) {
      console.log(`[SECOND-CHECK] ⚠️  First check not completed for: ${barcode}`);
      return res.status(400).json({ 
        error: 'First check not completed yet. Sản phẩm phải được check lần 1 trước.' 
      });
    }

    console.log(`[SECOND-CHECK] ✅ First check verified`);

    // Lưu images dưới dạng file và lấy đường dẫn
    console.log(`[SECOND-CHECK] 💾 Saving images...`);
    const savedImage1 = saveBase64Image(image_1);
    const savedImage2 = saveBase64Image(image_2);
    const savedImage3 = saveBase64Image(image_3);
    console.log(`[SECOND-CHECK] ✅ Images saved: ${[savedImage1, savedImage2, savedImage3].filter(Boolean).length} file(s)`);

    console.log(`[SECOND-CHECK] ✅ Images saved: ${[savedImage1, savedImage2, savedImage3].filter(Boolean).length} file(s)`);

    // Cập nhật tất cả thông tin check - ĐÈ LÊN kết quả check lần 1
    console.log(`[SECOND-CHECK] 🗄️  Updating database (overwriting first check)...`);
    await pool.query(
      `UPDATE tabItem
       SET 
         second_check = 1,
         checked_by = ?,
         checked_at = NOW(),
         check_result = ?,
         new_product_name = ?,
         new_unit = ?,
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
        new_price,
        stock,
        savedImage1,
        savedImage2,
        savedImage3,
        barcode
      ]
    );

    const duration = Date.now() - startTime;
    console.log(`[SECOND-CHECK] ✅ Success (overwritten) - Duration: ${duration}ms\n`);

    res.json({
      success: true,
      message: 'Hoàn thành kiểm tra lần 2. Dữ liệu đã được cập nhật.',
      barcode,
      checked_by,
      check_result,
      overwritten: true  // Đánh dấu là đã đè lên kết quả check lần 1
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[SECOND-CHECK] ❌ Error after ${duration}ms:`, error);
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
  console.log(`   PATCH /api/products/:barcode/first-check - First check (independent)`);
  console.log(`   PATCH /api/products/:barcode/second-check - Second check (overwrites first check)`);
  console.log(`   GET   /api/products/pending-first-check - Products pending first check`);
  console.log(`   GET   /api/check-workflow/stats - Workflow statistics`);
});

export default app;
