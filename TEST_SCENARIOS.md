# 🧪 Test Data - Hướng Dẫn Test Hệ Thống

## ✅ Dữ liệu mẫu đã được tạo thành công!

### 📦 5 Sản phẩm test:

| Mã sản phẩm | Tên sản phẩm | Giá | Đơn vị | Status |
|-------------|--------------|-----|---------|---------|
| **TEST-PRODUCT-001** | Nước ngọt Coca Cola 330ml | 12,000đ | Lon | ⏳ Chưa check |
| **TEST-PRODUCT-002** | Bánh mì sandwich 60g | 8,500đ | Cái | ⏳ Chưa check |
| **TEST-PRODUCT-003** | Sữa tươi Vinamilk hộp 1L | 35,000đ | Hộp | ⏳ Chưa check |
| **TEST-PRODUCT-004** | Mì gói Hảo Hảo tôm chua cay | 3,500đ | Gói | ⏳ Chưa check |
| **TEST-PRODUCT-005** | Nước suối Lavie 500ml | 5,000đ | Chai | ⏳ Chưa check |

---

## 🎯 Kịch bản test Double-Check Workflow

### Scenario 1: Sản phẩm ĐÚNG ✅
**Sản phẩm:** TEST-PRODUCT-001 (Coca Cola)

1. Quét barcode: `TEST-PRODUCT-001`
2. Vào màn hình kiểm tra lần 1
3. Chọn **"Đúng"**
4. Nhập tồn kho: `100`
5. Có thể chụp ảnh (không bắt buộc)
6. Hoàn thành → Sản phẩm được đánh dấu hoàn thành

**Kết quả mong đợi:**
- `first_check = 1`
- `second_check = 0` (không cần duyệt)
- `check_result = 'correct'`

---

### Scenario 2: Sản phẩm CẦN SỬA ⚠️
**Sản phẩm:** TEST-PRODUCT-002 (Bánh mì)

1. Quét barcode: `TEST-PRODUCT-002`
2. Vào màn hình kiểm tra lần 1
3. Chọn **"Cần sửa"**
4. Nhập thông tin mới:
   - Tên mới: `Bánh mì sandwich trứng 60g`
   - Giá mới: `9000`
   - Đơn vị: `Cái`
5. **BẮT BUỘC chụp ít nhất 1 ảnh**
6. Nhập tồn kho: `50`
7. Hoàn thành

**Chuyển sang Supervisor:**
8. Đăng nhập bằng tài khoản supervisor
9. Vào "Second Check"
10. Xem sản phẩm TEST-PRODUCT-002 trong danh sách chờ duyệt
11. Kiểm tra thông tin và ảnh
12. **Duyệt** hoặc **Từ chối**

**Kết quả mong đợi:**
- `first_check = 1`
- `second_check = 1` (sau khi duyệt)
- `check_result = 'needs_correction'`
- Thông tin sản phẩm được cập nhật nếu duyệt

---

### Scenario 3: Sản phẩm SAI ❌
**Sản phẩm:** TEST-PRODUCT-003 (Sữa Vinamilk)

1. Quét barcode: `TEST-PRODUCT-003`
2. Vào màn hình kiểm tra lần 1
3. Chọn **"Sai"**
4. Nhập barcode mới: `VNM-MILK-001`
5. Nhập thông tin thực tế:
   - Tên: `Sữa tươi Vinamilk không đường 1L`
   - Giá: `38000`
   - Đơn vị: `Hộp`
6. **BẮT BUỘC chụp ảnh**
7. **BẮT BUỘC nhập ghi chú:** `Sản phẩm bị nhầm lẫn với phiên bản có đường`
8. Nhập tồn kho: `30`
9. Hoàn thành

**Chuyển sang Supervisor:**
10. Supervisor phải xử lý sản phẩm SAI với priority cao
11. Kiểm tra kỹ thông tin và ảnh
12. Quyết định duyệt hoặc từ chối

**Kết quả mong đợi:**
- `first_check = 1`
- `second_check = 1` (sau khi duyệt)
- `check_result = 'incorrect'`
- Priority cao trong danh sách chờ duyệt

---

### Scenario 4: Test Dashboard 📊
1. Vào "Check Dashboard"
2. Xem thống kê:
   - Tổng sản phẩm: 5
   - Đã kiểm tra lần 1: 3
   - Đã duyệt lần 2: X
   - Chờ duyệt: Y

