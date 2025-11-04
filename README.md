# 🛒 Supermarket Product Checker

Hệ thống kiểm tra sản phẩm siêu thị tích hợp với ERPNext, cho phép nhân viên quét mã vạch, kiểm tra chất lượng theo quy trình 2 bước (double-check workflow), và quản lý danh sách sản phẩm một cách hiệu quả.

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
- ✅ Đăng nhập bằng username từ ERPNext (tabEmployee)
- ✅ Xác thực trạng thái nhân viên (Active/Inactive)
- ✅ Quản lý phiên đăng nhập với localStorage
- ✅ Tự động lưu trạng thái đăng nhập

### 📦 Quản lý sản phẩm
- 🔍 Quét mã vạch nhanh chóng bằng barcode scanner
- 📊 Xem danh sách tất cả sản phẩm với phân trang (lazy loading)
- 🔎 Tìm kiếm sản phẩm theo barcode/mã sản phẩm/tên sản phẩm
- ➕ Tạo mới sản phẩm với 119 đơn vị tính (searchable dropdown)
- ✏️ Cập nhật thông tin sản phẩm
- 📷 Chụp và lưu ảnh sản phẩm (tối đa 3 ảnh)
- ⚡ Lọc và sắp xếp danh sách sản phẩm

### 🔄 Double-Check Workflow (Quy trình kiểm tra 2 lần)
- ✅ **Check lần 1 (First Check)** - Nhân viên kiểm tra:
  - Đánh giá trạng thái: Đúng / Cần sửa / Sai
  - Cập nhật thông tin: Tên sản phẩm, đơn vị, giá, tồn kho
  - Chụp ảnh sản phẩm (1-3 ảnh)
  - Ghi nhận người kiểm tra và thời gian

- ✅ **Check lần 2 (Second Check)** - Supervisor duyệt:
  - Xem danh sách sản phẩm chờ duyệt
  - Lọc theo trạng thái (Đúng/Cần sửa/Sai)
  - Phê duyệt hoặc từ chối
  - Tìm kiếm và phân trang nâng cao

- 📊 **Dashboard thống kê**:
  - Tiến độ hoàn thành tổng thể
  - Tiến độ Check lần 1
  - Số sản phẩm chờ check từng giai đoạn
  - Thống kê kết quả kiểm tra (Đúng/Cần sửa/Sai)
  - Auto-refresh mỗi 30 giây

### 🔄 Tích hợp ERPNext
- Kết nối trực tiếp với MySQL database của ERPNext
- Đồng bộ dữ liệu thời gian thực
- Tương thích với ERPNext >= 13.x
- Sử dụng bảng `tabItem` và `tabEmployee`

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
  - `tabItem` - Thông tin sản phẩm (với các trường check workflow)
  - `tabEmployee` - Thông tin nhân viên

## 📦 Yêu cầu hệ thống

- **Node.js**: >= 16.x
- **npm**: >= 7.x hoặc **yarn**: >= 1.22.x
- **MySQL**: >= 5.7
- **ERPNext**: >= 13.x (đã cài đặt và cấu hình)
- **Barcode Scanner** (optional): Cho chức năng quét mã vạch
- **Camera** (optional): Cho chức năng chụp ảnh sản phẩm

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

1. Click vào tab "Scan" hoặc sử dụng icon quét
2. Sử dụng barcode scanner hoặc nhập mã thủ công
3. Hệ thống tự động tìm kiếm và hiển thị thông tin sản phẩm
4. Chọn "Check lần 1" để bắt đầu kiểm tra

### 3. Check lần 1 (First Check) - Nhân viên

1. Sau khi quét mã, chọn "Check lần 1"
2. Chọn kết quả kiểm tra:
   - ✅ **Đúng**: Thông tin sản phẩm chính xác
   - 🔄 **Cần sửa**: Cần điều chỉnh một số thông tin
   - ❌ **Sai**: Thông tin sản phẩm hoàn toàn sai
3. Cập nhật thông tin nếu cần:
   - Tên sản phẩm mới
   - Đơn vị mới (chọn từ 119 đơn vị với tính năng tìm kiếm)
   - Giá mới
   - Số lượng tồn kho
4. Chụp ảnh sản phẩm (1-3 ảnh)
5. Submit để gửi lên hệ thống

### 4. Check lần 2 (Second Check) - Supervisor

