import React, { useState, useEffect } from 'react';
import { CheckWorkflowStats, Screen } from '../types';
import { BackIcon } from './icons';

const API_URL = import.meta.env.VITE_API_URL;

interface CheckDashboardProps {
  onNavigate: (screen: Screen) => void;
}

const CheckDashboard: React.FC<CheckDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<CheckWorkflowStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/check-workflow/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Đang tải thống kê...</p>
      </div>
    );
  }

  const progressPercent = stats.progress_percentage || 0;
  // Tính tiến độ check lần 1: số sản phẩm đã qua check lần 1 / tổng số
  const firstCheckCompleted = stats.pending_second_check + stats.completed;
  const firstCheckPercent = stats.total > 0 ? (firstCheckCompleted / stats.total) * 100 : 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-md p-4 flex items-center sticky top-0 z-10">
        <button onClick={() => onNavigate('scan')} className="text-gray-600 mr-4">
          <BackIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Thống kê Check Workflow</h1>
      </header>

      <main className="flex-grow overflow-y-auto p-4">
        {/* Progress Bar - Overall Completion */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-4 text-white shadow-lg">
          <h2 className="text-lg font-semibold mb-2">Tiến độ hoàn thành</h2>
          <div className="text-5xl font-bold mb-3">{progressPercent.toFixed(1)}%</div>
          <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-3 text-sm opacity-90">
            {stats.completed} / {stats.total} sản phẩm đã hoàn thành
          </div>
        </div>

        {/* Progress Bar - First Check */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 mb-4 text-white shadow-lg">
          <h2 className="text-lg font-semibold mb-2">Tiến độ Check lần 1</h2>
          <div className="text-5xl font-bold mb-3">{firstCheckPercent.toFixed(1)}%</div>
          <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${firstCheckPercent}%` }}
            />
          </div>
          <div className="mt-3 text-sm opacity-90">
            {firstCheckCompleted} / {stats.total} sản phẩm đã check lần 1
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <div className="text-gray-600 text-sm mb-1">Tổng sản phẩm</div>
            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-5 shadow-sm border border-yellow-200">
            <div className="text-yellow-700 text-sm mb-1">Chờ check lần 1</div>
            <div className="text-3xl font-bold text-yellow-800">{stats.pending_first_check}</div>
          </div>

          <div className="bg-blue-50 rounded-lg p-5 shadow-sm border border-blue-200">
            <div className="text-blue-700 text-sm mb-1">Chờ duyệt lần 2</div>
            <div className="text-3xl font-bold text-blue-800">{stats.pending_second_check}</div>
          </div>

          <div className="bg-green-50 rounded-lg p-5 shadow-sm border border-green-200">
            <div className="text-green-700 text-sm mb-1">Đã hoàn thành</div>
            <div className="text-3xl font-bold text-green-800">{stats.completed}</div>
          </div>
        </div>

        {/* Check Results Breakdown */}
        <div className="bg-white rounded-lg p-5 shadow-sm mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">Kết quả kiểm tra</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-green-600 text-xl">✓</span>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Đúng</div>
                  <div className="text-xs text-gray-500">Không cần sửa</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.correct_count}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-orange-600 text-xl">⚠</span>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Cần sửa</div>
                  <div className="text-xs text-gray-500">Có thay đổi</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {stats.needs_correction_count}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-red-600 text-xl">✗</span>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Sai</div>
                  <div className="text-xs text-gray-500">Hoàn toàn sai</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {stats.incorrect_count}
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Visualization */}
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Quy trình kiểm tra</h3>
          
          <div className="flex items-center justify-between text-center">
            <div className="flex-1">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📋</span>
              </div>
              <div className="text-sm font-medium text-gray-800">Pending</div>
              <div className="text-xl font-bold text-yellow-600">{stats.pending_first_check}</div>
            </div>

            <div className="flex-shrink-0 text-gray-400 text-2xl">→</div>

            <div className="flex-1">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">✏️</span>
              </div>
              <div className="text-sm font-medium text-gray-800">Check 1</div>
              <div className="text-xl font-bold text-blue-600">{stats.pending_second_check}</div>
            </div>

            <div className="flex-shrink-0 text-gray-400 text-2xl">→</div>

            <div className="flex-1">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-sm font-medium text-gray-800">Done</div>
              <div className="text-xl font-bold text-green-600">{stats.completed}</div>
            </div>
          </div>
        </div>

        {/* Refresh Info */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Tự động cập nhật mỗi 30 giây</p>
          <button 
            onClick={fetchStats}
            className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            🔄 Làm mới ngay
          </button>
        </div>
      </main>
    </div>
  );
};

export default CheckDashboard;
