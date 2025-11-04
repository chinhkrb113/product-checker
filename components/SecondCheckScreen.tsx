import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product, Screen, User } from '../types';
import { BackIcon, CheckIcon, SearchIcon } from './icons';

const API_URL = 'http://localhost:3001';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<'all' | 'correct' | 'needs_correction' | 'incorrect'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  // Handle search với debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

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

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const getResultColor = (result: string | null) => {
    switch (result) {
      case 'correct': return 'bg-green-100 text-green-800';
      case 'needs_correction': return 'bg-orange-100 text-orange-800';
      case 'incorrect': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  // Filter products
  const filteredProducts = products.filter(p => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Result filter
    const matchesResult = resultFilter === 'all' || p.check_result === resultFilter;
    
    return matchesSearch && matchesResult;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
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

      <div className="p-4 sticky top-[88px] bg-white z-10 border-b space-y-3">
        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã vạch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Filter buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setResultFilter('all')}
            className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
              resultFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả ({products.length})
          </button>
          <button
            onClick={() => setResultFilter('correct')}
            className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
              resultFilter === 'correct'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✓ Đúng ({products.filter(p => p.check_result === 'correct').length})
          </button>
          <button
            onClick={() => setResultFilter('needs_correction')}
            className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
              resultFilter === 'needs_correction'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⚠ Cần sửa ({products.filter(p => p.check_result === 'needs_correction').length})
          </button>
          <button
            onClick={() => setResultFilter('incorrect')}
            className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
              resultFilter === 'incorrect'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✗ Sai ({products.filter(p => p.check_result === 'incorrect').length})
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4">
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
          <>
            {/* Search result info */}
            {searchTerm && (
              <div className="mb-3 text-sm text-gray-600">
                Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm
              </div>
            )}

            {/* Page size selector */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Hiển thị:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">sản phẩm/trang</span>
              </div>
              <div className="text-sm text-gray-600">
                Tổng: <strong>{filteredProducts.length}</strong> sản phẩm
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <>
                {/* Pagination controls - Top */}
                {totalPages > 1 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {/* Previous button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100"
                      >
                        ← Trước
                      </button>

                      {/* Page numbers */}
                      {getPageNumbers().map((pageNum, index) => (
                        pageNum === '...' ? (
                          <span key={`ellipsis-top-${index}`} className="px-2 text-gray-500">...</span>
                        ) : (
                          <button
                            key={`top-${pageNum}`}
                            onClick={() => setCurrentPage(pageNum as number)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      ))}

                      {/* Next button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100"
                      >
                        Sau →
                      </button>
                    </div>
                    
                    {/* Page info */}
                    <div className="text-center mt-3 text-sm text-gray-600">
                      Trang {currentPage} / {totalPages}
                    </div>
                  </div>
                )}

                {/* Product list */}
                <ul className="space-y-3">
                  {paginatedProducts.map(product => (
                    <li key={product.barcode}>
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className={`w-full text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-200 border-2 ${
                          selectedProduct?.barcode === product.barcode
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-gray-800">{product.name}</p>
                            <p className="text-sm text-gray-500">Mã vạch: {product.barcode}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-2 ${getResultColor(product.check_result || null)}`}>
                            {getResultLabel(product.check_result || null)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            Giá: <strong className="text-gray-800">{formatPrice(product.price)}</strong> / {product.unit}
                          </span>
                          <span className="text-xs text-gray-500">
                            👤 {product.checked_by}
                          </span>
                        </div>
                        {product.check_result === 'needs_correction' && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <span className="text-xs text-orange-600">
                              💡 Có thông tin mới đề xuất
                            </span>
                          </div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Pagination controls - Bottom */}
                {totalPages > 1 && (
                  <div className="mt-6 mb-4">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {/* Previous button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100"
                      >
                        ← Trước
                      </button>

                      {/* Page numbers */}
                      {getPageNumbers().map((pageNum, index) => (
                        pageNum === '...' ? (
                          <span key={`ellipsis-bottom-${index}`} className="px-2 text-gray-500">...</span>
                        ) : (
                          <button
                            key={`bottom-${pageNum}`}
                            onClick={() => setCurrentPage(pageNum as number)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      ))}

                      {/* Next button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100"
                      >
                        Sau →
                      </button>
                    </div>
                    
                    {/* Page info */}
                    <div className="text-center mt-3 text-sm text-gray-600">
                      Trang {currentPage} / {totalPages}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">
                  {searchTerm || resultFilter !== 'all' 
                    ? 'Không tìm thấy sản phẩm nào phù hợp với bộ lọc.'
                    : 'Không có sản phẩm nào.'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:w-2/3 lg:w-1/2 rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-800">Chi tiết kiểm tra</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Thông tin check */}
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-3">Thông tin check</h3>
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
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getResultColor(selectedProduct.check_result || null)}`}>
                      {getResultLabel(selectedProduct.check_result || null)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin gốc */}
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-3">Thông tin gốc</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên:</span>
                    <span className="font-medium">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá:</span>
                    <span className="font-medium">{formatPrice(selectedProduct.price)}</span>
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
                  <h3 className="font-semibold text-blue-800 mb-3">Thông tin mới đề xuất</h3>
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
                <div className="bg-white rounded-lg p-4 border shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-3">Tồn kho</h3>
                  <div className="text-2xl font-bold text-gray-800">
                    {selectedProduct.stock} {selectedProduct.unit}
                  </div>
                </div>
              )}

              {/* Hình ảnh */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="bg-white rounded-lg p-4 border shadow-sm">
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
              <div className="sticky bottom-0 pt-4 pb-2">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default SecondCheckScreen;
