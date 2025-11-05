import React, { useState, useEffect, useRef } from 'react';
import { Product, Screen, User } from '../types';
import { BackIcon, CameraIcon, CheckIcon } from './icons';
import { UNIT_OPTIONS } from '../constants';

const API_URL = import.meta.env.VITE_API_URL;

interface SecondCheckScreenProps {
  product: Product;
  user: User;
  onNavigate: (screen: Screen, barcode?: string) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const SecondCheckScreen: React.FC<SecondCheckScreenProps> = ({ 
  product, 
  user, 
  onNavigate, 
  showToast 
}) => {
  const [checkData, setCheckData] = useState({
    check_result: 'correct' as 'correct' | 'needs_correction' | 'incorrect',
    new_product_name: '',
    new_unit: '',
    new_price: '',
    stock: '0',
    images: [] as string[]
  });
  
  const [loading, setLoading] = useState(false);
  const [unitSearchTerm, setUnitSearchTerm] = useState('');
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const unitDropdownRef = useRef<HTMLDivElement>(null);

  // QUAN TRỌNG: Tự động điền thông tin từ dữ liệu check lần 1 (nếu có) HOẶC dữ liệu gốc
  useEffect(() => {
    setCheckData({
      check_result: 'correct',
      new_product_name: product.new_product_name || product.name || '',
      new_unit: product.new_unit || product.unit || '',
      new_price: product.new_price ? product.new_price.toString() : product.price ? product.price.toString() : '',
      stock: product.stock !== undefined && product.stock !== null ? product.stock.toString() : '0',
      images: []
    });
    setUnitSearchTerm(product.new_unit || product.unit || '');
  }, [product]);

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
    setCheckData({ ...checkData, new_unit: unit });
    setUnitSearchTerm(unit);
    setIsUnitDropdownOpen(false);
  };

  const handleImageCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (checkData.images.length >= 3) {
          showToast('Chỉ được tải tối đa 3 ảnh', 'error');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = () => {
          setCheckData(prev => ({
            ...prev,
            images: [...prev.images, reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const handleRemoveImage = (index: number) => {
    setCheckData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/products/${product.barcode}/second-check`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checked_by: user.username,
          check_result: checkData.check_result,
          new_product_name: checkData.check_result !== 'correct' ? checkData.new_product_name : null,
          new_unit: checkData.check_result !== 'correct' ? checkData.new_unit : null,
          new_price: checkData.check_result !== 'correct' && checkData.new_price ? parseFloat(checkData.new_price) : null,
          stock: checkData.stock ? parseInt(checkData.stock) : null,
          image_1: checkData.images[0] || null,
          image_2: checkData.images[1] || null,
          image_3: checkData.images[2] || null
        })
      });

      if (response.ok) {
        showToast('Hoàn thành kiểm tra lần 2 thành công!', 'success');
        onNavigate('detail', product.barcode);
      } else {
        const error = await response.json();
        showToast(error.error || 'Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      console.error('Error submitting second check:', error);
      showToast('Không thể kết nối đến server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    // Làm tròn để loại bỏ các số 0 thừa sau dấu thập phân
    const rounded = Math.round(price * 100) / 100;
    // Format theo chuẩn Việt Nam và loại bỏ phần thập phân nếu là số nguyên
    return rounded.toLocaleString('vi-VN', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    }) + ' đ';
  };

  const needsCorrection = checkData.check_result !== 'correct';

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-md p-4 flex items-center sticky top-0 z-10">
        <button onClick={() => onNavigate('detail', product.barcode)} className="text-gray-600 mr-4">
          <BackIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Kiểm tra lần 2</h1>
          <p className="text-xs text-gray-600">{user.employeeName}</p>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto p-4 pb-28">
        {/* Thông tin sản phẩm hiện tại */}
        <section className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Thông tin hiện tại</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Mã vạch:</span>
              <span className="font-mono font-semibold">{product.barcode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tên sản phẩm:</span>
              <span className="font-medium">{product.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Giá:</span>
              <span className="font-medium">{formatPrice(product.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Đơn vị:</span>
              <span className="font-medium">{product.unit}</span>
            </div>
          </div>
        </section>

        {/* Kết quả kiểm tra */}
        <section className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Kết quả kiểm tra *
          </label>
          <div className="space-y-2">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                name="check_result"
                value="correct"
                checked={checkData.check_result === 'correct'}
                onChange={(e) => setCheckData({ ...checkData, check_result: 'correct' })}
                className="mr-3 w-4 h-4"
              />
              <div>
                <div className="font-medium text-green-700">✓ Đúng</div>
                <div className="text-xs text-gray-500">Thông tin chính xác, không cần sửa</div>
              </div>
            </label>
            
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                name="check_result"
                value="needs_correction"
                checked={checkData.check_result === 'needs_correction'}
                onChange={(e) => setCheckData({ ...checkData, check_result: 'needs_correction' })}
                className="mr-3 w-4 h-4"
              />
              <div>
                <div className="font-medium text-orange-700">⚠ Cần sửa</div>
                <div className="text-xs text-gray-500">Có thông tin sai, cần cập nhật</div>
              </div>
            </label>
          </div>
        </section>

        {/* Thông tin mới (chỉ hiện khi cần sửa) */}
        {needsCorrection && (
          <section className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Thông tin mới</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm mới
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên mới (nếu có)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={checkData.new_product_name}
                  onChange={(e) => setCheckData({ ...checkData, new_product_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá mới
                </label>
                <input
                  type="number"
                  placeholder="Nhập giá mới (nếu có)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={checkData.new_price}
                  onChange={(e) => setCheckData({ ...checkData, new_price: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn vị mới
                </label>
                <div className="relative" ref={unitDropdownRef}>
                  <input
                    type="text"
                    placeholder="Chọn hoặc tìm đơn vị..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={unitSearchTerm}
                    onChange={(e) => {
                      setUnitSearchTerm(e.target.value);
                      setCheckData({ ...checkData, new_unit: e.target.value });
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
                            <span className={`${checkData.new_unit === unit ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
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
              </div>
            </div>
          </section>
        )}

        {/* Tồn kho */}
        <section className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tồn kho thực tế
          </label>
          <input
            type="number"
            placeholder="Nhập số lượng tồn kho"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={checkData.stock}
            onChange={(e) => setCheckData({ ...checkData, stock: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">
            Đếm số lượng sản phẩm thực tế trên kệ
          </p>
        </section>

        {/* Chụp ảnh */}
        <section className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Chụp ảnh sản phẩm ({checkData.images.length}/3)
          </label>
          
          <button
            onClick={handleImageCapture}
            disabled={checkData.images.length >= 3}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            <CameraIcon className="w-5 h-5" />
            {checkData.images.length >= 3 ? 'Đã đủ 3 ảnh' : 'Chụp ảnh'}
          </button>

          {checkData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {checkData.images.map((img, i) => (
                <div key={i} className="relative">
                  <img 
                    src={img} 
                    alt={`Ảnh ${i + 1}`} 
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => handleRemoveImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer button */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-4 border-t border-gray-200 z-10 shadow-lg">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 flex justify-center items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang lưu...
            </>
          ) : (
            <>
              <CheckIcon className="w-5 h-5 mr-2" />
              Hoàn thành kiểm tra lần 2
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default SecondCheckScreen;
