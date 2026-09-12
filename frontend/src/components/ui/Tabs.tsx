import { useState} from 'react';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export default function Tabs({ tabs, defaultTab, className = '' }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '');
  const current = tabs.find(t => t.id === active);

  return (
    <div className={className}>
      <div className="flex gap-0.5 border-b border-bg-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={[
              'px-4 py-2.5 text-sm font-medium transition-colors duration-150',
              'border-b-2 -mb-px focus-ring rounded-t',
              active === tab.id
                ? 'border-accent-green text-accent-green'
                : 'border-transparent text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4">{current?.content}</div>
    </div>
  );
}
