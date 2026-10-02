import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, FileText, BadgeCheck } from 'lucide-react';
import type { Standard, StandardSearchFilters, StandardStatus } from '@/types';
import { standardsService } from '@/services';
import { PRODUCT_CATEGORIES, INDUSTRIES } from '@/data/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { LoadingState, NoResultsState, EmptyState } from '@/components/shared/state-components';
import { DisclaimerBanner } from '@/components/shared/trust-badges';
import { DISCLAIMER_SHORT } from '@/data/constants';

// ============================================================
// Standards Finder page
// ============================================================

const STATUS_OPTIONS: { value: StandardStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'under-revision', label: 'Under Revision' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'superseded', label: 'Superseded' },
];

export function StandardsFinderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [category, setCategory] = useState('All Categories');
  const [industry, setIndustry] = useState('All Industries');
  const [status, setStatus] = useState<StandardStatus | 'all'>('all');
  const [results, setResults] = useState<Standard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);
  const [page, setPage] = useState(1);

  const doSearch = useCallback(async (targetPage: number = page) => {
    setLoading(true);
    setHasSearched(true);
    const filters: StandardSearchFilters = {
      query: query.trim() || undefined,
      category: category !== 'All Categories' ? category : undefined,
      industry: industry !== 'All Industries' ? industry : undefined,
      status,
      page: targetPage,
      pageSize: 20,
    };
    const result = await standardsService.search(filters);
    if (result.data) {
      setResults(result.data.items);
      setTotal(result.data.total);
    }
    setLoading(false);
  }, [query, category, industry, status, page]);

  useEffect(() => {
    doSearch();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    doSearch(1);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Find the Right Indian Standard</h1>
        <p className="text-sm text-muted-foreground">
          Describe your product, material or application to discover potentially relevant standards.
        </p>
      </div>

      {/* Search box */}
      <Card className="p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your product, material or application…"
              className="pl-10 h-12 text-base"
              aria-label="Search query"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger aria-label="Product category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger aria-label="Industry">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={(v) => setStatus(v as StandardStatus | 'all')}>
              <SelectTrigger aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            Search Standards
          </Button>
        </form>
      </Card>

      <DisclaimerBanner message={DISCLAIMER_SHORT} className="mb-6" />

      {/* Results */}
      {loading ? (
        <LoadingState message="Searching standards…" />
      ) : !hasSearched ? (
        <EmptyState
          title="Start your search"
          description="Enter a product description or use filters to find relevant standards."
          icon={Search}
        />
      ) : results.length === 0 ? (
        <NoResultsState
          message="No standards found."
          suggestion="Try different keywords or adjust your filters."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} result{total !== 1 ? 's' : ''} found
            </p>
            
          </div>

          {results.map((standard) => (
            <StandardResultCard key={standard.id} standard={standard} onAskAssistant={() => navigate('/assistant', { state: { initialPrompt: `Tell me about standard ${standard.identifier} - ${standard.title}` } })} />
          ))}
          {/* Pagination */}
          {Math.ceil(total / 20) > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => { setPage(page - 1); doSearch(page - 1); }}
                    aria-disabled={page === 1}
                    className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).map((p) => {
                  if (p === 1 || p === Math.ceil(total / 20) || (p >= page - 2 && p <= page + 2)) {
                    return (
                      <PaginationItem key={p}>
                        <button
                          onClick={() => { setPage(p); doSearch(p); }}
                          className={cn(
                            'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium',
                            p === page ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
                          )}
                        >
                          {p}
                        </button>
                      </PaginationItem>
                    );
                  }
                  if (p === page - 3 || p === page + 3) {
                    return <PaginationItem key={p}><span className="px-2">...</span></PaginationItem>;
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => { setPage(page + 1); doSearch(page + 1); }}
                    aria-disabled={page === Math.ceil(total / 20)}
                    className={page === Math.ceil(total / 20) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}

function StandardResultCard({ standard, onAskAssistant }: { standard: Standard; onAskAssistant: () => void }) {
  const navigate = useNavigate();
  const statusColors: Record<string, string> = {
    active: 'bg-success/10 text-success',
    draft: 'bg-warning/10 text-warning',
    'under-revision': 'bg-accent/10 text-accent',
    withdrawn: 'bg-destructive/10 text-destructive',
    superseded: 'bg-muted text-muted-foreground',
  };

  return (
    <Card className="p-5 transition-all hover:shadow-md hover:border-primary/30">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-mono text-muted-foreground">{standard.identifier}</p>
              <h3 className="text-sm font-semibold text-foreground truncate">{standard.title}</h3>
            </div>
          </div>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[standard.status]}`}>
            {standard.status.replace('-', ' ')}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{standard.description}</p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">{standard.category}</Badge>
          <Badge variant="outline" className="text-xs">{standard.industry}</Badge>
          {standard.certificationRelevant && (
            <Badge variant="outline" className="text-xs text-success">
              <BadgeCheck className="h-3 w-3 mr-0.5" /> Certification
            </Badge>
          )}
        </div>

        <div className="flex gap-2 mt-1">
          <Button variant="outline" size="sm" onClick={() => navigate(`/standards/${standard.id}`)}>
            <FileText className="h-3.5 w-3.5 mr-1" />
            View Details
          </Button>
          <Button variant="ghost" size="sm" onClick={onAskAssistant}>
            <ArrowRight className="h-3.5 w-3.5 mr-1" />
            Ask Assistant
          </Button>
        </div>
      </div>
    </Card>
  );
}
