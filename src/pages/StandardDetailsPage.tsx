import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, BadgeCheck, FlaskConical, BookOpen, Sparkles, ExternalLink, Calendar } from 'lucide-react';
import type { Standard } from '@/types';
import { standardsService } from '@/services';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingState, ErrorState } from '@/components/shared/state-components';
import { VerificationNotice, DisclaimerBanner } from '@/components/shared/trust-badges';
import { DISCLAIMER_SHORT } from '@/data/constants';

// ============================================================
// Standard Details page
// ============================================================

export function StandardDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [standard, setStandard] = useState<Standard | null>(null);
  const [related, setRelated] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      standardsService.getById(id),
      standardsService.getRelated(id),
    ]).then(([stdResult, relResult]) => {
      if (stdResult.data) {
        setStandard(stdResult.data);
      } else {
        setError(true);
      }
      if (relResult.data) {
        setRelated(relResult.data);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingState message="Loading standard details…" className="py-20" />;
  if (error || !standard) return <ErrorState message="Standard not found." onRetry={() => navigate('/explorer')} className="py-20" />;

  const statusColors: Record<string, string> = {
    active: 'bg-success/10 text-success',
    draft: 'bg-warning/10 text-warning',
    'under-revision': 'bg-accent/10 text-accent',
    withdrawn: 'bg-destructive/10 text-destructive',
    superseded: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-8 py-8 animate-fade-in">
      {/* Back link */}
      <Link to="/explorer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Standards Explorer
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="text-sm font-mono text-muted-foreground">{standard.identifier}</p>
            
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-2">{standard.title}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">{standard.category}</Badge>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[standard.status]}`}>
              {standard.status.replace('-', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Overview
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{standard.description}</p>
          </Card>

          {/* Scope */}
          {standard.scope && (
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">Scope</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{standard.scope}</p>
            </Card>
          )}

          {/* Key Requirements */}
          {standard.keyRequirements && standard.keyRequirements.length > 0 && (
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">Key Requirements</h2>
              <ul className="space-y-2">
                {standard.keyRequirements.map((req, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Certification Relevance */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-primary" /> Certification Relevance
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {standard.certificationRelevant
                ? 'This standard is potentially relevant to BIS certification. Verification is required to determine the exact certification scheme and requirements.'
                : 'This standard may not directly require BIS certification. Verify with official BIS information.'}
            </p>
          </Card>

          {/* Testing Information */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" /> Testing Information
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {standard.testingRelevant
                ? 'This standard involves testing requirements. Use the Laboratory Finder to locate relevant testing facilities.'
                : 'This standard may not involve specific testing requirements.'}
            </p>
            {standard.testingRelevant && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/laboratories')}>
                <FlaskConical className="h-3.5 w-3.5 mr-1" />
                Find Laboratory
              </Button>
            )}
          </Card>

          {/* Related Standards */}
          {related.length > 0 && (
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">Related Standards</h2>
              <div className="space-y-2">
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/standards/${rel.id}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-muted-foreground">{rel.identifier}</p>
                      <p className="text-sm font-medium text-foreground truncate">{rel.title}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* References placeholder */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">References & Related Documents</h2>
              {standard.references && standard.references.length > 0 ? (
                <ul className="space-y-3">
                  {standard.references.map((ref, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30">
                      <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{ref.title}</p>
                        <p className="text-xs text-muted-foreground capitalize mt-1">{ref.type}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No reference documents available.
                </p>
              )}
          </Card>
        </div>

        {/* Right sidebar summary */}
        <div className="space-y-4">
          <Card className="p-5 sticky top-20">
            <h3 className="text-sm font-semibold text-foreground mb-4">Summary</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Standard Number</dt>
                <dd className="font-mono text-foreground">{standard.identifier}</dd>
              </div>
              <Separator />
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="text-foreground capitalize">{standard.status.replace('-', ' ')}</dd>
              </div>
              <Separator />
              <div>
                <dt className="text-xs text-muted-foreground">Category</dt>
                <dd className="text-foreground">{standard.category}</dd>
              </div>
              <Separator />
              <div>
                <dt className="text-xs text-muted-foreground">Industry</dt>
                <dd className="text-foreground">{standard.industry}</dd>
              </div>
              <Separator />
              <div>
                <dt className="text-xs text-muted-foreground">Published Year</dt>
                <dd className="text-foreground">{standard.publishedYear}</dd>
              </div>
              <Separator />
              <div>
                <dt className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Last Updated
                </dt>
                <dd className="text-foreground">{standard.lastUpdated}</dd>
              </div>
              <Separator />
              <div>
                <dt className="text-xs text-muted-foreground">Certification Relevance</dt>
                <dd className="text-foreground">{standard.certificationRelevant ? 'Yes' : 'No'}</dd>
              </div>
            </dl>

            <Button className="w-full mt-5" onClick={() => navigate('/assistant')}>
              <Sparkles className="h-4 w-4 mr-2" />
              Ask Assistant about this Standard
            </Button>
          </Card>

          <VerificationNotice />
          <DisclaimerBanner message={DISCLAIMER_SHORT} />
        </div>
      </div>
    </div>
  );
}
