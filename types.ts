
export interface Product {
  barcode: string;
  name: string;
  price: number;
  unit: string;
  checked: boolean;
}

export type Screen = 'login' | 'scan' | 'detail' | 'create' | 'list';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

export interface User {
  username: string;
  employeeName: string;
}