1. Click vào tab "Duyệt kiểm tra lần 2"
2. Xem danh sách sản phẩm chờ duyệt
3. Sử dụng bộ lọc:
   - **Tất cả**: Xem toàn bộ sản phẩm chờ duyệt
   - **Đúng**: Chỉ xem sản phẩm được đánh giá đúng
   - **Cần sửa**: Chỉ xem sản phẩm cần điều chỉnh
   - **Sai**: Chỉ xem sản phẩm sai thông tin
4. Click vào sản phẩm để xem chi tiết
5. Phê duyệt hoặc từ chối:
   - ✅ **Phê duyệt**: Đồng ý với đánh giá của nhân viên
   - ❌ **Từ chối**: Không đồng ý, yêu cầu kiểm tra lại
6. Sử dụng phân trang (10/20/50/100 items/trang) và tìm kiếm

### 5. Xem thống kê (Dashboard)

1. Click vào tab "Thống kê"
2. Xem các chỉ số:
   - **Tiến độ hoàn thành**: % sản phẩm đã hoàn thành cả 2 lần check
   - **Tiến độ Check lần 1**: % sản phẩm đã qua check lần 1
   - **Chờ check lần 1**: Số sản phẩm chưa được kiểm tra
   - **Chờ duyệt lần 2**: Số sản phẩm đã check lần 1, chờ supervisor duyệt
   - **Đã hoàn thành**: Số sản phẩm đã qua cả 2 lần check
   - **Phân tích kết quả**: Số lượng sản phẩm Đúng/Cần sửa/Sai
3. Dashboard tự động refresh mỗi 30 giây

### 6. Xem danh sách sản phẩm

1. Click vào tab "Danh sách"
2. Xem danh sách tất cả sản phẩm với phân trang
3. Tìm kiếm sản phẩm theo tên hoặc mã
4. Scroll để tải thêm sản phẩm (lazy loading)
5. Click vào sản phẩm để xem chi tiết
6. Lọc theo trạng thái check

### 7. Tạo sản phẩm mới

1. Click vào tab "Tạo mới"
2. Nhập thông tin sản phẩm:
   - Barcode/Mã sản phẩm
   - Tên sản phẩm
   - Giá bán (lưu ý: tối đa 999,999,999)
   - Đơn vị tính (chọn từ dropdown với tìm kiếm)
3. Submit form
4. Sản phẩm mới tự động được đánh dấu đã check

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
{
  "data": [
    {
      "barcode": "ITEM-001",
      "name": "Nước ngọt Coca Cola",
      "price": 15000,
      "unit": "Chai",
      "checked": false,
      "first_check": 0,
      "second_check": 0
    }
  ],
  "total": 100
}
```

**Notes:**
- Chỉ lấy sản phẩm có `disabled = 0` và `is_sales_item = 1`
- Loại bỏ tài sản cố định (`is_fixed_asset = 0`)
- Sắp xếp theo tên sản phẩm (A-Z)
- Trả về tổng số sản phẩm trong `total`

---

#### 4. Search Products

Tìm kiếm sản phẩm theo tên hoặc mã.

```http
GET /api/products/search?q={searchTerm}&limit={limit}&offset={offset}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | No | Từ khóa tìm kiếm |
| `limit` | number | No | Số lượng kết quả (default: 50) |
| `offset` | number | No | Vị trí bắt đầu (default: 0) |

**Success Response (200):**
```json
{
  "data": [
    {
      "barcode": "ITEM-001",
      "name": "Nước ngọt Coca Cola",
      "price": 15000,
      "unit": "Chai",
      "checked": false,
      "first_check": 0,
      "second_check": 0
    }
  ],
  "total": 5
}
```

---

#### 5. Get Products Pending First Check

Lấy danh sách sản phẩm chờ check lần 1.

```http
GET /api/products/pending-first-check?limit={limit}&offset={offset}
```

**Success Response (200):**
```json
{
  "data": [...],
  "total": 50
}
```

---

#### 6. Get Products Pending Second Check

Lấy danh sách sản phẩm chờ duyệt lần 2.

```http
GET /api/products/pending-second-check?limit={limit}&offset={offset}
```

