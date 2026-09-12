import { SectionHeader } from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';
import { Construction } from 'lucide-react';

export default function ReservationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Reservation Management"
        subtitle="Coming in Frontend Phase 2"
      />
      <EmptyState
        icon={<Construction className="h-8 w-8" />}
        title="This section is under construction"
        description="The Reservation Management experience will be built in the next frontend phase."
      />
    </div>
  );
}
