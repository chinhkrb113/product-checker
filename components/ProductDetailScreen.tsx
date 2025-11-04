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
    return price.toLocaleString('vi-VN') + ' đ';
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
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-4 border-t border-gray-200 z-10">
        <div className="flex flex-col space-y-3">
          {/* Nút kiểm tra workflow */}
          {(!currentProduct.first_check || currentProduct.first_check === 0) && (
            <button 
              onClick={() => onNavigate('first-check', currentProduct.barcode)} 
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Kiểm tra lần 1
            </button>
          )}
          
          {currentProduct.first_check === 1 && (!currentProduct.second_check || currentProduct.second_check === 0) && (
            <div className="w-full bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
              <p className="text-sm text-blue-700 font-medium">✓ Đã kiểm tra lần 1</p>
              <p className="text-xs text-blue-600 mt-1">Chờ supervisor duyệt</p>
            </div>
          )}
          
          {currentProduct.first_check === 1 && currentProduct.second_check === 1 && (
            <div className="w-full bg-green-50 border border-green-200 p-3 rounded-lg text-center">
              <p className="text-sm text-green-700 font-medium">✓ Đã hoàn thành kiểm tra 2 lần</p>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default ProductDetailScreen;