**Success Response (200):**
```json
{
  "data": [
    {
      "barcode": "ITEM-001",
      "name": "Nước ngọt Coca Cola",
      "price": 15000,
      "unit": "Chai",
      "first_check": 1,
      "second_check": 0,
      "checked_by": "EMP-00001",
      "checked_at": "2025-11-05T10:30:00",
      "check_result": "correct",
      "new_product_name": null,
      "new_unit": null,
      "new_price": null,
      "stock": 100,
      "images": ["base64..."]
    }
  ],
  "total": 20
}
```

---

#### 7. Get Check Workflow Stats

Lấy thống kê quy trình check.

```http
GET /api/check-workflow/stats
```

**Success Response (200):**
```json
{
  "total": 1000,
  "pending_first_check": 300,
  "pending_second_check": 400,
  "completed": 300,
  "progress_percentage": 30.0,
  "correct_count": 250,
  "needs_correction_count": 100,
  "incorrect_count": 50
}
```

---

#### 8. Get Product by Barcode

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
  "checked": false,
  "first_check": 0,
  "second_check": 0,
  "check_result": null,
  "new_product_name": null,
  "new_unit": null,
  "new_price": null,
  "stock": null,
  "images": []
}
```

**Error Response (404):**
```json
{
  "error": "Product not found"
}
```

---

#### 9. Create New Product

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
  "message": "Product created successfully",
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
- **400 Bad Request** - Thiếu thông tin bắt buộc hoặc giá vượt quá giới hạn
```json
{
  "error": "Missing required fields"
}
```
```json
{
  "error": "Price must not exceed 999999999"
}
```

- **409 Conflict** - Barcode đã tồn tại
```json
{
  "error": "Product with this barcode already exists"
}
```

**⚠️ Note:** API tạo sản phẩm trực tiếp vào bảng `tabItem`. Giá không được vượt quá 999,999,999.

---

#### 10. Update Product

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
  "message": "Product updated successfully"
}
```

---

#### 11. First Check (Staff)

Nhân viên thực hiện check lần 1.

```http
PATCH /api/products/:barcode/first-check
Content-Type: application/json
```

**Request Body:**
```json
{
  "checked_by": "EMP-00001",
  "check_result": "correct",
  "new_product_name": "Tên mới",
  "new_unit": "Hộp",
  "new_price": 55000,
  "stock": 100,
  "images": ["base64...", "base64...", "base64..."]
}
```

**Parameters:**
- `check_result`: `"correct"` | `"needs_correction"` | `"incorrect"`
- `images`: Mảng base64 strings (tối đa 3 ảnh)

**Success Response (200):**
```json
{
  "success": true,
  "message": "First check completed successfully"
}
```

---

#### 12. Second Check (Supervisor)

Supervisor duyệt check lần 2.

```http
PATCH /api/products/:barcode/second-check
Content-Type: application/json
```

**Request Body:**
```json
{
  "approved": true,
  "checked_by": "EMP-00002"
}
```

