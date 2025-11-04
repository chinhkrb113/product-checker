
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Product, Screen } from '../types';
import { BackIcon, SearchIcon } from './icons';

const API_URL = 'http://localhost:3001';
const PAGE_SIZE = 50;

interface ProductListScreenProps {
  onNavigate: (screen: Screen, barcode?: string) => void;
}

const ProductListScreen: React.FC<ProductListScreenProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked' | 'unchecked'>('all');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  // Fetch products từ API
  const fetchProducts = useCallback(async (offset: number, isInitial = false) => {
    if (loading || (!isInitial && !hasMore)) return;

    try {
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `${API_URL}/api/products?limit=${PAGE_SIZE}&offset=${offset}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      
      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setProducts(prev => offset === 0 ? data : [...prev, ...data]);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [loading, hasMore]);

  // Load initial products
  useEffect(() => {
    fetchProducts(0, true);
  }, []);

  // Infinite scroll với Intersection Observer
  useEffect(() => {
    if (initialLoading) return;

    const currentRef = loadMoreRef.current;
    if (!currentRef) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProducts(nextPage * PAGE_SIZE);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(currentRef);

    return () => {
      if (observerRef.current && currentRef) {
        observerRef.current.unobserve(currentRef);
      }
    };
  }, [initialLoading, hasMore, loading, page, fetchProducts]);
  
  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter(p => {
        // Filter by search term
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             p.barcode.includes(searchTerm);
        
        // Filter by status
        const matchesStatus = statusFilter === 'all' || 
                             (statusFilter === 'checked' && p.checked) ||
                             (statusFilter === 'unchecked' && !p.checked);
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [products, searchTerm, statusFilter]);

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
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter('checked')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition ${
              statusFilter === 'checked'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Đã check ({products.filter(p => p.checked).length})
          </button>
          <button
            onClick={() => setStatusFilter('unchecked')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition ${
              statusFilter === 'unchecked'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Chưa check ({products.filter(p => !p.checked).length})
          </button>
        </div>
      </div>
      
      <main className="flex-grow overflow-y-auto p-4 bg-gray-50">
        {initialLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-4">Đang tải sản phẩm...</p>
          </div>
        ) : filteredAndSortedProducts.length > 0 ? (
          <>
            <ul className="space-y-3">
              {filteredAndSortedProducts.map(product => (
                <li key={product.barcode}>
                  <button
                    onClick={() => onNavigate('detail', product.barcode)}
                    className="w-full text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-200 flex justify-between items-center border border-gray-200"
                  >
                    <div>
                      <p className="font-bold text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-500">Mã vạch: {product.barcode}</p>
                      <p className="text-sm text-gray-600">Giá: {formatPrice(product.price)} / {product.unit}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      product.checked 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {product.checked ? 'Đã Check' : 'Chưa Check'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            
            {/* Loading indicator cho infinite scroll */}
            {hasMore && (
              <div ref={loadMoreRef} className="text-center py-6">
                {loading && (
                  <>
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 text-sm mt-2">Đang tải thêm...</p>
                  </>
                )}
              </div>
            )}

            {!hasMore && products.length > PAGE_SIZE && (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">Đã tải hết tất cả sản phẩm</p>
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
