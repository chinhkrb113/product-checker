# 🛒 Supermarket Product Checker

Hệ thống kiểm tra sản phẩm siêu thị tích hợp với ERPNext, cho phép nhân viên quét mã vạch và quản lý danh sách sản phẩm một cách hiệu quả.

![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.x-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Sử dụng](#-sử-dụng)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## ✨ Tính năng

### 🔐 Xác thực & Bảo mật
- ✅ Đăng nhập bằng username từ ERPNext
- ✅ Xác thực trạng thái nhân viên (Active/Inactive)
- ✅ Quản lý phiên đăng nhập

### 📦 Quản lý sản phẩm
- 🔍 Quét mã vạch nhanh chóng bằng barcode scanner
- 📊 Xem danh sách tất cả sản phẩm với phân trang
- 🔎 Tìm kiếm sản phẩm theo barcode/mã sản phẩm
- ➕ Tạo mới sản phẩm
- ✏️ Cập nhật thông tin sản phẩm
- ✔️ Đánh dấu sản phẩm đã kiểm tra

### 🔄 Tích hợp ERPNext
- Kết nối trực tiếp với MySQL database của ERPNext
- Đồng bộ dữ liệu thời gian thực
- Tương thích với ERPNext >= 13.x

## 🛠 Công nghệ sử dụng

### Frontend
- **React** 19.2.0 - UI Framework
- **TypeScript** 5.8.2 - Type safety
- **Vite** 6.2.0 - Build tool & dev server
- **React DOM** 19.2.0 - DOM rendering

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** 5.1.0 - Web framework
- **TypeScript** - Type safety
- **MySQL2** 3.15.3 - Database driver với Promise support
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables management

### Development Tools
- **tsx** - TypeScript execution với hot reload
- **concurrently** - Chạy nhiều process đồng thời
- **Vite Plugin React** - React Fast Refresh

### Database
- **MySQL** >= 5.7
- **ERPNext Database** với các bảng:
  - `tabItem` - Thông tin sản phẩm
  - `tabEmployee` - Thông tin nhân viên
  - `tabItem Barcode` - Mã vạch sản phẩm

## 📦 Yêu cầu hệ thống

- **Node.js**: >= 16.x
- **npm**: >= 7.x hoặc **yarn**: >= 1.22.x
- **MySQL**: >= 5.7
- **ERPNext**: >= 13.x (đã cài đặt và cấu hình)
- **Barcode Scanner** (optional): Cho chức năng quét mã vạch

## 🚀 Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/chinhkrb113/product-checker.git
cd product-checker
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_erpnext_db_user
DB_PASSWORD=your_erpnext_db_password
DB_DATABASE=your_erpnext_database_name

# Server Configuration
PORT=3001
```

### 4. Kiểm tra kết nối Database

```bash
npm run server
```

Nếu kết nối thành công, bạn sẽ thấy:
```
✅ Database connected successfully
🚀 Server running on http://localhost:3001
```

### 5. Khởi chạy ứng dụng

#### Development mode (Frontend + Backend)
```bash
npm run dev:full
```

#### Chỉ chạy Frontend
```bash
npm run dev
```

#### Chỉ chạy Backend
```bash
npm run server
```

#### Production build
```bash
npm run build
npm run preview
```

## ⚙️ Cấu hình

### Database Connection

File `server/db.ts` quản lý kết nối database:

```typescript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

### CORS Configuration

Mặc định CORS cho phép tất cả origins. Để hạn chế trong production, chỉnh sửa `server/index.ts`:

```typescript
app.use(cors({
  origin: ['http://localhost:5173', 'http://your-production-domain.com'],
  credentials: true
}));
```

### Server Port

Thay đổi port server trong `.env.local`:

```env
PORT=3001  # Thay đổi port tùy ý
```

## 📖 Sử dụng

### 1. Đăng nhập hệ thống

1. Mở trình duyệt tại `http://localhost:5173`
2. Nhập username từ ERPNext (ví dụ: `EMP-00001`)
3. Hệ thống sẽ kiểm tra:
   - Username có tồn tại không
   - Tài khoản có đang Active không
4. Đăng nhập thành công → chuyển sang màn hình chính

### 2. Quét mã vạch sản phẩm

1. Click vào tab "Scan"
2. Sử dụng barcode scanner hoặc nhập mã thủ công
3. Hệ thống tự động tìm kiếm và hiển thị thông tin sản phẩm
4. Đánh dấu sản phẩm đã kiểm tra

### 3. Xem danh sách sản phẩm

1. Click vào tab "Products"
2. Xem danh sách tất cả sản phẩm với phân trang
3. Scroll để tải thêm sản phẩm (lazy loading)
4. Click vào sản phẩm để xem chi tiết

### 4. Tạo sản phẩm mới

1. Click vào tab "Create"
2. Nhập thông tin sản phẩm:
   - Barcode/Mã sản phẩm
   - Tên sản phẩm
   - Giá bán
   - Đơn vị tính
3. Submit form

## 📡 API Documentation

### Base URL
```
http://localhost:3001
```

### Endpoints

#### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

#### 2. Login

Xác thực nhân viên từ ERPNext database.

```http
POST /api/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "EMP-00001"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "username": "EMP-00001",
  "employeeName": "Nguyen Van A"
}
```

**Error Responses:**
- **400 Bad Request** - Username không được để trống
```json
{
  "error": "Username is required"
}
```

- **401 Unauthorized** - Username không tồn tại
```json
{
  "error": "Username không tồn tại"
}
```

- **401 Unauthorized** - Tài khoản không hoạt động
```json
{
  "error": "Tài khoản không hoạt động",
  "status": "Left"
}
```

---

#### 3. Get All Products

Lấy danh sách sản phẩm với phân trang.

```http
GET /api/products?limit={limit}&offset={offset}
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Số lượng sản phẩm mỗi trang |
| `offset` | number | 0 | Vị trí bắt đầu |

**Example Request:**
```http
GET /api/products?limit=20&offset=0
```

**Success Response (200):**
```json
[
  {
    "barcode": "ITEM-001",
    "name": "Nước ngọt Coca Cola",
    "price": 15000,
    "unit": "Chai",
    "checked": false
  },
  {
    "barcode": "ITEM-002",
    "name": "Bánh mì sandwich",
    "price": 25000,
    "unit": "Cái",
    "checked": false
  }
]
```

**Notes:**
- Chỉ lấy sản phẩm có `disabled = 0` và `is_sales_item = 1`
- Loại bỏ tài sản cố định (`is_fixed_asset = 0`)
- Sắp xếp theo tên sản phẩm (A-Z)

---

#### 4. Get Product by Barcode

Tìm kiếm sản phẩm theo mã vạch hoặc mã sản phẩm.

```http
GET /api/products/:barcode
```

**Example Request:**
```http
GET /api/products/ITEM-001
```

**Success Response (200):**
```json
{
  "barcode": "ITEM-001",
  "name": "Nước ngọt Coca Cola",
  "price": 15000,
  "unit": "Chai",
  "checked": false
}
```

**Error Response (404):**
```json
{
  "error": "Product not found"
}
```

---

#### 5. Create New Product

Tạo sản phẩm mới trong hệ thống.

```http
POST /api/products
Content-Type: application/json
```

**Request Body:**
```json
{
  "barcode": "ITEM-NEW-001",
  "name": "Sản phẩm mới",
  "price": 50000,
  "unit": "Hộp"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product creation requires Frappe API integration",
  "product": {
    "barcode": "ITEM-NEW-001",
    "name": "Sản phẩm mới",
    "price": 50000,
    "unit": "Hộp",
    "checked": true
  }
}
```

**Error Responses:**
- **400 Bad Request** - Thiếu thông tin bắt buộc
```json
{
  "error": "Missing required fields"
}
```

- **409 Conflict** - Barcode đã tồn tại
```json
{
  "error": "Product with this barcode already exists"
}
```

**⚠️ Note:** API hiện tại trả về mock response. Trong production cần tích hợp Frappe API để tạo sản phẩm thực sự trong ERPNext.

---

#### 6. Update Product

Cập nhật thông tin sản phẩm.

```http
PUT /api/products/:barcode
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Tên sản phẩm mới",
  "price": 60000,
  "unit": "Hộp",
  "checked": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product update requires Frappe API integration",
  "product": {
    "barcode": "ITEM-001",
    "name": "Tên sản phẩm mới",
    "price": 60000,
    "unit": "Hộp",
    "checked": true
  }
}
```

**⚠️ Note:** API hiện tại trả về mock response. Trong production cần tích hợp Frappe API để cập nhật sản phẩm thực sự trong ERPNext.

---

### Error Handling

Tất cả API endpoints có thể trả về lỗi server:

**500 Internal Server Error:**
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## 🗄 Database Schema

### tabEmployee

Bảng quản lý thông tin nhân viên từ ERPNext.

```sql
CREATE TABLE `tabEmployee` (
  `name` varchar(140) PRIMARY KEY,           -- Mã nhân viên (EMP-00001)
  `employee_name` varchar(140),              -- Tên đầy đủ
  `status` varchar(140),                     -- Trạng thái: Active, Left, etc.
  `creation` datetime,
  `modified` datetime,
  INDEX idx_status (status)
);
```

**Sample Data:**
```sql
INSERT INTO tabEmployee (name, employee_name, status) VALUES
('EMP-00001', 'Nguyen Van A', 'Active'),
('EMP-00002', 'Tran Thi B', 'Active');
```

---

### tabItem

Bảng quản lý thông tin sản phẩm từ ERPNext.

```sql
CREATE TABLE `tabItem` (
  `name` varchar(140) PRIMARY KEY,           -- Mã sản phẩm (ITEM-001)
  `item_name` varchar(140),                  -- Tên sản phẩm
  `standard_rate` decimal(18,6),             -- Giá bán
  `stock_uom` varchar(140),                  -- Đơn vị tính
  `disabled` int(1) DEFAULT 0,               -- 0: Active, 1: Disabled
  `is_sales_item` int(1) DEFAULT 1,          -- Có phải hàng bán không
  `is_fixed_asset` int(1) DEFAULT 0,         -- Có phải tài sản cố định không
  `creation` datetime,
  `modified` datetime,
  INDEX idx_disabled (disabled),
  INDEX idx_is_sales_item (is_sales_item),
  INDEX idx_item_name (item_name)
);
```

**Sample Data:**
```sql
INSERT INTO tabItem (name, item_name, standard_rate, stock_uom, disabled, is_sales_item, is_fixed_asset) VALUES
('ITEM-001', 'Nước ngọt Coca Cola', 15000, 'Chai', 0, 1, 0),
('ITEM-002', 'Bánh mì sandwich', 25000, 'Cái', 0, 1, 0);
```

---

### tabItem Barcode

Bảng ánh xạ barcode với sản phẩm.

```sql
CREATE TABLE `tabItem Barcode` (
  `name` varchar(140) PRIMARY KEY,
  `barcode` varchar(140) UNIQUE,             -- Mã vạch
  `parent` varchar(140),                     -- Reference to tabItem.name
  FOREIGN KEY (parent) REFERENCES tabItem(name),
  INDEX idx_barcode (barcode)
);
```

**Sample Data:**
```sql
INSERT INTO `tabItem Barcode` (name, barcode, parent) VALUES
('BARCODE-001', '8934567890123', 'ITEM-001'),
('BARCODE-002', '8934567890456', 'ITEM-002');
```

---

### Query Examples

#### Lấy tất cả sản phẩm active
```sql
SELECT 
  name as item_code,
  item_name,
  standard_rate,
  stock_uom
