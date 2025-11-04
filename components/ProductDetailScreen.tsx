import React, { useState } from 'react';
import { Product, Screen } from '../types';
import { UNIT_OPTIONS } from '../constants';
import { BackIcon } from './icons';

interface ProductDetailScreenProps {
  product: Product;
  onNavigate: (screen: Screen, barcode?: string) => void;
  onUpdateProduct: (product: Product) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

interface FormErrors {
  name?: string;
  price?: string;
  unit?: string;
}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ product, onNavigate, onUpdateProduct, showToast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Omit<Product, 'barcode' | 'checked'>>({
    name: product.name,
    price: product.price,
    unit: product.unit,
  });
  const [currentProduct, setCurrentProduct] = useState(product);
  const [errors, setErrors] = useState<FormErrors>({});

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' đ';
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tên sản phẩm không được để trống.';
    if (!formData.price && formData.price !== 0) newErrors.price = 'Giá không được để trống.';
    else if (isNaN(formData.price) || formData.price < 0) newErrors.price = 'Giá phải là số hợp lệ.';
    if (!formData.unit.trim()) newErrors.unit = 'Đơn vị tính không được để trống.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      // Simulate API call
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        if (success) {
          const updatedProduct: Product = { ...currentProduct, ...formData };
          setCurrentProduct(updatedProduct);
          onUpdateProduct(updatedProduct);
          setIsEditing(false);
        } else {
          showToast('Lưu thông tin thất bại. Vui lòng thử lại.', 'error');
        }
      }, 500);
    }
  };
  
  const handleCancelEdit = () => {
    setFormData({
      name: currentProduct.name,
      price: currentProduct.price,
      unit: currentProduct.unit,
    });
    setErrors({});
    setIsEditing(false);
  }

  const handleCheck = () => {
    const updatedProduct = { ...currentProduct, checked: true };
    setCurrentProduct(updatedProduct);
    onUpdateProduct(updatedProduct);
    showToast('Đã đánh dấu Check thành công.', 'success');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || '' : value }));
  };
  
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center">
            <button onClick={() => onNavigate('scan')} className="text-gray-600 mr-4">
                <BackIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Chi tiết sản phẩm</h1>
        </div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
          currentProduct.checked ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
        }`}>
          {currentProduct.checked ? 'Đã Check' : 'Chưa Check'}
        </span>
      </header>
      
      <main className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50 pb-28">
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Thông tin hiện tại</h2>
          <div className="bg-gray-100 p-4 rounded-lg space-y-2 text-gray-800 border border-gray-200">
            <p><span className="font-medium">Mã vạch:</span> {currentProduct.barcode}</p>
            <p><span className="font-medium">Tên hiện tại:</span> {currentProduct.name}</p>
            <p><span className="font-medium">Giá hiện tại:</span> {formatPrice(currentProduct.price)}</p>
            <p><span className="font-medium">Đơn vị hiện tại:</span> {currentProduct.unit}</p>
          </div>
        </section>

        {isEditing && (
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Chỉnh sửa thông tin</h2>
            <div className="bg-white p-4 rounded-lg space-y-4 border border-gray-200 shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mã vạch *</label>
                <input type="text" value={currentProduct.barcode} disabled className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm p-2" />
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
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-4 border-t border-gray-200 z-10">
        {isEditing ? (
            <div className="flex space-x-3">
              <button onClick={handleCancelEdit} className="w-1/3 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Hủy</button>
              <button onClick={handleSave} className="w-2/3 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Lưu thay đổi</button>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              <button onClick={() => setIsEditing(true)} className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition">Chỉnh sửa thông tin</button>
              <button onClick={handleCheck} disabled={currentProduct.checked} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed">
                {currentProduct.checked ? 'Đã Check' : 'Check'}
              </button>
            </div>
          )
        }
      </footer>
    </div>
  );
};

export default ProductDetailScreen;
