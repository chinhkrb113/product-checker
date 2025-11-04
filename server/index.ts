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
});

export default app;