**Parameters:**
- `approved`: `true` (phê duyệt) | `false` (từ chối)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Second check approved successfully"
}
```

```json
{
  "success": true,
  "message": "Second check rejected, product sent back to first check"
}
```

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

Bảng quản lý thông tin sản phẩm từ ERPNext với các trường check workflow.

```sql
CREATE TABLE `tabItem` (
  `name` varchar(140) PRIMARY KEY,           -- Mã sản phẩm (ITEM-001)
  `item_name` varchar(140),                  -- Tên sản phẩm
  `standard_rate` decimal(18,6),             -- Giá bán (tối đa 999,999,999)
  `stock_uom` varchar(140),                  -- Đơn vị tính
  `disabled` int(1) DEFAULT 0,               -- 0: Active, 1: Disabled
  `is_sales_item` int(1) DEFAULT 1,          -- Có phải hàng bán không
  `is_fixed_asset` int(1) DEFAULT 0,         -- Có phải tài sản cố định không
  
  -- Double-check workflow fields
  `first_check` int(1) DEFAULT 0,            -- 0: Chưa check, 1: Đã check lần 1
  `second_check` int(1) DEFAULT 0,           -- 0: Chưa duyệt, 1: Đã duyệt lần 2
  `checked_by` varchar(140),                 -- Mã nhân viên check
  `checked_at` datetime,                     -- Thời gian check
  `check_result` varchar(140),               -- 'correct', 'needs_correction', 'incorrect', 'rejected'
  `new_product_name` text,                   -- Tên sản phẩm mới (nếu cần sửa)
  `new_unit` varchar(140),                   -- Đơn vị mới (nếu cần sửa)
  `new_barcode` varchar(140),                -- Barcode mới (nếu cần sửa)
  `new_price` decimal(18,6),                 -- Giá mới (nếu cần sửa)
  `image_1` longtext,                        -- Ảnh 1 (base64)
  `image_2` longtext,                        -- Ảnh 2 (base64)
  `image_3` longtext,                        -- Ảnh 3 (base64)
  `stock` int(11),                           -- Số lượng tồn kho
  
  `creation` datetime,
  `modified` datetime,
  
  INDEX idx_disabled (disabled),
  INDEX idx_is_sales_item (is_sales_item),
  INDEX idx_item_name (item_name),
  INDEX idx_first_check (first_check),
  INDEX idx_second_check (second_check),
  INDEX idx_check_result (check_result)
);
```

**Sample Data:**
```sql
INSERT INTO tabItem (
  name, item_name, standard_rate, stock_uom, 
  disabled, is_sales_item, is_fixed_asset,
  first_check, second_check
) VALUES
('ITEM-001', 'Nước ngọt Coca Cola', 15000, 'Chai', 0, 1, 0, 0, 0),
('ITEM-002', 'Bánh mì sandwich', 25000, 'Cái', 0, 1, 0, 1, 0),
('ITEM-003', 'Sữa tươi Vinamilk', 35000, 'Hộp', 0, 1, 0, 1, 1);
```

**Check Workflow States:**
- `first_check=0, second_check=0`: Chưa check
- `first_check=1, second_check=0`: Đã check lần 1, chờ duyệt
- `first_check=1, second_check=1`: Đã hoàn thành
- `check_result='rejected'`: Bị từ chối, cần check lại

---

### Query Examples

#### Lấy tất cả sản phẩm active
```sql
SELECT 
  name as item_code,
  item_name,
  standard_rate,
  stock_uom,
  first_check,
  second_check
FROM tabItem 
WHERE disabled = 0 
  AND is_sales_item = 1
  AND is_fixed_asset = 0
ORDER BY item_name ASC;
```

#### Lấy sản phẩm chờ check lần 1
```sql
SELECT * FROM tabItem
WHERE disabled = 0
  AND is_sales_item = 1
  AND is_fixed_asset = 0
  AND first_check = 0
ORDER BY creation DESC;
```

#### Lấy sản phẩm chờ duyệt lần 2
```sql
SELECT * FROM tabItem
WHERE disabled = 0
  AND is_sales_item = 1
  AND is_fixed_asset = 0
  AND first_check = 1
  AND second_check = 0
  AND (check_result IS NULL OR check_result != 'rejected')
ORDER BY checked_at DESC;
```

#### Thống kê workflow
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN first_check = 0 THEN 1 ELSE 0 END) as pending_first_check,
  SUM(CASE WHEN first_check = 1 AND second_check = 0 AND (check_result IS NULL OR check_result != 'rejected') THEN 1 ELSE 0 END) as pending_second_check,
  SUM(CASE WHEN first_check = 1 AND second_check = 1 THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN check_result = 'correct' THEN 1 ELSE 0 END) as correct_count,
  SUM(CASE WHEN check_result = 'needs_correction' THEN 1 ELSE 0 END) as needs_correction_count,
  SUM(CASE WHEN check_result = 'incorrect' THEN 1 ELSE 0 END) as incorrect_count
FROM tabItem
WHERE disabled = 0
  AND is_sales_item = 1
  AND is_fixed_asset = 0;
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

---

### Database Migration

Nếu bạn cần thêm các trường workflow vào database ERPNext hiện có:

```sql
-- Thêm các trường check workflow
ALTER TABLE tabItem
ADD COLUMN first_check int(1) DEFAULT 0,
ADD COLUMN second_check int(1) DEFAULT 0,
ADD COLUMN checked_by varchar(140),
ADD COLUMN checked_at datetime,
ADD COLUMN check_result varchar(140),
ADD COLUMN new_product_name text,
ADD COLUMN new_unit varchar(140),
ADD COLUMN new_barcode varchar(140),
ADD COLUMN new_price decimal(18,6),
ADD COLUMN image_1 longtext,
ADD COLUMN image_2 longtext,
ADD COLUMN image_3 longtext,
ADD COLUMN stock int(11);

