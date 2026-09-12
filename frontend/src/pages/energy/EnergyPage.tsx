import { SectionHeader } from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';
import { Construction } from 'lucide-react';

export default function EnergyPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Energy & Forecasting"
        subtitle="Coming in Frontend Phase 2"
      />
      <EmptyState
        icon={<Construction className="h-8 w-8" />}
        title="This section is under construction"
        description="The Energy & Forecasting experience will be built in the next frontend phase."
      />
    </div>
  );
}
