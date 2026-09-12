import { ChevronDown, UserRound } from 'lucide-react';

export default function UserMenu() {
  return (
    <button
      type="button"
      aria-label="Open user menu"
      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-secondary transition-colors hover:bg-elevated hover:text-primary focus-ring"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-subtle bg-elevated text-accent">
        <UserRound className="h-3.5 w-3.5" />
      </span>
      <span className="hidden text-sm sm:block">Account</span>
      <ChevronDown className="hidden h-3.5 w-3.5 sm:block" />
    </button>
  );
}
