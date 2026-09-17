import { FlaskRound, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// Demo / trust badges — visual distinction between
// source-backed info, demo data, AI interpretation, etc.
// ============================================================

export function DemoBadge({ className, label = 'Demo data' }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning',
        className,
      )}
    >
      <FlaskRound className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}

export function InfoBadge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary',
        className,
      )}
    >
      <Info className="h-3 w-3" aria-hidden="true" />
      {children}
    </span>
  );
}

export function DisclaimerBanner({ message, className }: { message: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3',
        className,
      )}
      role="note"
    >
      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" aria-hidden="true" />
      <p className="text-xs text-foreground/80 leading-relaxed">{message}</p>
    </div>
  );
}

export function VerificationNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3',
        className,
      )}
      role="note"
    >
      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" aria-hidden="true" />
      <p className="text-xs text-foreground/80 leading-relaxed">
        Verification required — verify the latest requirements using official BIS information.
      </p>
    </div>
  );
}
