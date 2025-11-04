import React, { useState, useEffect } from 'react';
import { Product, Screen, User } from '../types';
import { BackIcon, CheckIcon } from './icons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SecondCheckScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const SecondCheckScreen: React.FC<SecondCheckScreenProps> = ({ 
  user, 
  onNavigate, 
  showToast 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/pending-second-check`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching pending products:', error);
      showToast('Không thể tải danh sách sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approved: boolean) => {
    if (!selectedProduct) return;
    
    setProcessing(true);
    
    try {
      const response = await fetch(
        `${API_URL}/api/products/${selectedProduct.barcode}/second-check`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checked_by: user.username,
            approved
          })
        }
      );

      if (response.ok) {
        showToast(
          approved ? 'Đã phê duyệt thành công!' : 'Đã từ chối và reset về pending',
          'success'
        );
        
        // Remove from list and clear selection
        setProducts(products.filter(p => p.barcode !== selectedProduct.barcode));
        setSelectedProduct(null);
      } else {
        const error = await response.json();
        showToast(error.error || 'Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      console.error('Error in second check:', error);
      showToast('Không thể kết nối đến server', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const getResultColor = (result: string | null) => {
    switch (result) {
      case 'correct': return 'text-green-600 bg-green-50';
      case 'needs_correction': return 'text-orange-600 bg-orange-50';
      case 'incorrect': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getResultLabel = (result: string | null) => {
    switch (result) {
      case 'correct': return '✓ Đúng';
      case 'needs_correction': return '⚠ Cần sửa';
      case 'incorrect': return '✗ Sai';
      default: return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-md p-4 flex items-center sticky top-0 z-10">
        <button onClick={() => onNavigate('scan')} className="text-gray-600 mr-4">
          <BackIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Duyệt kiểm tra lần 2</h1>
          <p className="text-xs text-gray-600">Supervisor: {user.employeeName}</p>
        </div>
      </header>

      <main className="flex-grow overflow-hidden">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Không có sản phẩm nào cần duyệt
            </h2>
            <p className="text-gray-600">
              Tất cả sản phẩm đã được kiểm tra và duyệt
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 h-full">
            {/* Danh sách sản phẩm */}
            <div className="overflow-y-auto p-4 border-r bg-white">
              <h2 className="font-semibold text-gray-700 mb-3">
                Danh sách chờ duyệt ({products.length})
              </h2>
              <div className="space-y-2">
                {products.map((product) => (
                  <button
                    key={product.barcode}
                    onClick={() => setSelectedProduct(product)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedProduct?.barcode === product.barcode
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-gray-800">{product.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Mã: {product.barcode}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${getResultColor(product.check_result || null)}`}>
                        {getResultLabel(product.check_result || null)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {product.checked_by}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chi tiết sản phẩm */}
            <div className="overflow-y-auto p-4 bg-gray-50">
              {selectedProduct ? (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">
                    Chi tiết kiểm tra
                  </h2>

                  {/* Thông tin check */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-2">Thông tin check</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Người check:</span>
                        <span className="font-medium">{selectedProduct.checked_by}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian:</span>
                        <span className="font-medium">{formatDate(selectedProduct.checked_at || null)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Kết quả:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getResultColor(selectedProduct.check_result || null)}`}>
                          {getResultLabel(selectedProduct.check_result || null)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin gốc */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-2">Thông tin gốc</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tên:</span>
                        <span className="font-medium">{selectedProduct.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá:</span>
                        <span className="font-medium">{selectedProduct.price.toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Đơn vị:</span>
                        <span className="font-medium">{selectedProduct.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin mới (nếu có) */}
                  {selectedProduct.check_result === 'needs_correction' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold text-blue-800 mb-2">Thông tin mới đề xuất</h3>
                      <div className="space-y-2 text-sm">
                        {selectedProduct.new_product_name && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tên mới:</span>
                            <span className="font-medium text-blue-700">{selectedProduct.new_product_name}</span>
                          </div>
                        )}
                        {selectedProduct.new_price && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Giá mới:</span>
                            <span className="font-medium text-blue-700">{selectedProduct.new_price.toLocaleString('vi-VN')} đ</span>
                          </div>
                        )}
                        {selectedProduct.new_unit && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Đơn vị mới:</span>
                            <span className="font-medium text-blue-700">{selectedProduct.new_unit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tồn kho */}
                  {selectedProduct.stock !== undefined && selectedProduct.stock !== null && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold text-gray-700 mb-2">Tồn kho</h3>
                      <div className="text-2xl font-bold text-gray-800">
                        {selectedProduct.stock} {selectedProduct.unit}
                      </div>
                    </div>
                  )}

                  {/* Hình ảnh */}
                  {selectedProduct.images && selectedProduct.images.length > 0 && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold text-gray-700 mb-3">Hình ảnh ({selectedProduct.images.length})</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedProduct.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`Ảnh ${i + 1}`}
                            className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-75 transition"
                            onClick={() => window.open(img, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nút duyệt */}
                  <div className="sticky bottom-0 pt-4 pb-2 bg-gray-50">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(false)}
                        disabled={processing}
                        className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:bg-gray-400 transition flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleApprove(true)}
                        disabled={processing}
                        className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-400 transition flex items-center justify-center"
                      >
                        <CheckIcon className="w-5 h-5 mr-2" />
                        Phê duyệt
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="text-6xl mb-4">👈</div>
                  <p className="text-gray-600">
                    Chọn một sản phẩm bên trái để xem chi tiết
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SecondCheckScreen;
