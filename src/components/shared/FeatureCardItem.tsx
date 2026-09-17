import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { FeatureCard } from '@/types';
import { getIcon } from '@/lib/icons';
import { Card } from '@/components/ui/card';

// ============================================================
// Reusable feature card — "What can the BIS Assistant help with?"
// ============================================================

export function FeatureCardItem({ feature, className }: { feature: FeatureCard; className?: string }) {
  const Icon = getIcon(feature.icon);
  return (
    <Card className={cn('p-5 transition-all hover:shadow-sm hover:border-primary/20', className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
    </Card>
  );
}

import { cn } from '@/lib/utils';
