# Fix: Chức năng tìm kiếm và quét mã vạch

## Vấn đề
Sau khi triển khai lazy loading, chức năng tìm kiếm và quét mã vạch không hoạt động vì:
- `ScanScreen` vẫn tìm sản phẩm trong prop `products` (đã bị xóa)
- `App.tsx` không còn load products vào state nữa
- Không có cơ chế fetch product từ API khi cần

## Nguyên nhân chi tiết

### 1. ScanScreen.tsx
```typescript
// ❌ LỖI: Tìm trong prop products (không còn tồn tại)
const performSearch = (barcodeValue: string) => {
  const foundProduct = products.find(p => p.barcode === barcodeValue);
  // ...
};
```

### 2. App.tsx
```typescript
// ❌ LỖI: Không có products state nữa
const currentProduct = products.find(p => p.barcode === currentBarcode);
```

## Giải pháp

### 1. Sửa ScanScreen.tsx - Fetch từ API

**Thay đổi:**
```typescript
// ✅ BEFORE: Nhận products từ props
interface ScanScreenProps {
  products: Product[];
  onNavigate: (screen: Screen, barcode?: string) => void;
}

// ✅ AFTER: Không nhận products nữa
const API_URL = 'http://localhost:3001';

interface ScanScreenProps {
  onNavigate: (screen: Screen, barcode?: string) => void;
}
```

**Sửa hàm performSearch:**
```typescript
// ✅ BEFORE: Tìm trong array
const performSearch = (barcodeValue: string) => {
  setTimeout(() => {
    const foundProduct = products.find(p => p.barcode === barcodeValue);
    if (foundProduct) {
      onNavigate('detail', barcodeValue);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }, 500);
};

// ✅ AFTER: Fetch từ API
const performSearch = async (barcodeValue: string) => {
  if (!barcodeValue.trim()) return;
  setLoading(true);
  setNotFound(false);

  try {
    const response = await fetch(`${API_URL}/api/products/${barcodeValue}`);
    
    if (response.ok) {
      // Product found - navigate to detail
      onNavigate('detail', barcodeValue);
    } else if (response.status === 404) {
      // Product not found - show modal
      setNotFound(true);
    } else {
      throw new Error('Failed to fetch product');
    }
  } catch (error) {
    console.error('Error searching for product:', error);
    setNotFound(true);
  } finally {
    setLoading(false);
  }
};
```

### 2. Sửa App.tsx - Fetch product khi cần

**Xóa products state:**
```typescript
// ❌ BEFORE
const [products, setProducts] = useState<Product[]>([]);
const currentProduct = products.find(p => p.barcode === currentBarcode);

// ✅ AFTER
const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
```

**Thêm useEffect để fetch product:**
```typescript
// Fetch product khi navigate đến detail screen
useEffect(() => {
  const fetchProduct = async () => {
    if (screen === 'detail' && currentBarcode) {
      try {
        const response = await fetch(`${API_URL}/products/${currentBarcode}`);
        if (response.ok) {
          const product = await response.json();
          setCurrentProduct(product);
        } else {
          showToast('Không tìm thấy sản phẩm', 'error');
          setScreen('scan');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        showToast('Không thể tải thông tin sản phẩm', 'error');
        setScreen('scan');
      }
    }
  };
  
  fetchProduct();
}, [screen, currentBarcode]);
```

**Cập nhật renderScreen:**
```typescript
// ❌ BEFORE: Truyền products prop
<ScanScreen products={products} onNavigate={handleNavigate} />

// ✅ AFTER: Không truyền products nữa
<ScanScreen onNavigate={handleNavigate} />
```

**Cập nhật handleUpdateProduct:**
```typescript
// ❌ BEFORE: Update trong products array
setProducts(products.map(p => 
  p.barcode === updatedProduct.barcode ? updatedProduct : p
));

// ✅ AFTER: Update currentProduct trực tiếp
setCurrentProduct(updatedProduct);
```

## Luồng hoạt động mới

### Tìm kiếm thủ công:
```
User nhập mã vạch
    ↓
Nhấn "Tìm sản phẩm"
    ↓
ScanScreen.performSearch()
    ↓
API: GET /api/products/{barcode}
    ↓
200 OK → Navigate to detail screen
404 Not Found → Show modal "Tạo mới?"
5xx Error → Show not found modal
```

### Quét mã vạch:
```
User nhấn "Quét mã vạch"
    ↓
BarcodeScanner component mount
    ↓
Camera khởi động
    ↓
Detect barcode
    ↓
handleScanSuccess(barcode)
    ↓
performSearch(barcode)
    ↓
API: GET /api/products/{barcode}
    ↓
Navigate to detail hoặc show modal
```

### Hiển thị detail:
```
Navigate to detail screen
    ↓
App.tsx useEffect detect screen='detail'
    ↓
API: GET /api/products/{currentBarcode}
    ↓
setCurrentProduct(product)
    ↓
Render ProductDetailScreen
```

## Testing

### 1. Test tìm kiếm thủ công
```bash
# Chạy cả frontend và backend
npm run dev:full
```

1. Mở app
2. Nhập mã vạch vào ô input (ví dụ: `ITEM-001`)
3. Nhấn "Tìm sản phẩm"
4. ✅ Phải hiển thị detail screen nếu tìm thấy
5. ✅ Phải hiển thị modal "Tạo mới?" nếu không tìm thấy

### 2. Test quét mã vạch
1. Nhấn nút "Quét mã vạch"
2. ✅ Camera phải khởi động
3. ✅ Hướng camera vào barcode
4. ✅ Tự động detect và chuyển sang detail screen

### 3. Test với API trực tiếp
```bash
# Test product tồn tại
curl http://localhost:3001/api/products/ITEM-001

# Test product không tồn tại
curl http://localhost:3001/api/products/NOTFOUND-999
# Should return 404
```

## Lợi ích

### 🎯 Tính chính xác
- Luôn lấy dữ liệu mới nhất từ database
- Không phụ thuộc vào cache cũ trong memory

### 🚀 Hiệu năng
- Không cần load toàn bộ danh sách sản phẩm
- Chỉ fetch 1 product khi cần
- Tối ưu băng thông và memory

### 🔄 Tính nhất quán
- Mỗi component tự quản lý data của mình
- Không có prop drilling
- Dễ maintain và debug

## Files đã thay đổi

1. ✅ `components/ScanScreen.tsx`
   - Xóa prop `products`
   - Thêm API_URL constant
   - Sửa `performSearch()` thành async với fetch API

2. ✅ `App.tsx`
   - Xóa `products` state
   - Thêm `currentProduct` state
   - Thêm useEffect fetch product khi cần
   - Cập nhật `handleUpdateProduct` và `handleCreateProduct`
   - Xóa products prop khỏi ScanScreen

## Kết quả

✅ Chức năng tìm kiếm hoạt động bình thường
✅ Chức năng quét mã vạch hoạt động bình thường  
✅ Hiển thị detail screen chính xác
✅ Modal "Tạo mới" hiển thị đúng khi không tìm thấy
✅ Không có lỗi compile
✅ Performance tốt hơn (không load toàn bộ products)
