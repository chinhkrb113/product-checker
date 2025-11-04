import React, { useState, useRef, useEffect } from 'react';
import { Product, Screen, User } from '../types';
import { CameraIcon, ListIcon } from './icons';

const API_URL = 'http://localhost:3001';

interface ScanScreenProps {
  onNavigate: (screen: Screen, barcode?: string) => void;
  user: User;
  onLogout: () => void;
}

// --- Barcode Scanner Component ---
interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // @ts-ignore - Check for BarcodeDetector API support
    if (!('BarcodeDetector' in window)) {
      setError('Trình duyệt của bạn không hỗ trợ quét mã vạch.');
      return;
    }

    const setupScanner = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Clear any previous error if camera access is successful
        setError(null);

        // @ts-ignore
        const barcodeDetector = new window.BarcodeDetector({
          formats: ['ean_13', 'code_128', 'qr_code', 'upc_a', 'upc_e'],
        });

        intervalRef.current = window.setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0 && barcodes[0].rawValue) {
                onScanSuccess(barcodes[0].rawValue);
              }
            } catch (e) {
              console.error('Barcode detection failed:', e);
            }
          }
        }, 300);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Không thể truy cập camera. Vui lòng cấp quyền và thử lại.');
      }
    };

    setupScanner();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white">
      <video ref={videoRef} className="absolute top-0 left-0 w-full h-full object-cover" muted playsInline />
      <div className="absolute inset-0 z-10" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-sm h-40 border-4 border-white rounded-lg opacity-75"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-11/12 max-w-sm h-1 bg-red-500 animate-pulse"></div>
      </div>
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
        <p className="text-lg font-semibold">Hướng camera vào mã vạch</p>
        <button onClick={onClose} className="bg-white/20 px-4 py-2 rounded-lg font-bold hover:bg-white/30 transition">
          Hủy
        </button>
      </div>
      {error && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-red-600 p-4 rounded-lg z-20 w-11/12 max-w-sm text-center">
          <p>{error}</p>
          <button onClick={onClose} className="mt-2 text-sm font-bold underline">Đóng</button>
        </div>
      )}
    </div>
  );
};


// --- Main ScanScreen Component ---
const ScanScreen: React.FC<ScanScreenProps> = ({ onNavigate, user, onLogout }) => {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const performSearch = async (barcodeValue: string) => {
    if (!barcodeValue.trim()) return;
    setLoading(true);
    setNotFound(false);

    try {
      // Fetch product from API
      const response = await fetch(`${API_URL}/api/products/${barcodeValue}`);
      
      if (response.ok) {
        // Product found
        const product = await response.json();
        onNavigate('detail', barcodeValue);
      } else if (response.status === 404) {
        // Product not found
        setNotFound(true);
      } else {
        throw new Error('Failed to fetch product');
      }
    } catch (error) {
      console.error('Error searching for product:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = () => {
    performSearch(barcode);
  };

  const handleScanSuccess = (scannedBarcode: string) => {
    setIsScanning(false);
    setBarcode(scannedBarcode);
    performSearch(scannedBarcode);
  };

  const handleCloseNotFoundModal = () => {
    setNotFound(false);
  };

  const NotFoundModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity" aria-modal="true" role="dialog">
      <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-sm transform transition-all">
        <h2 className="text-xl font-bold text-gray-800">Không tìm thấy sản phẩm</h2>
        
        <div className="my-4">
          <p className="text-sm text-gray-600">Mã vạch:</p>
          <div className="bg-gray-100 p-3 rounded-md text-center w-full mt-1">
            <span className="font-mono text-lg text-gray-800 tracking-wider">{barcode}</span>
          </div>
        </div>

        <p className="text-gray-700 my-6 text-center">Bạn có muốn tạo mới sản phẩm này không?</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCloseNotFoundModal}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Huỷ
          </button>
          <button
            onClick={() => onNavigate('create', barcode)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Tạo mới
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Kiểm tra sản phẩm</h1>
          <p className="text-xs text-gray-600 mt-1">
            <span className="font-semibold">{user.employeeName}</span>
            <span className="mx-1">•</span>
            <span className="text-gray-500">{user.username}</span>
          </p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Đăng xuất"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Đăng xuất
        </button>
      </header>
      <main className="flex-grow p-6 flex flex-col justify-center items-center">
        <button
          onClick={() => onNavigate('list')}
          className="bg-gray-800 text-white w-full py-4 rounded-lg flex items-center justify-center text-lg font-semibold shadow-lg hover:bg-gray-900 transition duration-300 mb-4"
        >
          <ListIcon className="w-6 h-6 mr-3" />
          Xem danh sách sản phẩm
        </button>
        
        <button
          onClick={() => setIsScanning(true)}
          className="bg-blue-600 text-white w-full py-4 rounded-lg flex items-center justify-center text-lg font-semibold shadow-lg hover:bg-blue-700 transition duration-300 mb-8"
        >
          <CameraIcon className="w-6 h-6 mr-3" />
          Quét mã vạch
        </button>
        
        <div className="w-full">
          <label htmlFor="barcode-input" className="block text-sm font-medium text-gray-700 mb-1">
            Mã vạch
          </label>
          <div className="flex flex-col space-y-4">
            <input
              id="barcode-input"
              type="text"
              value={barcode}
              onChange={(e) => {
                  setBarcode(e.target.value);
                  if (notFound) setNotFound(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
              placeholder="Nhập mã vạch..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <button
              onClick={handleManualSearch}
              disabled={loading || !barcode}
              className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 flex justify-center items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang tìm...
                </>
              ) : 'Tìm sản phẩm'}
            </button>
          </div>
        </div>
      </main>
      
      {notFound && <NotFoundModal />}
      {isScanning && <BarcodeScanner onScanSuccess={handleScanSuccess} onClose={() => setIsScanning(false)} />}
    </div>
  );
};

export default ScanScreen;
