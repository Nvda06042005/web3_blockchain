import { Navbar } from "./Navbar";
import { Outlet, useLocation } from "react-router-dom";

export function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className={isHomePage ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
        <Outlet />
      </main>
      {!isHomePage && (
        <footer className="bg-white border-t border-gray-200 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="font-semibold text-gray-900">CrowdFund</span>
              </div>
              <p className="text-sm text-gray-500">
                Built on Sui Blockchain • 1.5% Platform Fee
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export { Navbar };
