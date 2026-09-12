import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ChevronDown,
  LogOut,
  User,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function UserMenu() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    activeRole,
    driverProfile,
    operatorProfile,
    openProfileModal,
    logout,
  } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const activeName =
    activeRole === 'driver'
      ? driverProfile.name || 'EV Driver'
      : operatorProfile.operatorName || 'Station Operator';

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <>
      <div className="relative">
        <button
          type="button"
          aria-label="Open user menu"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2.5 rounded-lg border border-subtle bg-surface px-2.5 py-1.5 transition-colors hover:bg-elevated hover:text-primary focus-ring"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent font-bold text-xs">
            {activeName.charAt(0).toUpperCase()}
          </span>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold text-primary leading-tight truncate max-w-[120px]">
              {activeName}
            </p>
            <p className="text-[0.65rem] font-medium text-accent uppercase tracking-wider leading-none mt-0.5">
              {activeRole === 'driver' ? 'EV Driver' : 'Operator'}
            </p>
          </div>
          <ChevronDown className="hidden h-3.5 w-3.5 text-secondary sm:block" />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-subtle bg-surface p-1.5 shadow-xl backdrop-blur-xl animate-fade-in">
              <div className="px-3 py-2 border-b border-subtle/60 mb-1">
                <p className="text-xs font-semibold text-primary truncate">{activeName}</p>
                <p className="text-[0.7rem] text-secondary truncate">
                  {activeRole === 'driver' ? driverProfile.email : operatorProfile.email}
                </p>
              </div>

              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      openProfileModal();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-primary hover:bg-elevated transition-colors"
                  >
                    <UserCheck className="h-4 w-4 text-accent" />
                    <span>Account Profile Settings</span>
                  </button>

                  <div className="my-1 border-t border-subtle/60" />

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-danger hover:bg-danger/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-accent hover:bg-accent/10 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-subtle bg-surface p-6 shadow-2xl backdrop-blur-xl animate-fade-in z-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/15 text-danger border border-danger/30">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-primary">Confirm Log Out</h3>
            <p className="mt-2 text-xs leading-relaxed text-secondary">
              Are you sure you want to log out of GreenVoltz? You will be redirected back to the login page.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-lg border border-subtle bg-elevated px-4 py-2.5 text-xs font-semibold text-primary hover:bg-surface focus-ring"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="rounded-lg bg-danger px-4 py-2.5 text-xs font-semibold text-background hover:bg-danger/90 focus-ring shadow-glow-green"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
