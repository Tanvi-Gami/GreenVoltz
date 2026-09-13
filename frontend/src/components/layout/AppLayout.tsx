import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useApp } from '@/app/AppContext';
import { useAuth } from '@/context/AuthContext';
import ProfileModal from '@/components/auth/ProfileModal';

export default function AppLayout() {
  const location = useLocation();
  const { mobileMenuOpen, closeMobileMenu } = useApp();
  const { isAuthenticated } = useAuth();

  const isLoginPage = location.pathname === '/login' || location.pathname === '/';
  const showSidebar = isAuthenticated && !isLoginPage;

  return (
    <div className="flex min-h-dvh w-full overflow-hidden bg-background">
      {showSidebar && <Sidebar />}

      {showSidebar && mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-30 bg-background/70 lg:hidden"
        />
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header hideMobileMenu={!showSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-6">
          <div className="mx-auto w-full max-w-[430px] lg:max-w-none">
            <Outlet />
          </div>
        </main>
      </div>

      <ProfileModal />
    </div>
  );
}
