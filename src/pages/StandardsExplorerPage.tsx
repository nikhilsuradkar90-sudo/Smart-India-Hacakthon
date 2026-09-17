import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, List, ArrowRight, FileText } from 'lucide-react';
import type { Standard, StandardSearchFilters, StandardStatus, StandardType } from '@/types';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { LoadingState, NoResultsState,  } from '@/components/shared/state-components';
import { DisclaimerBanner } from '@/components/shared/trust-badges';
import { DISCLAIMER_SHORT } from '@/data/constants';
import { cn } from '@/lib/utils';

// ============================================================
// Standards Explorer page
// ============================================================

const STATUS_OPTIONS: { value: StandardStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'under-revision', label: 'Under Revision' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

const TYPE_OPTIONS: { value: StandardType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'product', label: 'Product' },
  { value: 'test-method', label: 'Test Method' },
  { value: 'safety', label: 'Safety' },
  { value: 'management-system', label: 'Management System' },
  { value: 'terminology', label: 'Terminology' },
  { value: 'process', label: 'Process' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'year-desc', label: 'Newest First' },
  { value: 'year-asc', label: 'Oldest First' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'updated-desc', label: 'Recently Updated' },
];

const PAGE_SIZE = 6;

export function StandardsExplorerPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [industry, setIndustry] = useState('All Industries');
  const [status, setStatus] = useState<StandardStatus | 'all'>('all');
  const [type, setType] = useState<StandardType | 'all'>('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [results, setResults] = useState<Standard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const doSearch = useCallback(async (p: number) => {
    setLoading(true);
    const filters: StandardSearchFilters = {
      query: query.trim() || undefined,
      category: category !== 'All Categories' ? category : undefined,
      industry: industry !== 'All Industries' ? industry : undefined,
      status,
      type,
      sortBy: sortBy as StandardSearchFilters['sortBy'],
      page: p,
      pageSize: PAGE_SIZE,
    };
    const result = await standardsService.search(filters);
    if (result.data) {
      setResults(result.data.items);
      setTotal(result.data.total);
    }
    setLoading(false);
  }, [query, category, industry, status, type, sortBy]);

  useEffect(() => {
    doSearch(1);
  }, [doSearch]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const statusColors: Record<string, string> = {
    active: 'bg-success/10 text-success',
    draft: 'bg-warning/10 text-warning',
    'under-revision': 'bg-accent/10 text-accent',
    withdrawn: 'bg-destructive/10 text-destructive',
    superseded: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Standards Explorer</h1>
        <p className="text-sm text-muted-foreground">
          Browse and explore the full catalog of available standards.
        </p>
      </div>

      <DisclaimerBanner message={DISCLAIMER_SHORT} className="mb-6" />

      {/* Search + filters bar */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch(1)}
              placeholder="Search standards by title, identifier or keyword…"
              className="pl-9"
              aria-label="Search standards"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="text-xs" aria-label="Category"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="text-xs" aria-label="Industry"><SelectValue /></SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={(v) => setStatus(v as StandardStatus | 'all')}>
              <SelectTrigger className="text-xs" aria-label="Status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={type} onValueChange={(v) => setType(v as StandardType | 'all')}>
              <SelectTrigger className="text-xs" aria-label="Type"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] text-xs" aria-label="Sort by"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 border rounded-md p-0.5">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {loading ? (
        <LoadingState message="Loading standards…" />
      ) : results.length === 0 ? (
        <NoResultsState message="No standards found." suggestion="Try different keywords or filters." />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{total} standard{total !== 1 ? 's' : ''}</p>
            
          </div>

          {/* Grid view */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((std) => (
                <Card
                  key={std.id}
                  className="p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
                  onClick={() => navigate(`/standards/${std.id}`)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-muted-foreground">{std.identifier}</p>
                      <h3 className="text-sm font-semibold text-foreground line-clamp-2">{std.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{std.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="outline" className="text-xs">{std.category}</Badge>
                    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', statusColors[std.status])}>
                      {std.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{std.publishedYear}</span>
                    <span className="flex items-center gap-1 text-primary font-medium">
                      Details <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* List / Table view (desktop) */}
          {viewMode === 'list' && (
            <>
              {/* Desktop table */}
              <div className="hidden md:block rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Standard</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((std) => (
                      <TableRow
                        key={std.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/standards/${std.id}`)}
                      >
                        <TableCell className="font-mono text-xs">{std.identifier}</TableCell>
                        <TableCell className="max-w-xs truncate text-sm">{std.title}</TableCell>
                        <TableCell className="text-xs">{std.category}</TableCell>
                        <TableCell>
                          <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', statusColors[std.status])}>
                            {std.status.replace('-', ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">{std.lastUpdated}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            View <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {results.map((std) => (
                  <Card
                    key={std.id}
                    className="p-4 cursor-pointer"
                    onClick={() => navigate(`/standards/${std.id}`)}
                  >
                    <p className="text-xs font-mono text-muted-foreground">{std.identifier}</p>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{std.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <Badge variant="outline" className="text-xs">{std.category}</Badge>
                      <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', statusColors[std.status])}>
                        {std.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Updated: {std.lastUpdated}</p>
                  </Card>
                ))}
              </div>
            </>
          )}

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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
                ))}
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
        </>
      )}
    </div>
  );
}