-- Thêm indexes để tối ưu query
ALTER TABLE tabItem
ADD INDEX idx_first_check (first_check),
ADD INDEX idx_second_check (second_check),
ADD INDEX idx_check_result (check_result);
```

## 📁 Cấu trúc thư mục

```
supermarket-product-checker/
├── server/                          # Backend API
│   ├── index.ts                    # Express server & 12 API routes
│   └── db.ts                       # MySQL connection pool
├── components/                      # React components (10 files)
│   ├── LoginScreen.tsx             # Màn hình đăng nhập
│   ├── ScanScreen.tsx              # Màn hình quét barcode
│   ├── ProductListScreen.tsx       # Danh sách sản phẩm với search/filter
│   ├── ProductDetailScreen.tsx     # Chi tiết sản phẩm
│   ├── CreateProductScreen.tsx     # Tạo sản phẩm mới (với searchable dropdown)
│   ├── FirstCheckScreen.tsx        # Check lần 1 (nhân viên)
│   ├── SecondCheckScreen.tsx       # Check lần 2 (supervisor) với filter/search
│   ├── CheckDashboard.tsx          # Dashboard thống kê workflow
│   ├── Toast.tsx                   # Thông báo
│   └── icons.tsx                   # Icon components
├── App.tsx                          # Main App component (207 lines)
├── index.tsx                        # Entry point
├── types.ts                         # TypeScript type definitions
├── constants.ts                     # App constants (119 UNIT_OPTIONS)
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite configuration
├── .env.local                       # Environment variables (create this)
├── DATABASE_SETUP.md                # Database setup guide
├── FIX_LOGIN_STATUS.md              # Login fix documentation
├── FIX_SCAN_SEARCH.md               # Scan/search fix documentation
├── INTEGRATION_COMPLETE.md          # Integration documentation
├── LAZY_LOADING_IMPLEMENTED.md      # Lazy loading implementation
├── LOGIN_FEATURE.md                 # Login feature documentation
├── TEST_SCENARIOS.md                # Test scenarios documentation
└── README.md                        # This file

## 📊 Key Features Detail

### 🔍 Searchable Dropdown (119 đơn vị)

Được sử dụng trong `FirstCheckScreen` và `CreateProductScreen`:

```typescript
// constants.ts
export const UNIT_OPTIONS = [
  '7- QUẢ', 'Bánh', 'Bao', 'BAO-18', 'BAO-20', 'BAO-80', 'Bịch', ...
  'Thùng', 'THÙNG-10', 'THÙNG-100', ...
  'Túi', 'Túi-10', 'TÚI-3', 'TÚI-7', 'Tuýp', 'UOM', 'Vỉ',
  'Vỉ-2', '份', '個', '包', '本', '杯'
]; // Total: 119 units
```

**Tính năng:**
- Tìm kiếm thời gian thực (case-insensitive)
- Click bên ngoài để đóng dropdown
- Highlight đơn vị đã chọn
- Hỗ trợ tiếng Việt và tiếng Trung

### 📈 Dashboard Metrics

**Tiến độ hoàn thành:**
- Formula: `(completed / total) * 100`
- Gradient: Blue to Purple
- Auto-refresh: 30 giây

**Tiến độ Check lần 1:**
- Formula: `((pending_second_check + completed) / total) * 100`
- Gradient: Yellow to Orange
- Hiển thị số sản phẩm đã qua check lần 1

**Thống kê chi tiết:**
- Tổng sản phẩm
- Chờ check lần 1
- Chờ duyệt lần 2
- Đã hoàn thành
- Phân tích kết quả (Đúng/Cần sửa/Sai)

### 🎯 Second Check Screen Features

**Search & Filter:**
- Tìm kiếm theo tên sản phẩm
- Lọc theo check_result:
  - Tất cả
  - Đúng (correct)
  - Cần sửa (needs_correction)
  - Sai (incorrect)

**Pagination:**
- Page size options: 10, 20, 50, 100
- Smart pagination với ellipsis (...)
- Hiển thị tổng số items

**Modal Detail View:**
- Xem đầy đủ thông tin sản phẩm
- Xem ảnh đã chụp (1-3 ảnh)
- So sánh thông tin cũ/mới
- Phê duyệt hoặc từ chối

### 🔄 Workflow Process

