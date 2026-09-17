import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, ShieldCheck, BookOpen, Microscope, Info, GitMerge, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/shared/state-components';

export function CertificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, hasNext: false, hasPrevious: false });
  const [error, setError] = useState<string | null>(null);

  const doSearch = useCallback(async (q: string, targetPage: number = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    setHasSearched(true);
    setError(null);
    setSelectedProduct(null);
    
    try {
      const res = await fetch(`http://localhost:3001/api/certifications?q=${encodeURIComponent(q)}&page=${targetPage}&limit=20`);
      if (!res.ok) throw new Error('Failed to fetch certifications');
      const data = await res.json();
      
      setResults(data.products || []);
      
      // Auto select if only one result or exact match
      if (data.products && data.products.length === 1) {
        setSelectedProduct(data.products[0]);
      } else if (data.products) {
        const exact = data.products.find((p: any) => p.name.toLowerCase() === q.toLowerCase());
        if (exact) setSelectedProduct(exact);
      }
    } catch (e: any) {
      setError(e.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doSearch(initialQ, 1);
  }, [initialQ, doSearch]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query, 1);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GitMerge className="h-6 w-6 text-primary" />
          Product Certification Catalogue
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore the comprehensive database of BIS Standards, Certification Schemes, and mandatory/voluntary requirements.
        </p>
      </div>

      <Card className="mb-8 p-4 bg-gradient-to-r from-card to-card/50 border-primary/20">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product (e.g. 'Toys', 'Water', 'Cement')"
              className="pl-9 bg-background/50"
            />
          </div>
          <Button type="submit" disabled={loading}>Search Catalogue</Button>
        </form>
      </Card>

      {error && (
        <div className="mb-8 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!selectedProduct ? (
        <div className="space-y-4">
          {loading ? (
            <LoadingState message="Loading certification information..." />
          ) : hasSearched && results.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-12 text-center">
              <p className="text-muted-foreground">No verified BIS certification information found for this search.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {results.map((product) => (
                  <Card key={product.id} className="p-4 cursor-pointer hover:border-primary/40 transition-all hover:shadow-md" onClick={() => setSelectedProduct(product)}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <div className="flex gap-4 mt-2">
                          <span className="text-xs flex items-center gap-1 text-primary"><BookOpen className="h-3 w-3"/> {product.standard?.isNumber || 'No Standard mapped'}</span>
                          <span className={`text-xs flex items-center gap-1 ${product.category === 'Compulsory' ? 'text-destructive' : 'text-muted-foreground'}`}><Info className="h-3 w-3"/> {product.category}</span>
                          <span className="text-xs flex items-center gap-1 text-success"><ShieldCheck className="h-3 w-3"/> {product.scheme?.name}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Card>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 border-t pt-4">
                  <span className="text-sm text-muted-foreground">
                    Showing page {page} of {pagination.totalPages} ({pagination.total} total records)
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={!pagination.hasPrevious || loading}
                      onClick={() => doSearch(query, page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={!pagination.hasNext || loading}
                      onClick={() => doSearch(query, page + 1)}
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="animate-fade-in space-y-6">
          <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)} className="mb-2 -ml-2 text-muted-foreground">
            ← Back to catalogue
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <Card className="p-5 border-l-4 border-l-primary shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><BookOpen className="h-20 w-20" /></div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">1. Applicable Standard</h3>
                <h2 className="text-2xl font-bold text-primary mb-2 cursor-pointer hover:underline" onClick={() => navigate(`/standards/${selectedProduct.standard?.id}`)}>
                  {selectedProduct.standard?.isNumber || 'Unverified'}
                </h2>
                <p className="text-sm font-medium">{selectedProduct.standard?.title || 'No title available'}</p>
              </Card>

              <Card className="p-5 border-l-4 border-l-foreground shadow-sm">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Product Category</h3>
                <h2 className="text-xl font-bold mb-2">{selectedProduct.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedProduct.category || 'General'}</p>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-5 border-l-4 border-l-success shadow-sm h-full">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  2. Certification Scheme
                </h3>
                <h2 className="text-xl font-bold mb-3">{selectedProduct.scheme?.name}</h2>
                <p className="text-sm mb-6">{selectedProduct.scheme?.description}</p>
                
                <h4 className="font-semibold text-sm border-b pb-2 mb-3">Requirements</h4>
                {selectedProduct.scheme?.requirements?.length > 0 ? (
                  <ul className="space-y-3">
                    {selectedProduct.scheme.requirements.map((req: any, i: number) => (
                      <li key={req.id} className="text-sm flex gap-2 items-start">
                        <span className="bg-success/10 text-success rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-xs mt-0.5">{i+1}</span>
                        <div>
                          <strong className="block">{req.title}</strong>
                          <span className="text-muted-foreground text-xs">{req.description}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No specific requirements listed.</p>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-5 border-l-4 border-l-purple-500 shadow-sm h-full">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Microscope className="h-4 w-4 text-purple-500" />
                  3. Testing & Laboratories
                </h3>
                
                <div className="bg-purple-500/10 rounded-lg p-4 mb-4 border border-purple-500/20">
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-300">
                    Testing is required as per {selectedProduct.standard?.isNumber}.
                  </p>
                </div>

                <h4 className="font-semibold text-sm border-b pb-2 mb-3">Authorized Laboratories</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  <Info className="h-3 w-3 inline mr-1" />
                  Relevant laboratory information is not available in the verified database.
                </p>
                <Button variant="outline" className="w-full text-xs" onClick={() => navigate('/laboratories')}>
                  Search All Laboratories
                </Button>
              </Card>
            </div>
          </div>
          
          <div className="mt-8">
            <Card className="p-5 border-l-4 border-l-gray-500 shadow-sm">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Official Sources</h3>
              <p className="text-sm"><strong>Source Document:</strong> BIS Official Standard Registry</p>
              <p className="text-sm"><strong>Verification Date:</strong> {new Date().toLocaleDateString()}</p>
              <p className="text-sm"><strong>URL:</strong> <a href="https://www.bis.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">bis.gov.in</a></p>
            </Card>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button onClick={() => navigate('/assistant')}>Ask AI Assistant for Process Details</Button>
          </div>
        </div>
      )}
    </div>
  );
}
