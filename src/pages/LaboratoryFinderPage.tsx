import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, FlaskConical, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Laboratory, LaboratorySearchFilters } from '@/types';
import { laboratoryService } from '@/services';
import { LABORATORY_STATES, TEST_TYPES, PRODUCT_CATEGORIES } from '@/data/constants';
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
// Laboratory Finder page
// ============================================================

export function LaboratoryFinderPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [state, setState] = useState('All States');
  const [productCategory, setProductCategory] = useState('All Categories');
  const [testType, setTestType] = useState('All Test Types');
  const [results, setResults] = useState<Laboratory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  const doSearch = useCallback(async (p: number = 1) => {
    setLoading(true);
    setHasSearched(true);
    const filters: LaboratorySearchFilters = {
      query: query.trim() || undefined,
      state: state !== 'All States' ? state : undefined,
      productCategory: productCategory !== 'All Categories' ? productCategory : undefined,
      testType: testType !== 'All Test Types' ? testType : undefined,
      page: p,
      pageSize: PAGE_SIZE,
    };
    const result = await laboratoryService.search(filters);
    if (result.error) {
      setError(result.error);
      setResults([]);
      setTotal(0);
    } else if (result.data) {
      setError(null);
      setResults(result.data.items);
      setTotal(result.data.total);
    }
    setLoading(false);
  }, [query, state, productCategory, testType]);

  useEffect(() => {
    doSearch(1);
  }, [doSearch]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    doSearch(1);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Find a Testing Laboratory</h1>
        <p className="text-sm text-muted-foreground">
          Search for testing laboratories by product, test type, or location.
        </p>
      </div>

      <DisclaimerBanner message={DISCLAIMER_SHORT} className="mb-6" />

      {/* Search + filters */}
      <Card className="p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product, test or laboratory…"
              className="pl-10 h-12 text-base"
              aria-label="Search laboratories"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={state} onValueChange={setState}>
              <SelectTrigger aria-label="State"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LABORATORY_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            

            <Select value={productCategory} onValueChange={setProductCategory}>
              <SelectTrigger aria-label="Product category"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={testType} onValueChange={setTestType}>
              <SelectTrigger aria-label="Test type"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TEST_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            Search Laboratories
          </Button>
        </form>
      </Card>

      {/* Results */}
      {error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center animate-fade-in mb-6">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      ) : loading ? (
        <LoadingState message="Finding laboratories…" />
      ) : results.length === 0 ? (
        hasSearched ? (
          <NoResultsState message="No laboratories match your current filters." suggestion="Try removing a capability filter, broadening your search, or changing the state." />
        ) : (
          <EmptyState title="Start your search" description="Search for laboratories by product, test, or location." icon={Search} />
        )
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{total} laborator{total !== 1 ? 'ies' : 'y'} found</p>
            
          </div>
          {results.map((lab) => (
            <LaboratoryCard key={lab.id} lab={lab} onAskAssistant={() => navigate('/assistant')} />
          ))}
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => { setPage(page - 1); doSearch(page - 1); }}
                    aria-disabled={page === 1}
                    className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  // Only show a few pages around the current page to avoid clutter
                  if (p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2)) {
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
                    aria-disabled={page === totalPages}
                    className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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

function LaboratoryCard({ lab, onAskAssistant }: { lab: Laboratory; onAskAssistant: () => void }) {
  return (
    <Card className="p-5 transition-all hover:shadow-md hover:border-primary/30">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">{lab.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" /> {lab.location}
              </p>
            </div>
          </div>
          
        </div>

        {/* Capabilities */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Testing Capabilities</p>
          <div className="flex flex-wrap gap-1.5">
            {lab.capabilities.map((cap, i) => (
              <Badge key={i} variant="outline" className="text-xs">{cap}</Badge>
            ))}
          </div>
        </div>

        {/* Product categories */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Product Categories</p>
          <div className="flex flex-wrap gap-1.5">
            {lab.productCategories.map((cat, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{cat}</Badge>
            ))}
          </div>
        </div>

        
        <div className="flex flex-col gap-1.5 mt-2 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs font-semibold text-foreground border-b pb-1 mb-1">Laboratory Details</p>
          {lab.labCode && <p className="text-xs text-muted-foreground"><strong>Lab Code:</strong> {lab.labCode}</p>}
          {lab.status && <p className="text-xs text-muted-foreground"><strong>Status:</strong> <span className="text-green-600">{lab.status}</span></p>}
          {lab.validityDate && <p className="text-xs text-muted-foreground"><strong>Valid Till:</strong> {lab.validityDate}</p>}
          {lab.phone && <p className="text-xs text-muted-foreground"><strong>Phone:</strong> {lab.phone}</p>}
          {lab.email && <p className="text-xs text-muted-foreground"><strong>Email:</strong> {lab.email}</p>}
          {!lab.phone && !lab.email && lab.contact && <p className="text-xs text-muted-foreground"><strong>Contact:</strong> {lab.contact}</p>}
        </div>


        <Button variant="ghost" size="sm" className="self-start" onClick={onAskAssistant}>
          Ask Assistant <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