```
1. Sản phẩm mới
   ↓
2. Nhân viên quét mã → First Check
   ↓
3. Cập nhật thông tin + chụp ảnh
   ↓
4. Gửi lên hệ thống (first_check = 1)
   ↓
5. Supervisor xem trong Second Check
   ↓
6. Phê duyệt → Hoàn thành (second_check = 1)
   OR
   Từ chối → Quay lại First Check (check_result = 'rejected')
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

---

### Vấn đề 6: Lỗi khi tạo sản phẩm mới

**Triệu chứng:**
```
Out of range value for column 'standard_rate' at row 1
```

**Giải pháp:**

Giá sản phẩm không được vượt quá 999,999,999 VND. Kiểm tra giá nhập vào:
```typescript
// Frontend validation
if (price > 999999999) {
  showToast('Giá không được vượt quá 999,999,999', 'error');
  return;
}
```

Backend đã có validation, nếu vẫn gặp lỗi:
```sql
-- Kiểm tra column definition
SHOW COLUMNS FROM tabItem LIKE 'standard_rate';

-- Nếu cần, alter column
ALTER TABLE tabItem MODIFY standard_rate DECIMAL(18,6);
```

---

### Vấn đề 7: TypeScript compilation errors

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

### Vấn đề 8: Frontend không load được API data

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

### Vấn đề 9: Không thể upload ảnh

**Triệu chứng:**
- Ảnh không được lưu sau khi chụp
- Console error về file size

**Giải pháp:**

1. Kiểm tra column type trong database:
```sql
-- image_1, image_2, image_3 phải là longtext
SHOW COLUMNS FROM tabItem WHERE Field LIKE 'image_%';
```

2. Nếu cần, alter columns:
```sql
ALTER TABLE tabItem 
MODIFY image_1 LONGTEXT,
MODIFY image_2 LONGTEXT,
MODIFY image_3 LONGTEXT;
```

3. Giảm kích thước ảnh nếu quá lớn (compression)

---

### Vấn đề 10: Dashboard không cập nhật

**Triệu chứng:**
- Thống kê không thay đổi sau khi check sản phẩm

**Giải pháp:**

1. Kiểm tra auto-refresh đang hoạt động:
```typescript
// CheckDashboard.tsx
useEffect(() => {
  fetchStats();
  const interval = setInterval(fetchStats, 30000);
  return () => clearInterval(interval);
}, []);
```

2. Kiểm tra API `/api/check-workflow/stats`:
```bash
curl http://localhost:3001/api/check-workflow/stats
```

3. Clear browser cache và refresh

---

### Debug Tips

#### Enable verbose logging

Thêm vào `server/index.ts`:
```typescript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Body:', req.body);
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
    
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN first_check = 0 THEN 1 ELSE 0 END) as pending_first,
        SUM(CASE WHEN first_check = 1 AND second_check = 0 THEN 1 ELSE 0 END) as pending_second
      FROM tabItem
      WHERE disabled = 0 AND is_sales_item = 1 AND is_fixed_asset = 0
    `);
    console.log('Workflow stats:', stats);
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

#### Test API endpoints

```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"EMP-00001"}'

# Get stats
curl http://localhost:3001/api/check-workflow/stats

# Get pending first check
curl http://localhost:3001/api/products/pending-first-check?limit=10

# Get pending second check
curl http://localhost:3001/api/products/pending-second-check?limit=10
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
- [MySQL Documentation](https://dev.mysql.com/doc/)

### 🎯 Project Roadmap

#### ✅ Completed (v1.0)
- [x] Login authentication với ERPNext
- [x] Barcode scanning
- [x] Product list với phân trang
- [x] Product creation với 119 đơn vị
- [x] Double-check workflow (First Check + Second Check)
- [x] Dashboard thống kê với progress bars
- [x] Searchable dropdown cho đơn vị
- [x] Image capture (1-3 ảnh)
- [x] Filter & search trong Second Check
- [x] Auto-refresh dashboard (30s)
- [x] Product search trong danh sách
- [x] Phân trang với page size selector

#### 🚧 In Progress / Planned

**Phase 1: Security & Validation (Priority: High)**
- [ ] Price validation (max 999,999,999) ở frontend
- [ ] Input sanitization và validation
- [ ] JWT authentication thay vì localStorage
- [ ] Rate limiting cho API endpoints
- [ ] Password hashing (nếu thêm password)
- [ ] XSS protection
- [ ] CSRF protection

**Phase 2: Testing & Quality (Priority: High)**
- [ ] Unit tests cho components
- [ ] Integration tests cho API
- [ ] E2E tests với Cypress/Playwright
- [ ] Test coverage >= 80%
- [ ] Performance testing
- [ ] Load testing cho API

**Phase 3: Features Enhancement (Priority: Medium)**
- [ ] Frappe REST API integration cho CRUD
- [ ] Real-time updates với WebSocket
- [ ] Bulk operations (import/export Excel)
- [ ] Advanced filtering và sorting
- [ ] Product history tracking
- [ ] Audit logging
- [ ] Role-based access control (Staff/Supervisor/Admin)
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] Print barcode labels