FROM tabItem 
WHERE disabled = 0 
  AND is_sales_item = 1
  AND is_fixed_asset = 0
ORDER BY item_name ASC;
```

#### Tìm sản phẩm theo barcode
```sql
SELECT 
  i.name as item_code,
  i.item_name,
  i.standard_rate,
  i.stock_uom,
  b.barcode
FROM tabItem i
LEFT JOIN `tabItem Barcode` b ON i.name = b.parent
WHERE b.barcode = '8934567890123'
  AND i.disabled = 0;
```

#### Kiểm tra username và status
```sql
SELECT 
  name,
  employee_name,
  status
FROM tabEmployee 
WHERE name = 'EMP-00001'
  AND status = 'Active';
```

## 📁 Cấu trúc thư mục

```
supermarket-product-checker/
├── server/                          # Backend API
│   ├── index.ts                    # Express server & API routes
│   └── db.ts                       # MySQL connection pool
├── components/                      # React components
│   ├── LoginScreen.tsx             # Màn hình đăng nhập
│   ├── ScanScreen.tsx              # Màn hình quét barcode
│   ├── ProductListScreen.tsx       # Danh sách sản phẩm
│   ├── ProductDetailScreen.tsx     # Chi tiết sản phẩm
│   ├── CreateProductScreen.tsx     # Tạo sản phẩm mới
│   ├── Toast.tsx                   # Thông báo
│   └── icons.tsx                   # Icon components
├── App.tsx                          # Main App component
├── index.tsx                        # Entry point
├── types.ts                         # TypeScript type definitions
├── constants.ts                     # App constants
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite configuration
├── .env.local                       # Environment variables (create this)
└── README.md                        # Documentation
```

## 🔧 Troubleshooting

### Vấn đề 1: Không kết nối được database

**Triệu chứng:**
```
❌ Database connection failed: Access denied for user
```

**Giải pháp:**
1. Kiểm tra thông tin trong file `.env.local`
2. Đảm bảo MySQL server đang chạy:
```bash
# Windows
net start MySQL80

