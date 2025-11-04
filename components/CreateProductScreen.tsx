
import React, { useState } from 'react';
import { Product, Screen } from '../types';
import { UNIT_OPTIONS } from '../constants';
import { BackIcon } from './icons';

interface CreateProductScreenProps {
  barcode: string;
  onNavigate: (screen: Screen) => void;
  onCreateProduct: (product: Product) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

interface FormErrors {
  name?: string;
  price?: string;
  unit?: string;
}

const CreateProductScreen: React.FC<CreateProductScreenProps> = ({ barcode, onNavigate, onCreateProduct, showToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    unit: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tên sản phẩm không được để trống.';
    if (!formData.price) newErrors.price = 'Giá không được để trống.';
    else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) newErrors.price = 'Giá phải là số hợp lệ.';
    if (!formData.unit.trim()) newErrors.unit = 'Đơn vị tính không được để trống.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSaveAndCheck = () => {
    if (validate()) {
       setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        if (success) {
            const newProduct: Product = {
                barcode,
                name: formData.name,
                price: Number(formData.price),
                unit: formData.unit,
                checked: true,
            };
            onCreateProduct(newProduct);
        } else {
            showToast('Lưu thông tin thất bại. Vui lòng thử lại.', 'error');
        }
      }, 500);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow-md p-4 flex items-center sticky top-0 z-10">
        <button onClick={() => onNavigate('scan')} className="text-gray-600 mr-4">
          <BackIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Tạo sản phẩm mới</h1>
      </header>

      <main className="flex-grow overflow-y-auto p-6 bg-gray-50 pb-28">
        <div className="bg-white p-4 rounded-lg space-y-4 border border-gray-200 shadow-sm">
            <div>
                <label className="block text-sm font-medium text-gray-700">Mã vạch *</label>
                <input type="text" value={barcode} disabled className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên sản phẩm *</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Giá *</label>
                <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2" />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Đơn vị tính *</label>
                <select id="unit" name="unit" value={formData.unit} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2">
                    <option value="">Chọn đơn vị</option>
                    {UNIT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                </select>
                {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
            </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-4 border-t border-gray-200 z-10">
        <div className="flex space-x-3">
          <button onClick={() => onNavigate('scan')} className="w-1/3 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Hủy</button>
          <button onClick={handleSaveAndCheck} className="w-2/3 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Lưu & Check</button>
        </div>
      </footer>
    </div>
  );
};

export default CreateProductScreen;