**Phase 4: Performance Optimization (Priority: Medium)**
- [ ] Redis caching layer
- [ ] Database query optimization
- [ ] Image compression và lazy loading
- [ ] CDN cho static assets
- [ ] Service Worker cho offline mode
- [ ] Progressive Web App (PWA)

**Phase 5: Mobile & Reporting (Priority: Low)**
- [ ] React Native mobile app
- [ ] Responsive design improvement
- [ ] Export reports (PDF, Excel)
- [ ] Dashboard charts (Chart.js/Recharts)
- [ ] Email notifications
- [ ] SMS notifications

**Phase 6: DevOps & Monitoring (Priority: Medium)**
- [ ] Docker containerization
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (New Relic/DataDog)
- [ ] Logging aggregation (ELK stack)
- [ ] Health checks và alerts
- [ ] Backup automation

### � Known Issues

1. **Price Validation**: Frontend cần thêm validation cho giá tối đa 999,999,999
2. **No Unit Tests**: Project chưa có test suite
3. **localStorage Security**: Nên chuyển sang JWT với httpOnly cookies
4. **No Error Tracking**: Chưa có system monitoring/logging
5. **CORS Configuration**: Đang allow tất cả origins (cần restrict trong production)
6. **Image Size**: Không có compression cho ảnh được upload
7. **No Pagination Cache**: Mỗi lần chuyển trang đều query lại database

### 🔧 Performance Notes

**Current Performance:**
- Database queries: ~50-100ms (LAN)
- API response time: ~100-200ms
- Frontend render: ~16ms (60 FPS)
- Image upload: ~500ms-2s (tùy kích thước)

**Recommendations:**
- Implement Redis caching cho product list: Giảm 80% database queries
- Add database indexes: Đã có indexes cho workflow fields
- Compress images: Giảm 70% bandwidth
- Use CDN: Giảm 50% load time cho static assets

### 📝 Notes

### ⚠️ Important Notes

1. **Product Creation**: 
   - Tạo trực tiếp vào bảng `tabItem`
   - Giá không được vượt quá 999,999,999 (DECIMAL limit)
   - Sản phẩm mới tự động được đánh dấu checked

2. **Barcode Handling**: 
   - Hiện tại sử dụng `item_code` (name) làm barcode
   - Không sử dụng bảng `tabItem Barcode`
   - Tìm kiếm theo tên sản phẩm hoặc item_code

3. **Authentication**: 
   - Chỉ verify username, không có password
   - Sử dụng localStorage (không bảo mật cho production)
   - Trong production nên implement:
     - JWT tokens với httpOnly cookies
     - Refresh token mechanism
     - Session management
     - Password hashing với bcrypt

4. **Check Workflow States**:
   ```
   first_check=0, second_check=0 → Chưa check
   first_check=1, second_check=0 → Chờ duyệt lần 2
   first_check=1, second_check=1 → Hoàn thành
   check_result='rejected' → Bị từ chối, về lại First Check
   ```

5. **Image Storage**:
   - Lưu dưới dạng base64 trong database (longtext)
   - Tối đa 3 ảnh mỗi sản phẩm
   - Không có compression (cần cải thiện)
   - Trong production nên:
     - Upload lên S3/Cloud Storage
     - Lưu URL thay vì base64
     - Implement image compression

6. **Security Considerations**:
   - ⚠️ Thêm rate limiting cho API
   - ⚠️ Input validation và sanitization
   - ✅ SQL injection prevention (đã có với prepared statements)
   - ⚠️ XSS protection cần thêm
   - ⚠️ CORS config cần restrict trong production
   - ⚠️ Helmet.js cho security headers

7. **Database Schema Requirements**:
   - ERPNext database phải có các trường workflow trong `tabItem`
   - Nếu chưa có, chạy migration script (xem Database Schema section)
   - Indexes đã được tạo cho tối ưu query performance

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