# Linux/Mac
sudo systemctl start mysql
```
3. Kiểm tra quyền truy cập database:
```sql
GRANT ALL PRIVILEGES ON erpnext_db.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```
4. Test kết nối trực tiếp:
```bash
mysql -h localhost -u your_user -p your_database
```

---

### Vấn đề 2: Port 3001 đã được sử dụng

**Triệu chứng:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Giải pháp:**

**Option 1:** Thay đổi port trong `.env.local`:
```env
PORT=3002
```

**Option 2:** Kill process đang dùng port 3001:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

---

### Vấn đề 3: CORS Error

**Triệu chứng:**
```
Access to fetch at 'http://localhost:3001/api/products' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Giải pháp:**

Thêm origin của frontend vào CORS config trong `server/index.ts`:
```typescript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

---

### Vấn đề 4: Login thất bại với username hợp lệ

**Triệu chứng:**
```json
{
  "error": "Tài khoản không hoạt động"
}
```

**Giải pháp:**

Kiểm tra status trong database:
```sql
SELECT name, employee_name, status 
FROM tabEmployee 
WHERE name = 'EMP-00001';
```

Status phải là `'Active'` (case-insensitive). Nếu không, update:
```sql
UPDATE tabEmployee 
SET status = 'Active' 
WHERE name = 'EMP-00001';
```

---

### Vấn đề 5: Không tìm thấy sản phẩm

**Triệu chứng:**
```json
{
  "error": "Product not found"
}
```

**Giải pháp:**

1. Kiểm tra sản phẩm có tồn tại và đang active:
```sql
SELECT name, item_name, disabled, is_sales_item 
FROM tabItem 
WHERE name = 'ITEM-001';
```

2. Đảm bảo sản phẩm thỏa mãn điều kiện:
   - `disabled = 0`
   - `is_sales_item = 1`
   - `is_fixed_asset = 0`

3. Nếu dùng barcode, kiểm tra bảng `tabItem Barcode`:
```sql
SELECT * FROM `tabItem Barcode` WHERE barcode = 'your-barcode';
```

---

### Vấn đề 6: TypeScript compilation errors

**Triệu chứng:**
```
error TS2304: Cannot find name 'xxx'
```

**Giải pháp:**

1. Cài đặt lại dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Kiểm tra TypeScript version:
```bash
npx tsc --version
```

3. Clear TypeScript cache:
```bash
rm -rf node_modules/.cache
```

---

### Vấn đề 7: Frontend không load được API data

**Triệu chứng:**
- Network tab shows 404 hoặc connection refused
- Console error: `Failed to fetch`

**Giải pháp:**

1. Đảm bảo backend đang chạy:
```bash
npm run server
```

2. Kiểm tra API URL trong frontend code
3. Test API trực tiếp bằng curl:
```bash
curl http://localhost:3001/health
```

4. Kiểm tra firewall không block port 3001

---

### Debug Tips

#### Enable verbose logging

Thêm vào `server/index.ts`:
```typescript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

