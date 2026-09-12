import { Menu, X } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import IconButton from '@/components/ui/IconButton';

export default function MobileMenuButton() {
  const { mobileMenuOpen, toggleMobileMenu } = useApp();
  return (
    <IconButton label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'} onClick={toggleMobileMenu}>
      {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </IconButton>
  );
}
