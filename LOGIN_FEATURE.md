# Chức năng Đăng nhập - Hướng dẫn sử dụng

## Tổng quan
Đã triển khai chức năng đăng nhập đơn giản với username từ bảng `tabEmployee` trong database ERPNext. Người dùng phải đăng nhập trước khi sử dụng hệ thống.

## Các thay đổi

### 1. Backend API - Login Endpoint

**File:** `server/index.ts`

**Endpoint mới:**
```typescript
POST /api/login
```

**Request Body:**
```json
{
  "username": "EMP-001"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "username": "EMP-001",
  "employeeName": "Nguyễn Văn A"
}
```

**Response Error (401):**
```json
{
  "error": "Username không tồn tại hoặc không hoạt động"
}
```

**Cách hoạt động:**
```sql
SELECT name, employee_name, status
FROM tabEmployee 
WHERE name = ? AND status = 'Active'
LIMIT 1
```

- ✅ Chỉ chấp nhận employee có status = 'Active'
- ✅ Trả về name (username) và employee_name (tên hiển thị)

### 2. Frontend Components

#### LoginScreen.tsx (Mới)

**Tính năng:**
- Form đăng nhập với input username
- Validation: không được để trống
- Loading state khi đang xác thực
- Hiển thị lỗi nếu username không hợp lệ
- UI đẹp với gradient background và animations

**Giao diện:**
```
┌──────────────────────────┐
│     [User Icon]          │
│  Kiểm tra sản phẩm       │
│  Đăng nhập để tiếp tục   │
│                          │
│  Username                │
│  [_______________]       │
│                          │
│  [   Đăng nhập   ]       │
│                          │
└──────────────────────────┘
```

**Props:**
```typescript
interface LoginScreenProps {
  onLoginSuccess: (username: string, employeeName: string) => void;
}
```

#### ScanScreen.tsx (Cập nhật)

**Thêm:**
- Hiển thị thông tin user đã login trong header
- Nút đăng xuất
- Props mới: `user` và `onLogout`

**Header mới:**
```
┌────────────────────────────────────┐
│ Kiểm tra sản phẩm    [Đăng xuất] │
│ Nguyễn Văn A • EMP-001            │
└────────────────────────────────────┘
```

### 3. App.tsx (Cập nhật chính)

**State mới:**
```typescript
const [screen, setScreen] = useState<Screen>('login'); // Bắt đầu từ login
const [user, setUser] = useState<User | null>(null);
```

**LocalStorage:**
- Tự động lưu thông tin user sau khi login
- Tự động load user từ localStorage khi mở lại app
- Xóa user khỏi localStorage khi logout

**Flow:**
```typescript
// Khi app khởi động
useEffect(() => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    setUser(JSON.parse(savedUser));
    setScreen('scan'); // Skip login nếu đã có user
  }
}, []);
```

**Các hàm mới:**
```typescript
// Xử lý login thành công
const handleLoginSuccess = (username: string, employeeName: string) => {
  const userData: User = { username, employeeName };
  setUser(userData);
  localStorage.setItem('user', JSON.stringify(userData));
  setScreen('scan');
  showToast(`Xin chào, ${employeeName}!`, 'success');
};

// Xử lý logout
const handleLogout = () => {
  setUser(null);
  localStorage.removeItem('user');
  setScreen('login');
  showToast('Đã đăng xuất', 'success');
};
```

**Render Logic:**
```typescript
const renderScreen = () => {
  // Guard: Nếu chưa login, chỉ hiển thị LoginScreen
  if (!user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Đã login, hiển thị các màn hình chức năng
  switch (screen) {
    case 'scan':
      return <ScanScreen user={user} onLogout={handleLogout} />;
    // ... các screen khác
  }
};
```

### 4. Types.ts (Cập nhật)

**Screen type:**
```typescript
export type Screen = 'login' | 'scan' | 'detail' | 'create' | 'list';
```

**User interface:**
```typescript
export interface User {
  username: string;      // EMP-001
  employeeName: string;  // Nguyễn Văn A
}
```

## Luồng hoạt động

### 1. Lần đầu tiên sử dụng
```
Mở app
    ↓
Check localStorage → Không có user
    ↓
Hiển thị LoginScreen
    ↓
User nhập username: "EMP-001"
    ↓
Submit form
    ↓
POST /api/login { username: "EMP-001" }
    ↓
Database: SELECT * FROM tabEmployee WHERE name='EMP-001'
    ↓
Found & Active → Return { username, employeeName }
    ↓
handleLoginSuccess()
    ↓
- Save to localStorage
- Set user state
- Navigate to 'scan'
    ↓
Show toast: "Xin chào, Nguyễn Văn A!"
```

### 2. Mở lại app (đã từng login)
```
Mở app
    ↓
useEffect() → Check localStorage
    ↓
Found user data
    ↓
Parse JSON → setUser()
    ↓
setScreen('scan')
    ↓
Vào thẳng màn hình chính (skip login)
```