#### Test database queries

Tạo file `test-db.ts`:
```typescript
import pool from './server/db';

async function testQuery() {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM tabItem');
    console.log('Total items:', rows);
  } catch (error) {
    console.error('Query failed:', error);
  }
  process.exit(0);
}

testQuery();
```

Run test:
```bash
npx tsx test-db.ts
```

## 🤝 Contributing

Chúng tôi hoan nghênh mọi đóng góp cho dự án!

### Quy trình đóng góp

1. **Fork repository**
```bash
# Click nút "Fork" trên GitHub
```

2. **Clone fork của bạn**
```bash
git clone https://github.com/YOUR_USERNAME/product-checker.git
cd product-checker
```

3. **Tạo branch mới**
```bash
git checkout -b feature/amazing-feature
# hoặc
git checkout -b fix/bug-fix
```

4. **Commit changes**
```bash
git add .
git commit -m "Add: amazing new feature"
```

5. **Push to GitHub**
```bash
git push origin feature/amazing-feature
```

6. **Tạo Pull Request**
- Vào GitHub repository của bạn
- Click "New Pull Request"
- Describe your changes
- Submit PR

### Coding Standards

#### TypeScript
- Sử dụng TypeScript strict mode
- Định nghĩa types rõ ràng, tránh `any`
- Sử dụng interfaces cho data structures

