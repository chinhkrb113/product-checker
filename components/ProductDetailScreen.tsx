import React, { useState, useEffect } from 'react';
import { Product, Screen } from '../types';
import { BackIcon } from './icons';

interface ProductDetailScreenProps {
  product: Product;
  onNavigate: (screen: Screen, barcode?: string) => void;
  onUpdateProduct: (product: Product) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ product, onNavigate }) => {
  const [currentProduct, setCurrentProduct] = useState(product);

  // Sync currentProduct when product prop changes
  useEffect(() => {
    setCurrentProduct(product);
  }, [product]);

  const formatPrice = (price: number) => {
    // Làm tròn để loại bỏ các số 0 thừa sau dấu thập phân
    const rounded = Math.round(price * 100) / 100;
    // Format theo chuẩn Việt Nam và loại bỏ phần thập phân nếu là số nguyên
    return rounded.toLocaleString('vi-VN', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    }) + ' đ';
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
          (currentProduct.first_check === 1) ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
        }`}>
          {(currentProduct.first_check === 1) ? 'Đã Check' : 'Chưa Check'}
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

        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Trạng thái kiểm tra</h2>
          <div className="bg-white p-4 rounded-lg space-y-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Kiểm tra lần 1:</span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                currentProduct.first_check === 1 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {currentProduct.first_check === 1 ? '✓ Đã check' : '✗ Chưa check'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Kiểm tra lần 2:</span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                currentProduct.second_check === 1 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {currentProduct.second_check === 1 ? '✓ Đã check' : '✗ Chưa check'}
              </span>
            </div>
          </div>
        </section>

        {/* Chi tiết kiểm tra lần 1 */}
        {currentProduct.first_check === 1 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Chi tiết kiểm tra lần 1</h2>
            <div className="bg-white p-4 rounded-lg space-y-3 border border-gray-200">
              {/* Người kiểm tra */}
              {currentProduct.checked_by && (
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 min-w-[120px]">Người kiểm tra:</span>
                  <span className="text-gray-900">{currentProduct.checked_by}</span>
                </div>
              )}
              
              {/* Thời gian kiểm tra */}
              {currentProduct.checked_at && (
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 min-w-[120px]">Thời gian:</span>
                  <span className="text-gray-900">
                    {new Date(currentProduct.checked_at).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
              
              {/* Kết quả kiểm tra */}
              {currentProduct.check_result && (
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 min-w-[120px]">Kết quả:</span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    currentProduct.check_result === 'correct' 
                      ? 'bg-green-100 text-green-800'
                      : currentProduct.check_result === 'needs_correction'
                      ? 'bg-orange-100 text-orange-800'
                      : currentProduct.check_result === 'incorrect'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentProduct.check_result === 'correct' && '✓ Đúng'}
                    {currentProduct.check_result === 'needs_correction' && '⚠ Cần sửa'}
                    {currentProduct.check_result === 'incorrect' && '✗ Sai'}
                    {currentProduct.check_result === 'rejected' && '⛔ Từ chối'}
                  </span>
                </div>
              )}
              
              {/* Thông tin cập nhật (nếu có) */}
              {currentProduct.check_result !== 'correct' && (
                <>
                  {currentProduct.new_product_name && (
                    <div className="flex items-start pt-2 border-t border-gray-100">
                      <span className="font-medium text-gray-700 min-w-[120px]">Tên mới:</span>
                      <span className="text-blue-700 font-medium">{currentProduct.new_product_name}</span>
                    </div>
                  )}
            
                  {currentProduct.new_price && (
                    <div className="flex items-start">
                      <span className="font-medium text-gray-700 min-w-[120px]">Giá mới:</span>
                      <span className="text-blue-700 font-medium">{formatPrice(currentProduct.new_price)}</span>
                    </div>
                  )}
                                    
                  {currentProduct.new_unit && (
                    <div className="flex items-start">
                      <span className="font-medium text-gray-700 min-w-[120px]">Đơn vị mới:</span>
                      <span className="text-blue-700 font-medium">{currentProduct.new_unit}</span>
                    </div>
                  )}
                </>
              )}
              
              {/* Số lượng tồn kho */}
              {(currentProduct.stock !== null && currentProduct.stock !== undefined) && (
                <div className="flex items-start pt-2 border-t border-gray-100">
                  <span className="font-medium text-gray-700 min-w-[120px]">Tồn kho:</span>
                  <span className="text-gray-900">
                    {currentProduct.stock} {currentProduct.new_unit || currentProduct.unit}
                  </span>
                </div>
              )}
              
              {/* Hình ảnh */}
              {currentProduct.images && currentProduct.images.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="font-medium text-gray-700 block mb-2">Hình ảnh:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {currentProduct.images.map((image, index) => (
                      <div key={index} className="relative aspect-square">
                        <img 
                          src={image} 
                          alt={`Ảnh ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-4 border-t border-gray-200 z-10">
        <div className="flex flex-col space-y-3">
          {/* Nút kiểm tra lần 1 - Luôn cho phép check lại để chỉnh sửa */}
          <button 
            onClick={() => onNavigate('first-check', currentProduct.barcode)} 
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {currentProduct.first_check === 1 ? 'Kiểm tra lại lần 1' : 'Kiểm tra lần 1'}
          </button>
          
          {/* Hiển thị trạng thái */}
          {currentProduct.first_check === 1 && currentProduct.second_check === 1 && (
            <div className="w-full bg-green-50 border border-green-200 p-3 rounded-lg text-center">
              <p className="text-sm text-green-700 font-medium">✓ Đã được supervisor duyệt</p>
              <p className="text-xs text-green-600 mt-1">Có thể check lại lần 1 nếu cần chỉnh sửa</p>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default ProductDetailScreen;
