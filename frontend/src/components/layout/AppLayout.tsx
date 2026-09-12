import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useApp } from '@/app/AppContext';

export default function AppLayout() {
  const { mobileMenuOpen, closeMobileMenu } = useApp();
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-30 bg-background/70 lg:hidden"
        />
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