### 3. Đăng xuất
```
User nhấn nút "Đăng xuất"
    ↓
handleLogout()
    ↓
- Clear user state
- Remove from localStorage
- Navigate to 'login'
    ↓
Show toast: "Đã đăng xuất"
    ↓
Hiển thị LoginScreen
```

### 4. Login thất bại
```
User nhập username không hợp lệ
    ↓
POST /api/login
    ↓
Database: Employee not found hoặc status != 'Active'
    ↓
Return 401 { error: "..." }
    ↓
Hiển thị error message màu đỏ
    ↓
User có thể thử lại
```

## Testing

### 1. Test với username hợp lệ

**Chuẩn bị:**
Kiểm tra database có employee nào active:
```sql
SELECT name, employee_name, status 
FROM tabEmployee 
WHERE status = 'Active' 
LIMIT 5;
```

**Các bước test:**
1. Chạy app: `npm run dev:full`
2. Mở http://localhost:5173
3. Nhập username từ kết quả query (ví dụ: `EMP-001`)
4. Nhấn "Đăng nhập"
5. ✅ Phải hiển thị toast "Xin chào, [Tên]"
6. ✅ Phải chuyển sang màn hình Scan
7. ✅ Header phải hiển thị tên và username
8. ✅ Có nút "Đăng xuất" ở góc phải

### 2. Test với username không hợp lệ

1. Nhập username không tồn tại: `NOTFOUND-123`
2. Nhấn "Đăng nhập"
3. ✅ Phải hiển thị lỗi màu đỏ
4. ✅ Vẫn ở màn hình login

### 3. Test LocalStorage persistence

1. Login thành công
2. F5 (refresh page)
3. ✅ Phải tự động login lại
4. ✅ Vào thẳng màn hình Scan
5. ✅ Hiển thị đúng thông tin user

### 4. Test Logout

1. Đang ở màn hình Scan (đã login)
2. Nhấn nút "Đăng xuất"
3. ✅ Phải hiển thị toast "Đã đăng xuất"
4. ✅ Chuyển về màn hình Login
5. F5 (refresh)
6. ✅ Vẫn ở màn hình Login (không auto-login)

### 5. Test API trực tiếp

```bash
# Test với username hợp lệ
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"EMP-001"}'

# Response mong đợi:
# {"success":true,"username":"EMP-001","employeeName":"Nguyễn Văn A"}

# Test với username không hợp lệ
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"INVALID"}'

# Response mong đợi:
# {"error":"Username không tồn tại hoặc không hoạt động"}
```

## Bảo mật

### ⚠️ Lưu ý quan trọng

**Đây là phiên bản đơn giản chỉ phù hợp cho môi trường nội bộ:**
- ❌ Không có mật khẩu
- ❌ Không có JWT/token
- ❌ Không có session management
- ❌ LocalStorage có thể bị XSS

**Cải thiện cho production:**

1. **Thêm mật khẩu:**
```typescript
// API
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  // Verify password hash
  const validPassword = await bcrypt.compare(password, user.password_hash);
});
```

2. **Sử dụng JWT:**
```typescript
// Generate token
const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '8h' });

// Verify token trong mọi API request
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.user = decoded;
    next();
  });
};
```

3. **HttpOnly Cookie thay vì LocalStorage:**
```typescript
// Set cookie
res.cookie('auth_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 8 * 60 * 60 * 1000 // 8 hours
});
```

4. **Rate limiting:**
```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // Max 5 attempts
});

app.post('/api/login', loginLimiter, async (req, res) => {
  // ...
});
```

## Files thay đổi

### Tạo mới:
1. ✅ `components/LoginScreen.tsx` - UI đăng nhập

### Cập nhật:
1. ✅ `server/index.ts` - Thêm API login
2. ✅ `types.ts` - Thêm User interface và 'login' screen
3. ✅ `App.tsx` - Logic login/logout, localStorage
4. ✅ `components/ScanScreen.tsx` - Hiển thị user info, nút logout

## Kết quả

✅ **Chức năng hoàn chỉnh:**
- Màn hình đăng nhập đẹp mắt
- Xác thực username từ database
- Hiển thị thông tin user sau khi login
- Tự động login lại khi mở lại app
- Đăng xuất và xóa session

✅ **User Experience:**
- Flow đơn giản, dễ sử dụng
- Loading states rõ ràng
- Error handling tốt
- Toast notifications thông minh

✅ **Performance:**
- LocalStorage cache giảm API calls
- Fast authentication check
- Smooth transitions

## Cách sử dụng cho người dùng cuối

1. **Lần đầu sử dụng:**
   - Mở app
   - Nhập username (lấy từ quản lý hoặc IT)
   - Nhấn "Đăng nhập"
   - Bắt đầu sử dụng

2. **Các lần sau:**
   - Mở app
   - Tự động vào màn hình chính (đã nhớ)

3. **Khi kết thúc ca làm việc:**
   - Nhấn "Đăng xuất" ở góc phải header
   - Người khác có thể đăng nhập

4. **Nếu quên đăng xuất:**
   - Người tiếp theo có thể đăng xuất tài khoản cũ
   - Sau đó đăng nhập tài khoản của mình
