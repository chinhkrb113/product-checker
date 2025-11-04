
import React, { useState, useEffect, useRef } from 'react';
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
  const [unitSearchTerm, setUnitSearchTerm] = useState('');
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const unitDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target as Node)) {
        setIsUnitDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter units based on search term
  const filteredUnits = UNIT_OPTIONS.filter(unit =>
    unit.toLowerCase().includes(unitSearchTerm.toLowerCase())
  );

  const handleUnitSelect = (unit: string) => {
    setFormData(prev => ({ ...prev, unit }));
    setUnitSearchTerm(unit);
    setIsUnitDropdownOpen(false);
    // Clear unit error when selected
    if (errors.unit) {
      setErrors(prev => ({ ...prev, unit: undefined }));
    }
  };

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
                <div className="relative mt-1" ref={unitDropdownRef}>
                  <input
                    type="text"
                    id="unit"
                    placeholder="Chọn hoặc tìm đơn vị..."
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                    value={unitSearchTerm}
                    onChange={(e) => {
                      setUnitSearchTerm(e.target.value);
                      setFormData(prev => ({ ...prev, unit: e.target.value }));
                      setIsUnitDropdownOpen(true);
                    }}
                    onFocus={() => setIsUnitDropdownOpen(true)}
                  />
                  
                  {/* Dropdown icon */}
                  <button
                    type="button"
                    onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {isUnitDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredUnits.length > 0 ? (
                        filteredUnits.map((unit, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleUnitSelect(unit)}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 transition border-b border-gray-100 last:border-b-0"
                          >
                            <span className={`${formData.unit === unit ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                              {unit}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                          Không tìm thấy đơn vị phù hợp
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