#### Code Style
- Indent: 2 spaces
- Quotes: Single quotes
- Semicolons: Required
- Line length: Max 100 characters

#### Git Commit Messages
```
Type: Brief description

- Add: Thêm tính năng mới
- Fix: Sửa bug
- Update: Cập nhật tính năng
- Refactor: Refactor code
- Docs: Cập nhật documentation
- Test: Thêm tests
```

**Examples:**
```
Add: Barcode scanner integration
Fix: Login validation for special characters
Update: Improve pagination performance
Refactor: Extract API calls to separate service
Docs: Add API documentation for new endpoints
```

### Testing

Trước khi submit PR, đảm bảo:

1. ✅ Code compile không lỗi:
```bash
npm run build
```

2. ✅ Server chạy không lỗi:
```bash
npm run server
```

3. ✅ Frontend chạy không lỗi:
```bash
npm run dev
```

4. ✅ Test các API endpoints
5. ✅ Test trên browser khác nhau

### Báo cáo Bug

Khi báo cáo bug, vui lòng bao gồm:

1. **Mô tả bug**: Mô tả rõ ràng và ngắn gọn
2. **Steps to reproduce**: Các bước tái hiện bug
3. **Expected behavior**: Hành vi mong đợi
4. **Screenshots**: Nếu có
5. **Environment**:
   - OS: [e.g. Windows 10, macOS 12]
   - Node version: [e.g. 16.14.0]
   - Browser: [e.g. Chrome 120]

### Feature Requests

Khi đề xuất tính năng mới:

1. **Use case**: Tại sao cần tính năng này?
2. **Proposed solution**: Giải pháp đề xuất
3. **Alternatives**: Các giải pháp thay thế
4. **Additional context**: Thông tin thêm

## 📝 Notes

### ⚠️ Important Notes

1. **Product Creation/Update API**: 
   - Hiện tại chỉ trả về mock response
   - Trong production cần tích hợp Frappe REST API
   - Xem [Frappe API Documentation](https://frappeframework.com/docs/user/en/api)

2. **Barcode Handling**: 
   - Hiện tại sử dụng `item_code` làm barcode
   - Để sử dụng barcode thực từ `tabItem Barcode`, cần update query để JOIN table

3. **Authentication**: 
   - Chỉ verify username, không có password
   - Trong production nên implement proper authentication:
     - JWT tokens
     - Session management
     - Password hashing

4. **Security Considerations**:
   - Thêm rate limiting
   - Input validation và sanitization
   - SQL injection prevention (đã có với prepared statements)
   - XSS protection

### 🔮 Future Improvements

- [ ] Implement JWT authentication
- [ ] Add role-based access control (RBAC)
- [ ] Integrate Frappe REST API for product CRUD
- [ ] Add real-time updates với WebSocket
- [ ] Implement caching layer (Redis)
- [ ] Add unit tests và integration tests
- [ ] Mobile app version (React Native)
- [ ] Offline mode với local storage
- [ ] Export reports (Excel, PDF)
- [ ] Advanced search và filters
- [ ] Batch product operations
- [ ] Audit logging
- [ ] Multi-language support (i18n)

### 📚 Related Documentation

- [ERPNext Documentation](https://docs.erpnext.com/)
- [Frappe Framework](https://frappeframework.com/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Rocket Global

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 👥 Authors

**Rocket Global Team**
- GitHub: [@chinhkrb113](https://github.com/chinhkrb113)
- Repository: [product-checker](https://github.com/chinhkrb113/product-checker)

## 📞 Support

Nếu có vấn đề hoặc câu hỏi:

- 🐛 **Bug Reports**: [Create an issue](https://github.com/chinhkrb113/product-checker/issues)
- 💡 **Feature Requests**: [Create an issue](https://github.com/chinhkrb113/product-checker/issues)
- 📧 **Email**: support@rocketglobal.com
- 💬 **Discussions**: [GitHub Discussions](https://github.com/chinhkrb113/product-checker/discussions)

## 🙏 Acknowledgments

- **ERPNext** - Open source ERP system
- **Frappe Framework** - Web framework powering ERPNext
- **React Team** - For the amazing UI library
- **Vite Team** - For the blazing fast build tool
- All contributors who help improve this project

---

<div align="center">

**Made with ❤️ by [Rocket Global](https://rocketglobal.com)**

⭐ Star this repository if you find it helpful!

</div>
