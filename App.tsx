import React, { useState, useEffect } from 'react';
import { Product, Screen, ToastMessage, User } from './types';
import LoginScreen from './components/LoginScreen';
import ScanScreen from './components/ScanScreen';
import ProductListScreen from './components/ProductListScreen';
import ProductDetailScreen from './components/ProductDetailScreen';
import CreateProductScreen from './components/CreateProductScreen';
import FirstCheckScreen from './components/FirstCheckScreen';
import SecondCheckScreen from './components/SecondCheckScreen';
import CheckDashboard from './components/CheckDashboard';
import Toast from './components/Toast';

const API_URL = 'http://localhost:3001/api';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [currentBarcode, setCurrentBarcode] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

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

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch product khi cần hiển thị detail screen hoặc first-check screen
  useEffect(() => {
    const fetchProduct = async () => {
      if ((screen === 'detail' || screen === 'first-check') && currentBarcode) {
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
  };

  const handleNavigate = (newScreen: Screen, barcode?: string) => {
    setCurrentBarcode(barcode || null);
    // Clear current product when navigating to prevent showing stale data
    if (barcode) {
      setCurrentProduct(null);
    }
    setScreen(newScreen);
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
        return (
          <SecondCheckScreen
            user={user}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        );
      case 'check-dashboard':
        return <CheckDashboard onNavigate={handleNavigate} />;
      case 'create':
        if (currentBarcode) {
          return (
            <CreateProductScreen
              barcode={currentBarcode}
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
    </div>
  );
};

export default App;
