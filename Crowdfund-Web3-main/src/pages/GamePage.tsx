/**
 * GamePage - Main game entry point
 * 
 * This page now uses the new enhanced PigLifeGame component
 * which includes all features:
 * - Beautiful UI with animations
 * - Pig farming system
 * - Social actions
 * - Farming & harvesting
 * - Building & CEO race
 * - Walrus backup integration
 */

import { Component, type ErrorInfo, type ReactNode } from "react";
import { PigLifeGame } from "../components/piglife";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error với thông tin chi tiết
    console.error("🐷 GamePage Error Boundary caught an error:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorInfo,
    });

    // Lưu errorInfo vào state để hiển thị trong dev mode
    this.setState({ errorInfo });

    // Có thể gửi lên error tracking service ở đây (Sentry, LogRocket, etc.)
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      const errorMessage = this.state.error?.message || "Có lỗi xảy ra khi tải game. Vui lòng thử lại sau.";
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🐷</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Đã xảy ra lỗi
              </h1>
              <p className="text-gray-600 mb-6">
                {errorMessage}
              </p>
            </div>

            {/* Dev mode: Hiển thị stack trace */}
            {isDev && this.state.error?.stack && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <details className="text-left">
                  <summary className="cursor-pointer text-sm font-semibold text-red-700 mb-2">
                    Chi tiết lỗi (Dev Mode)
                  </summary>
                  <pre className="text-xs text-red-600 overflow-auto max-h-40 mt-2">
                    {this.state.error.stack}
                  </pre>
                </details>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                Thử lại
              </button>
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all"
              >
                Tải lại trang
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all"
              >
                Về trang chủ
              </button>
            </div>

            {/* Help text */}
            <p className="text-xs text-gray-500 text-center mt-6">
              Nếu lỗi vẫn tiếp tục, vui lòng liên hệ hỗ trợ hoặc thử lại sau.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component để sử dụng hooks
function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return <ErrorBoundaryClass>{children}</ErrorBoundaryClass>;
}

export function GamePage() {
  return (
    <ErrorBoundary>
      <PigLifeGame />
    </ErrorBoundary>
  );
}
