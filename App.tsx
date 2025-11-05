import React, { useState, useEffect } from 'react';
import { Product, Screen, ToastMessage, User } from './types';
import LoginScreen from './components/LoginScreen';
import ScanScreen from './components/ScanScreen';
import ProductListScreen from './components/ProductListScreen';
import ProductDetailScreen from './components/ProductDetailScreen';
import CreateProductScreen from './components/CreateProductScreen';
import FirstCheckScreen from './components/FirstCheckScreen';
import SecondCheckScreen from './components/SecondCheckScreen';
import Toast from './components/Toast';

const API_URL = import.meta.env.VITE_API_URL + '/api';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [currentBarcode, setCurrentBarcode] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Load user từ localStorage nếu có
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setScreen('scan');
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Khởi tạo browser history
  useEffect(() => {
    // Push state ban đầu vào history
    const initialState = {
      screen: screen,
      barcode: currentBarcode,
      timestamp: Date.now()
    };
    window.history.replaceState(initialState, '', '');
  }, []);

  // Quản lý browser history và nút back
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Prevent default behavior
      event.preventDefault();

      if (event.state && event.state.screen) {
        // Có state từ history, khôi phục màn hình
        const { screen: prevScreen, barcode: prevBarcode } = event.state;
        
        // Nếu đang ở màn hình login hoặc scan (màn đầu), hiện dialog xác nhận thoát
        if (prevScreen === 'login' || (prevScreen === 'scan' && screen === 'scan')) {
          setShowExitDialog(true);
          // Push lại state hiện tại để không bị thoát
          window.history.pushState({
            screen: screen,
            barcode: currentBarcode,
            timestamp: Date.now()
          }, '', '');
        } else {
          // Quay lại màn hình trước
          setCurrentBarcode(prevBarcode);
          setScreen(prevScreen);
        }
      } else {
        // Không có state, đang ở màn hình đầu tiên
        if (screen === 'scan' || screen === 'login') {
          setShowExitDialog(true);
          // Push lại state để không bị thoát
          window.history.pushState({
            screen: screen,
            barcode: currentBarcode,
            timestamp: Date.now()
          }, '', '');
        } else {
          // Quay về scan
          setScreen('scan');
          setCurrentBarcode(null);
          setCurrentProduct(null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [screen, currentBarcode]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch product khi cần hiển thị detail screen, first-check screen HOẶC second-check screen
  useEffect(() => {
    const fetchProduct = async () => {
      if ((screen === 'detail' || screen === 'first-check' || screen === 'second-check') && currentBarcode) {
        // Clear previous product before fetching new one
        setCurrentProduct(null);
        
        try {
          const response = await fetch(`${API_URL}/products/${currentBarcode}`);
          if (response.ok) {
            const product = await response.json();
            setCurrentProduct(product);
          } else {
            showToast('Không tìm thấy sản phẩm', 'error');
            setScreen('scan');
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          showToast('Không thể tải thông tin sản phẩm', 'error');
          setScreen('scan');
        }
      }
    };
    
    fetchProduct();
  }, [screen, currentBarcode]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleLoginSuccess = (username: string, employeeName: string) => {
    const userData: User = { username, employeeName };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setScreen('scan');
    showToast(`Xin chào, ${employeeName}!`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setScreen('login');
    showToast('Đã đăng xuất', 'success');
    
    // Reset history khi logout
    window.history.replaceState({
      screen: 'login',
      barcode: null,
      timestamp: Date.now()
    }, '', '');
  };

  const handleExitApp = () => {
    // Cho phép thoát khỏi ứng dụng
    setShowExitDialog(false);
    // Điều hướng ra ngoài hoặc đóng tab (nếu được phép)
    window.history.back();
  };

  const handleCancelExit = () => {
    setShowExitDialog(false);
  };

  const handleNavigate = (newScreen: Screen, barcode?: string) => {
    setCurrentBarcode(barcode || null);
    // Clear current product when navigating to prevent showing stale data
    if (barcode) {
      setCurrentProduct(null);
    }
    setScreen(newScreen);
    
    // Push state vào browser history
    const state = {
      screen: newScreen,
      barcode: barcode || null,
      timestamp: Date.now()
    };
    window.history.pushState(state, '', '');
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const response = await fetch(`${API_URL}/products/${updatedProduct.barcode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
      if (!response.ok) throw new Error('Failed to update product');
      setCurrentProduct(updatedProduct);
      showToast('Lưu thông tin thành công.', 'success');
    } catch (error) {
      console.error('Error updating product:', error);
      showToast('Không thể cập nhật sản phẩm', 'error');
    }
  };

  const handleCreateProduct = async (newProduct: Product) => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if (!response.ok) throw new Error('Failed to create product');
      showToast('Tạo sản phẩm mới và đánh dấu Check thành công.', 'success');
      handleNavigate('scan');
    } catch (error) {
      console.error('Error creating product:', error);
      showToast('Không thể tạo sản phẩm mới', 'error');
    }
  };

  const renderScreen = () => {
    // Nếu chưa login, hiển thị màn hình login
    if (!user) {
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

    // Đã login, hiển thị các màn hình chức năng
    switch (screen) {
      case 'login':
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
      case 'scan':
        return <ScanScreen onNavigate={handleNavigate} user={user} onLogout={handleLogout} />;
      case 'list':
        return <ProductListScreen onNavigate={handleNavigate} />;
      case 'detail':
        if (currentProduct) {
          return (
            <ProductDetailScreen
              product={currentProduct}
              onNavigate={handleNavigate}
              onUpdateProduct={handleUpdateProduct}
              showToast={showToast}
            />
          );
        }
        return <ScanScreen onNavigate={handleNavigate} user={user} onLogout={handleLogout} />;
      case 'first-check':
        if (currentProduct) {
          return (
            <FirstCheckScreen
              product={currentProduct}
              user={user}
              onNavigate={handleNavigate}
              showToast={showToast}
            />
          );
        }
        return <ScanScreen onNavigate={handleNavigate} user={user} onLogout={handleLogout} />;
      case 'second-check':
        if (currentProduct) {
          return (
            <SecondCheckScreen
              product={currentProduct}
              user={user}
              onNavigate={handleNavigate}
              showToast={showToast}
            />
          );
        }
        return <ScanScreen onNavigate={handleNavigate} user={user} onLogout={handleLogout} />;
      case 'create':
        if (currentBarcode) {
          return (
            <CreateProductScreen
              barcode={currentBarcode}
              user={user}
              onNavigate={handleNavigate}
              onCreateProduct={handleCreateProduct}
              showToast={showToast}
            />
          );
        }
        return <ScanScreen onNavigate={handleNavigate} user={user} onLogout={handleLogout} />;
      default:
        return <ScanScreen onNavigate={handleNavigate} user={user} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        {renderScreen()}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Dialog xác nhận thoát */}
      {showExitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-fade-in">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Thoát ứng dụng?
              </h3>
              <p className="text-sm text-gray-500">
                Bạn có chắc chắn muốn thoát khỏi hệ thống không?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelExit}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Ở lại
              </button>
              <button
                onClick={handleExitApp}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Thoát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
