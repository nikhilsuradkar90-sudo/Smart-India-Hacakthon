import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { QuickAction } from '@/types';
import { getIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

// ============================================================
// Reusable quick action card for home dashboard
// ============================================================

const accentStyles: Record<string, string> = {
  primary: 'text-primary bg-primary/10',
  accent: 'text-accent bg-accent/10',
  success: 'text-success bg-success/10',
  warning: 'text-warning bg-warning/10',
  neutral: 'text-muted-foreground bg-muted',
};

export function QuickActionCard({ action, className }: { action: QuickAction; className?: string }) {
  const Icon = getIcon(action.icon);
  return (
    <Link to={action.path} aria-label={action.title} className="block">
      <Card
        className={cn(
          'group p-5 h-full transition-all hover:shadow-md hover:border-primary/30 cursor-pointer focus-within:ring-2 focus-within:ring-ring',
          className,
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', accentStyles[action.accent])}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">{action.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{action.description}</p>
      </Card>
    </Link>
  );
}