**Kết quả mong đợi:**
- Progress bar hiển thị đúng tỷ lệ
- Số liệu cập nhật realtime (refresh 30s)

---

### Scenario 5: Test từ chối (Reject) ❌
**Sản phẩm:** TEST-PRODUCT-004 (Mì Hảo Hảo)

1. Nhân viên kiểm tra và chọn "Cần sửa"
2. Nhập thông tin sai (giá quá cao: `50000`)
3. Chụp ảnh không rõ
4. Hoàn thành

**Supervisor:**
5. Xem sản phẩm trong "Second Check"
6. Nhận thấy thông tin không chính xác
7. **TỪ CHỐI** với lý do
8. Sản phẩm quay lại trạng thái chưa check

**Kết quả mong đợi:**
- `first_check = 0` (reset)
- `second_check = 0` (reset)
- Nhân viên phải kiểm tra lại

---

## 🔄 Reset dữ liệu test

Nếu muốn reset tất cả để test lại:

```sql
UPDATE tabItem 
SET 
  first_check = 0,
  second_check = 0,
  check_result = NULL,
  checked_by = NULL,
  approved_by = NULL,
  check_date = NULL,
  approval_date = NULL,
  new_product_name = NULL,
  new_unit = NULL,
  new_price = NULL,
  stock = NULL,
  image_1 = NULL,
  image_2 = NULL,
  image_3 = NULL
WHERE name LIKE 'TEST-PRODUCT-%';
```

Hoặc chạy:
```bash
node reset-test-data.js
```

---

## 📱 Test trên Mobile (Ngrok)

1. Chạy ngrok tunnels:
   ```powershell
   .\start-ngrok-tunnel.ps1
   ```

2. Lấy Backend ngrok URL và cập nhật `.env.production`

3. Mở Frontend ngrok URL trên điện thoại

4. Test tất cả scenarios trên điện thoại thật

---

## 🎨 UI Elements cần test

### FirstCheckScreen:
- ✅ Radio buttons: Đúng / Cần sửa / Sai
- ✅ Form hiển thị động theo lựa chọn
- ✅ Validation ảnh (BẮT BUỘC cho "Cần sửa" và "Sai")
- ✅ Validation ghi chú (BẮT BUỘC cho "Sai")
- ✅ Upload ảnh (tối đa 3 ảnh)
- ✅ Preview và xóa ảnh
- ✅ Submit button màu khác nhau theo status

### SecondCheckScreen:
- ✅ Danh sách pending (2 cột layout)
- ✅ Filter theo priority (Sai > Cần sửa)
- ✅ Hiển thị đầy đủ thông tin cũ/mới
- ✅ Hiển thị ảnh minh chứng
- ✅ Nút Duyệt / Từ chối
- ✅ Confirmation dialog

### CheckDashboard:
- ✅ 4 stat cards
- ✅ Progress bar
- ✅ Auto-refresh 30s
- ✅ Navigation buttons

---

## 📊 Kiểm tra Database

```sql
-- Xem tất cả sản phẩm test
SELECT * FROM tabItem WHERE name LIKE 'TEST-PRODUCT-%';

-- Xem thống kê
SELECT 
  COUNT(*) as total,
  SUM(first_check) as first_checked,
  SUM(second_check) as second_checked,
  SUM(CASE WHEN first_check = 1 AND second_check = 0 THEN 1 ELSE 0 END) as pending_approval
FROM tabItem 
WHERE name LIKE 'TEST-PRODUCT-%' AND is_fixed_asset = 0;
```

---

## ✅ Checklist Test

- [ ] Scenario 1: Sản phẩm ĐÚNG
- [ ] Scenario 2: Sản phẩm CẦN SỬA (approve)
- [ ] Scenario 3: Sản phẩm SAI (approve)
- [ ] Scenario 4: Dashboard statistics
- [ ] Scenario 5: Từ chối sản phẩm
- [ ] Test trên Desktop
- [ ] Test trên Mobile
- [ ] Test image upload
- [ ] Test validation
- [ ] Test auto-refresh dashboard
- [ ] Test navigation flow
- [ ] Test CORS với ngrok
- [ ] Test API endpoints

---

**🎉 Chúc bạn test thành công!**
