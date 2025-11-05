
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product, Screen } from '../types';
import { BackIcon, SearchIcon } from './icons';

const API_URL = 'https://3gz0lzph-3001.asse.devtunnels.ms';

interface ProductListScreenProps {
  onNavigate: (screen: Screen, barcode?: string) => void;
}

const ProductListScreen: React.FC<ProductListScreenProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unchecked' | 'first-checked' | 'completed'>('all');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  // Tính tổng số trang
  const totalPages = Math.ceil(totalProducts / pageSize);

  // Fetch products từ API
  const fetchProducts = useCallback(async (page: number, search: string = '') => {
    try {
      setLoading(true);

      const offset = (page - 1) * pageSize;
      const url = search.trim() 
        ? `${API_URL}/api/products/search?q=${encodeURIComponent(search)}&limit=${pageSize}&offset=${offset}`
        : `${API_URL}/api/products?limit=${pageSize}&offset=${offset}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const result = await response.json();
      
      // Check if response is new format {data, total} or old format (array)
      if (result.data && typeof result.total === 'number') {
        setProducts(result.data);
        setTotalProducts(result.total);
      } else {
        // Fallback to old format (array)
        setProducts(result);
        setTotalProducts(result.length);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Load initial products
  useEffect(() => {
    fetchProducts(1, searchTerm);
  }, []);

  // Handle search với debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts(1, searchTerm);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchProducts]);

  // Handle page change
  useEffect(() => {
    fetchProducts(currentPage, searchTerm);
  }, [currentPage, pageSize, fetchProducts]);
  
  // Filter by status
  const filteredProducts = products.filter(p => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'unchecked') return !p.first_check || p.first_check === 0;
    if (statusFilter === 'first-checked') return p.first_check === 1 && (!p.second_check || p.second_check === 0);
    if (statusFilter === 'completed') return p.first_check === 1 && p.second_check === 1;
    return true;
  });

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

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

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow-md p-4 flex items-center sticky top-0 z-10">
        <button onClick={() => onNavigate('scan')} className="text-gray-600 mr-4">
          <BackIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Danh sách sản phẩm</h1>
      </header>

      <div className="p-4 sticky top-[72px] bg-white z-10 border-b space-y-3">
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
            onClick={() => setStatusFilter('all')}
            className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter('unchecked')}
            className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
              statusFilter === 'unchecked'
                ? 'bg-gray-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Chưa check ({products.filter(p => !p.first_check || p.first_check === 0).length})
          </button>
          <button
            onClick={() => setStatusFilter('first-checked')}
            className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
              statusFilter === 'first-checked'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⚡ Check 1 lần ({products.filter(p => p.first_check === 1 && (!p.second_check || p.second_check === 0)).length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
              statusFilter === 'completed'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✓ Hoàn thành ({products.filter(p => p.first_check === 1 && p.second_check === 1).length})
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4">
        {searchTerm && (
          <div className="mb-3 text-sm text-gray-600">
            {loading ? (
              <span>Đang tìm kiếm...</span>
            ) : (
              <span>Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm (trang {currentPage}/{totalPages})</span>
            )}
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
              <option value={1000}>1000</option>
            </select>
            <span className="text-sm text-gray-600">sản phẩm/trang</span>
          </div>
          <div className="text-sm text-gray-600">
            Tổng: <strong>{totalProducts}</strong> sản phẩm
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-4">Đang tải sản phẩm...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
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

            <ul className="space-y-3">
              {filteredProducts.map(product => {
                // Xác định trạng thái check
                let checkStatus = 'unchecked';
                let statusBadge = { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Chưa check', subLabel: null };
                
                if (product.first_check === 1 && product.second_check === 1) {
                  checkStatus = 'completed';
                  statusBadge = { 
                    bg: 'bg-green-100', 
                    text: 'text-green-800', 
                    label: '✓ Hoàn thành',
                    subLabel: 'Đã check 2 lần'
                  };
                } else if (product.first_check === 1) {
                  checkStatus = 'first-checked';
                  statusBadge = { 
                    bg: 'bg-blue-100', 
                    text: 'text-blue-800', 
                    label: '⚡ Check lần 1',
                    subLabel: 'Chờ duyệt lần 2'
                  };
                }

                return (
                  <li key={product.barcode}>
                    <button
                      onClick={() => onNavigate('detail', product.barcode)}
                      className="w-full text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-200 flex justify-between items-center border border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-500">Mã vạch: {product.barcode}</p>
                        <p className="text-sm text-gray-600">Giá: {formatPrice(product.price)} / {product.unit}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.label}
                        </span>
                        {statusBadge.subLabel && (
                          <span className="text-xs text-gray-500">{statusBadge.subLabel}</span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
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
              {searchTerm || statusFilter !== 'all' 
                ? 'Không tìm thấy sản phẩm nào phù hợp với bộ lọc.'
                : 'Không có sản phẩm nào.'
              }
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductListScreen;
