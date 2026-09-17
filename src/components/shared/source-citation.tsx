import { ShieldCheck, ShieldAlert, ShieldQuestion, FlaskRound, FileText } from 'lucide-react';
import type { VerificationStatus, SourceReference } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// ============================================================
// Source / Citation System — reusable components
// Designed for Phase 2 RAG integration
// ============================================================

export function VerificationBadge({ status, className }: { status: VerificationStatus; className?: string }) {
  const config: Record<VerificationStatus, { label: string; icon: typeof ShieldCheck; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
    verified: { label: 'Verified', icon: ShieldCheck, variant: 'default', color: 'text-success' },
    unverified: { label: 'Unverified', icon: ShieldAlert, variant: 'outline', color: 'text-warning' },
    demo: { label: 'Demo', icon: FlaskRound, variant: 'secondary', color: 'text-muted-foreground' },
    pending: { label: 'Verification Required', icon: ShieldQuestion, variant: 'outline', color: 'text-warning' },
    'not-available': { label: 'No Source Available', icon: ShieldAlert, variant: 'outline', color: 'text-destructive' },
  };

  const { label, icon: Icon, color } = config[status];

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', color, className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

export function CitationBadge({ identifier, index, className }: { identifier: string; index?: number; className?: string }) {
  return (
    <Badge variant="outline" className={cn('text-xs font-mono', className)}>
      {index !== undefined && <span className="text-muted-foreground mr-0.5">{index}</span>}
      {identifier}
    </Badge>
  );
}

export function ClauseReference({ section, clause, page }: { section?: string; clause?: string; page?: string }) {
  const parts: string[] = [];
  if (section) parts.push(`Section: ${section}`);
  if (clause) parts.push(`Clause: ${clause}`);
  if (page) parts.push(`Page: ${page}`);

  if (parts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {parts.map((part, i) => (
        <span key={i} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
          {part}
        </span>
      ))}
    </div>
  );
}

export function SourceCard({ source, index, className }: { source: SourceReference; index?: number; className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">{source.title}</p>
            {source.identifier && (
              <p className="text-xs font-mono text-muted-foreground mt-0.5">{source.identifier}</p>
            )}
          </div>
        </div>
        <VerificationBadge status={source.verificationStatus} />
      </div>

      {source.description && (
        <p className="text-xs text-muted-foreground mt-2">{source.description}</p>
      )}

      <ClauseReference section={source.section} clause={source.clause} page={source.page} />

      {source.url && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center text-xs font-medium text-primary hover:underline"
        >
          View Source
        </a>
      )}
      {!source.url && (
        <span className="mt-3 inline-flex items-center text-xs text-muted-foreground italic">
          Source link available after Phase 2 integration
        </span>
      )}

      {index !== undefined && (
        <span className="ml-2 text-xs text-muted-foreground">#{index}</span>
      )}
    </div>
  );
}

export function CitationPanel({ sources, className }: { sources: SourceReference[]; className?: string }) {
  if (!sources || sources.length === 0) {
    return (
      <div className={cn('rounded-lg border border-dashed p-4 text-center', className)}>
        <p className="text-xs text-muted-foreground">No verified source is available for this response.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {sources.map((source, i) => (
        <SourceCard key={source.id} source={source} index={i + 1} />
      ))}
    </div>
  );
}

export { type SourceReference };
