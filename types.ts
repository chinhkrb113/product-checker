
export interface Product {
  barcode: string;
  name: string;
  price: number;
  unit: string;
  checked: boolean;
  owner?: string | null;
  
  // Double-check workflow fields
  first_check?: number;
  second_check?: number;
  checked_by?: string | null;
  checked_at?: string | null;
  check_result?: 'correct' | 'needs_correction' | 'incorrect' | 'rejected' | null;
  new_product_name?: string | null;
  new_unit?: string | null;
  new_barcode?: string | null;
  new_price?: number | null;
  stock?: number | null;
  images?: string[];
}

export type Screen = 'login' | 'scan' | 'detail' | 'create' | 'list' | 'first-check' | 'second-check' | 'check-dashboard';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

export interface User {
  username: string;
  employeeName: string;
  role?: 'staff' | 'supervisor'; // Phân quyền cho workflow
}

export interface CheckWorkflowStats {
  total: number;
  pending_first_check: number;
  pending_second_check: number;
  completed: number;
  progress_percentage: number;
  correct_count: number;
  needs_correction_count: number;
  incorrect_count: number;
}
