import { useNavigate } from 'react-router-dom';
import { Car, Bolt, Zap, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12 text-center">
      {/* Brand mark */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-green/10 shadow-glow-green">
        <Zap className="h-10 w-10 text-accent-green" />
      </div>

      {/* Headline */}
      <Badge variant="cyan" className="mb-4">Phase 2 — Foundation</Badge>
      <h1 className="text-5xl font-bold tracking-tight text-text-primary">
        Green<span className="text-gradient-green">Voltz</span>
      </h1>
      <p className="mt-3 max-w-md text-lg text-text-secondary leading-relaxed">
        AI-powered EV charging orchestration.
        <br />
        <span className="text-accent-green font-medium">Predict</span>
        {' · '}
        <span className="text-accent-cyan font-medium">Optimise</span>
        {' · '}
        <span className="text-warn-amber font-medium">Reserve</span>
        {' · '}
        <span className="text-success-green font-medium">Adapt</span>
      </p>

      {/* CTA buttons */}
      <div className="mt-10 flex flex-wrap gap-4 justify-center">
        <Button
          size="lg"
          variant="primary"
          leftIcon={<Car className="h-5 w-5" />}
          rightIcon={<ArrowRight className="h-4 w-4" />}
          onClick={() => navigate('/driver')}
        >
          Driver Dashboard
        </Button>
        <Button
          size="lg"
          variant="secondary"
          leftIcon={<Bolt className="h-5 w-5" />}
          rightIcon={<ArrowRight className="h-4 w-4" />}
          onClick={() => navigate('/operator')}
        >
          Operator View
        </Button>
      </div>

      {/* Platform overview cards */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-3xl">
        {[
          { label: 'Predict',   desc: 'Carbon & demand forecasting',  color: 'text-accent-green' },
          { label: 'Optimise',  desc: 'CP-SAT schedule optimisation', color: 'text-accent-cyan'  },
          { label: 'Reserve',   desc: 'Smart reservation management', color: 'text-warn-amber'   },
          { label: 'Adapt',     desc: 'Real-time disruption response', color: 'text-success-green'},
        ].map(card => (
          <div
            key={card.label}
            className="rounded-xl bg-bg-surface border border-bg-border p-4 text-left"
          >
            <p className={`text-sm font-semibold ${card.color}`}>{card.label}</p>
            <p className="mt-1 text-xs text-text-secondary">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
