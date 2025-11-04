# Fix: Lỗi đăng nhập "Username không tồn tại hoặc không hoạt động"

## Vấn đề
Người dùng nhập đúng username (ví dụ: `HR-EMP-00001`) nhưng không đăng nhập được, hệ thống báo lỗi "Username không tồn tại hoặc không hoạt động".

## Nguyên nhân

### Vấn đề chính: So sánh status không chính xác

**Code cũ:**
```typescript
const [employees] = await pool.query<TabEmployee[]>(
  `SELECT name, employee_name, status
   FROM tabEmployee 
   WHERE name = ?
     AND status = 'Active'  // ❌ So sánh trực tiếp, case-sensitive
   LIMIT 1`,
  [username.trim()]
);
```

**Các vấn đề có thể xảy ra:**

1. **Case sensitivity:** 
   - Database có thể lưu: `'Active'`, `'ACTIVE'`, `'active'`, hoặc `'ACTive'`
   - So sánh `status = 'Active'` chỉ khớp chính xác với `'Active'`

2. **Whitespace:**
   - Giá trị trong database có thể có khoảng trắng: `'Active '`, `' Active'`, `'  Active  '`
   - So sánh trực tiếp sẽ fail

3. **Encoding issues:**
   - Có thể có ký tự đặc biệt không nhìn thấy

4. **Query performance:**
   - Filter trong WHERE với string comparison có thể chậm với bảng lớn

## Giải pháp

### Sửa logic kiểm tra status

**Code mới:**
```typescript
app.post('/api/login', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const trimmedUsername = username.trim();

    // Bước 1: Tìm employee theo name (không filter status)
    const [employees] = await pool.query<TabEmployee[]>(
      `SELECT name, employee_name, status
       FROM tabEmployee 
       WHERE name = ?
       LIMIT 1`,
      [trimmedUsername]
    );

    if (!employees || employees.length === 0) {
      return res.status(401).json({ error: 'Username không tồn tại' });
    }

    const employee = employees[0];
    
    // Bước 2: Check status trong JavaScript với normalize
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
```

## Cải tiến

### 1. Tách riêng validation từng bước

**Trước:**
- 1 lỗi chung: "Username không tồn tại hoặc không hoạt động"
- Không biết username sai hay status sai

**Sau:**
- Username không tồn tại → "Username không tồn tại"
- Username đúng nhưng không active → "Tài khoản không hoạt động" + trả về status value

### 2. Normalize status value

```typescript
const status = employee.status?.trim().toLowerCase();
```

- `?.` - Optional chaining: an toàn nếu status là null/undefined
- `.trim()` - Loại bỏ khoảng trắng đầu/cuối
- `.toLowerCase()` - Chuyển về chữ thường để so sánh

### 3. So sánh case-insensitive

```typescript
if (status !== 'active') {
  // Reject
}
```

Chấp nhận: `'Active'`, `'ACTIVE'`, `'active'`, `' Active '`, etc.

### 4. Error messages rõ ràng

```json
// Username không tồn tại
{
  "error": "Username không tồn tại"
}

// Tài khoản không active
{
  "error": "Tài khoản không hoạt động",
  "status": "Left"  // Hoặc giá trị status thực tế
}
```

## Testing

### Test cases

#### 1. Username hợp lệ, Active
```bash
node test-api.js "HR-EMP-00001"
# Expected: Status 200, Login success
```

#### 2. Username không tồn tại
```bash
node test-api.js "NOTFOUND-123"
# Expected: Status 401, "Username không tồn tại"
```

#### 3. Username tồn tại nhưng không Active
```bash
# Giả sử có employee với status = "Left"
node test-api.js "HR-EMP-00002"
# Expected: Status 401, "Tài khoản không hoạt động"
```

#### 4. Status với whitespace
```sql
-- Test data với whitespace
UPDATE tabEmployee SET status = ' Active ' WHERE name = 'TEST-EMP-001';
```
```bash
node test-api.js "TEST-EMP-001"
# Expected: Status 200 (vẫn login được nhờ trim())
```

#### 5. Status với case khác nhau
```sql
-- Test với các variations
UPDATE tabEmployee SET status = 'ACTIVE' WHERE name = 'TEST-EMP-002';
UPDATE tabEmployee SET status = 'active' WHERE name = 'TEST-EMP-003';
```
```bash
node test-api.js "TEST-EMP-002"
node test-api.js "TEST-EMP-003"
# Expected: Cả 2 đều Status 200 (nhờ toLowerCase())
```

## So sánh performance

### Query cũ (filter trong WHERE)
```sql
SELECT name, employee_name, status
FROM tabEmployee 
WHERE name = ? AND status = 'Active'
```
- ✅ Faster nếu có index trên (name, status)
- ❌ Không linh hoạt với variations
- ❌ Khó debug khi fail

### Query mới (filter trong code)
```sql
SELECT name, employee_name, status
FROM tabEmployee 
WHERE name = ?
```
- ✅ Linh hoạt với status variations
- ✅ Error message rõ ràng hơn
- ✅ Dễ debug
- ⚠️ Slightly slower nếu không có index trên name
- ⚠️ Load thêm data không cần thiết (nhưng chỉ 1 record)

**Trade-off:** Đổi một chút performance để có flexibility và better UX

## Cách kiểm tra status trong database

### Xem các giá trị status hiện có
```sql
SELECT DISTINCT 
  status, 
  CHAR_LENGTH(status) as length,
  HEX(status) as hex_value,
  COUNT(*) as count
FROM tabEmployee
GROUP BY status;
```

### Kết quả mẫu
```
+----------+--------+----------+-------+
| status   | length | hex_value| count |
+----------+--------+----------+-------+
| Active   | 6      | 416374697665 | 150 |
| Left     | 4      | 4C656674     | 25  |
| Suspended| 9      | 53757370... | 5   |
+----------+--------+----------+-------+
```

### Check employee cụ thể
```sql
SELECT 
  name,
  employee_name,
  status,
  CHAR_LENGTH(status) as status_length,
  HEX(status) as status_hex
FROM tabEmployee 
WHERE name = 'HR-EMP-00001';
```

## Recommended improvements (Tương lai)

### 1. Thêm index cho performance
```sql
CREATE INDEX idx_employee_name ON tabEmployee(name);
CREATE INDEX idx_employee_status ON tabEmployee(status);
```

### 2. Standardize status values
```sql
-- Update tất cả variations về 'Active'
UPDATE tabEmployee 
SET status = 'Active' 
WHERE LOWER(TRIM(status)) = 'active';
```

### 3. Add constraint
```sql
ALTER TABLE tabEmployee 
ADD CONSTRAINT chk_status 
CHECK (status IN ('Active', 'Left', 'Suspended'));
```

### 4. Cache frequent queries
```typescript
// Redis cache cho employees
const cachedEmployee = await redis.get(`employee:${username}`);
if (cachedEmployee) {
  return JSON.parse(cachedEmployee);
}
// ... query database
await redis.setex(`employee:${username}`, 3600, JSON.stringify(employee));
```

## Kết luận

✅ **Root cause:** So sánh status case-sensitive trong SQL WHERE clause

✅ **Solution:** 
- Tách validation thành 2 bước
- Normalize status value trong code
- Case-insensitive comparison

✅ **Benefits:**
- Chấp nhận nhiều variations của status value
- Error messages rõ ràng hơn
- Dễ debug và maintain

✅ **Trade-off:**
- Slightly more code
- Minimal performance impact (acceptable)
- Much better UX and reliability
