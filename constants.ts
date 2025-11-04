
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

export const UNIT_OPTIONS = ['chai', 'gói', 'hộp', 'kg', 'lon', 'túi'];
