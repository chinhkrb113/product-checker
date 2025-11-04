
import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  { barcode: '8934563123456', name: 'Sữa tươi Vinamilk 1L', price: 35000, unit: 'hộp', checked: true },
  { barcode: '8936036021422', name: 'Nước mắm Chinsu', price: 22000, unit: 'chai', checked: false },
  { barcode: '8934752001153', name: 'Bánh mì sandwich', price: 18000, unit: 'gói', checked: false },
  { barcode: '8934822012345', name: 'Dầu ăn Tường An 1L', price: 45000, unit: 'chai', checked: true },
  { barcode: '8934567890123', name: 'Gạo ST25 túi 5kg', price: 150000, unit: 'kg', checked: false },
  { barcode: '1234567890123', name: 'Coca-Cola Zero 1.5L', price: 19000, unit: 'chai', checked: false },
  { barcode: '9876543210987', name: 'Bột giặt Omo 4kg', price: 120000, unit: 'gói', checked: true },
];

// Danh sách đầy đủ các đơn vị
export const UNIT_OPTIONS = [
  '7- QUẢ', 'Bánh', 'Bao', 'BAO-18', 'BAO-20', 'BAO-80', 'Bịch', 'Bịch-?', 'bịch-10',
  'BỊCH-12', 'BỊCH-20', 'BỊCH-3', 'BỊCH-5', 'Bình', 'Block', 'Bó', 'Bộ1', 'Bộ2',
  'Bộ3', 'Bộ4', 'Bộ6', 'Bọc', 'BỌC-12', 'Cái', 'Can', 'Cặp', 'Cây', 'CÂY-10',
  'Chai', 'Chiếc', 'Combo', 'Con', 'Cuộn', 'Dây', 'DÂY-10', 'Đôi', 'Gói', 'Gram',
  'Hộp', 'HỘP-10', 'hộp-24', 'Hũ', 'Kẹp', 'Kg', 'Lọ', 'Lốc', 'LỐC-10', 'LỐC-3',
  'LỐC-4', 'LỐC-6', 'Lon', 'Ly', 'Miếng', 'ml', 'Quả', 'SIM', 'Thanh', 'Thẻ',
  'Thỏi', 'THUNDelete', 'Thùng', 'THÙNG-10', 'THÙNG-100', 'THÙNG-11', 'THÙNG-12',
  'THÙNG-14', 'THÙNG-15', 'THÙNG-16', 'THÙNG-18', 'THÙNG-2', 'THÙNG-20', 'THÙNG-24',
  'THÙNG-3', 'THÙNG-30', 'THÙNG-36', 'thùng-360', 'THÙNG-4', 'THÙNG-40', 'THÙNG-42',
  'THÙNG-48', 'THÙNG-5', 'THÙNG-50', 'THÙNG-6', 'THÙNG-8', 'THÙNG-80', 'THÙNG-9',
  'ThungDelete', 'Tô', 'Túi', 'Túi-10', 'TÚI-3', 'TÚI-7', 'Tuýp', 'UOM', 'Vỉ',
  'Vỉ-2', '份', '個', '包', '本', '杯'
];

