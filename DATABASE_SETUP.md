# Supermarket Product Checker - Database Integration

## 🚀 Hướng dẫn chạy dự án

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Khởi động API Server và Frontend cùng lúc
```bash
npm run dev:full
```

Hoặc chạy riêng lẻ:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - API Server:**
```bash
npm run server
```

### 3. Truy cập ứng dụng
- Frontend: http://localhost:3000
- API Server: http://localhost:3001
- Health Check: http://localhost:3001/health

## 📊 Database Configuration

File `.env.local` đã được cấu hình kết nối đến MySQL database:
```
DB_CONNECTION=mysql
DB_HOST=45.32.100.86
DB_PORT=3306
DB_DATABASE=edusys_ai_2025_v1
DB_USERNAME=edu
DB_PASSWORD=EduStrongPass!2025
```

## 🗄️ Database Schema

Ứng dụng sử dụng các bảng từ ERPNext/Frappe:

### `tabItem`
- `name`: Mã sản phẩm (item_code)
- `item_name`: Tên sản phẩm
- `standard_rate`: Giá bán
- `stock_uom`: Đơn vị tính
- `disabled`: Trạng thái (0=active, 1=disabled)
- `is_sales_item`: Có phải sản phẩm bán không
- `is_fixed_asset`: Có phải tài sản cố định không

### `tabItem Barcode`
- `barcode`: Mã vạch
- `parent`: Mã sản phẩm (FK to tabItem.name)

## 🔌 API Endpoints

### GET `/api/products`
Lấy danh sách tất cả sản phẩm (giới hạn 500 items)

**Response:**
```json
[
  {
    "barcode": "8934563123456",
    "name": "Sữa tươi Vinamilk 1L",
    "price": 35000,
    "unit": "hộp",
    "checked": false
  }
]
```

### GET `/api/products/:barcode`
Lấy thông tin sản phẩm theo barcode

**Response:**
```json
{
  "barcode": "8934563123456",
  "name": "Sữa tươi Vinamilk 1L",
  "price": 35000,
  "unit": "hộp",
  "checked": false
}
```

### POST `/api/products`
Tạo sản phẩm mới (requires Frappe API integration)

### PUT `/api/products/:barcode`
Cập nhật sản phẩm (requires Frappe API integration)

## 📁 Cấu trúc dự án

```
supermarket-product-checker/
├── server/
│   ├── db.ts           # Database connection pool
│   └── index.ts        # Express API server
├── components/
│   ├── ScanScreen.tsx
│   ├── ProductListScreen.tsx
│   ├── ProductDetailScreen.tsx
│   └── CreateProductScreen.tsx
├── App.tsx             # Main app with API integration
├── .env.local          # Database credentials
└── package.json
```

## 🔧 Technologies

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Express + TypeScript
- **Database**: MySQL (ERPNext/Frappe)
- **ORM**: mysql2 (Promise-based)

## ⚡ Performance Optimizations

- Connection pooling (max 10 connections)
- Bulk queries để giảm N+1 problem
- Limit 500 items per query
- Async/await error handling

## 📝 Notes

- Create/Update operations cần tích hợp với Frappe API để đảm bảo data consistency
- `checked` status được quản lý local (chưa sync với database)
- Frontend cache products sau khi load lần đầu
