-- Script tạo 5 dữ liệu mẫu cho bảng tabItem
-- Chạy script này để test hệ thống double-check workflow

INSERT INTO tabItem (
  name, 
  item_code, 
  item_name, 
  standard_rate, 
  stock_uom, 
  disabled, 
  is_sales_item, 
  is_fixed_asset, 
  is_stock_item,
  creation, 
  modified, 
  owner, 
  modified_by, 
  docstatus, 
  idx,
  first_check,
  second_check
) VALUES 
-- Sản phẩm 1: Nước ngọt Coca Cola (chưa check)
(
  'TEST-PRODUCT-001', 
  'TEST-PRODUCT-001', 
  'Nước ngọt Coca Cola 330ml', 
  12000.00, 
  'Lon', 
  0, 
  1, 
  0, 
  1, 
  NOW(), 
  NOW(), 
  'Administrator', 
  'Administrator', 
  0, 
  0,
  0,
  0
),

-- Sản phẩm 2: Bánh mì sandwich (chưa check)
(
  'TEST-PRODUCT-002', 
  'TEST-PRODUCT-002', 
  'Bánh mì sandwich 60g', 
  8500.00, 
  'Cái', 
  0, 
  1, 
  0, 
  1, 
  NOW(), 
  NOW(), 
  'Administrator', 
  'Administrator', 
  0, 
  0,
  0,
  0
),

-- Sản phẩm 3: Sữa tươi Vinamilk (chưa check)
(
  'TEST-PRODUCT-003', 
  'TEST-PRODUCT-003', 
  'Sữa tươi Vinamilk hộp 1L', 
  35000.00, 
  'Hộp', 
  0, 
  1, 
  0, 
  1, 
  NOW(), 
  NOW(), 
  'Administrator', 
  'Administrator', 
  0, 
  0,
  0,
  0
),

-- Sản phẩm 4: Mì gói Hảo Hảo (chưa check)
(
  'TEST-PRODUCT-004', 
  'TEST-PRODUCT-004', 
  'Mì gói Hảo Hảo tôm chua cay', 
  3500.00, 
  'Gói', 
  0, 
  1, 
  0, 
  1, 
  NOW(), 
  NOW(), 
  'Administrator', 
  'Administrator', 
  0, 
  0,
  0,
  0
),

-- Sản phẩm 5: Nước suối Lavie (chưa check)
(
  'TEST-PRODUCT-005', 
  'TEST-PRODUCT-005', 
  'Nước suối Lavie 500ml', 
  5000.00, 
  'Chai', 
  0, 
  1, 
  0, 
  1, 
  NOW(), 
  NOW(), 
  'Administrator', 
  'Administrator', 
  0, 
  0,
  0,
  0
)

ON DUPLICATE KEY UPDATE 
  item_name = VALUES(item_name),
  standard_rate = VALUES(standard_rate),
  stock_uom = VALUES(stock_uom),
  modified = NOW();

-- Kiểm tra dữ liệu đã insert
SELECT 
  name as 'Mã SP',
  item_name as 'Tên sản phẩm',
  standard_rate as 'Giá',
  stock_uom as 'Đơn vị',
  first_check as 'Check 1',
  second_check as 'Check 2'
FROM tabItem 
WHERE name LIKE 'TEST-PRODUCT-%'
ORDER BY name;
