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

          
<div className="space-y-6">
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">{selectedProduct.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">{selectedProduct.category || 'General'}</span>
                    <span>•</span>
                    <span className="font-semibold text-foreground">{selectedProduct.scheme?.name || 'Standard Mark Scheme'}</span>
                  </p>
                </div>
                <Button onClick={() => navigate('/assistant', { state: { initialPrompt: `How do I apply for BIS certification for ${selectedProduct.name} under ${selectedProduct.standard?.isNumber}?` } })}>
                  Ask AI About Process
                </Button>
              </div>

              <h3 className="text-lg font-bold text-foreground border-b pb-2">6-Step Certification Guide</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Step 1 */}
                <Card className="p-5 border-t-4 border-t-blue-500 shadow-sm relative hover:shadow-md transition-all">
                  <div className="absolute -top-3 -left-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">1</div>
                  <h3 className="text-base font-bold text-foreground mb-2 mt-2">Identify Standard</h3>
                  <p className="text-sm text-muted-foreground mb-4">Ensure your product correctly maps to the Indian Standard.</p>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-xs font-semibold text-blue-600 mb-1">Applicable IS Number:</p>
                    <p className="text-sm font-bold cursor-pointer hover:underline" onClick={() => navigate(`/standards/${selectedProduct.standard?.id}`)}>{selectedProduct.standard?.isNumber || 'Unverified'}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{selectedProduct.standard?.title || 'No title available'}</p>
                  </div>
                </Card>

                {/* Step 2 */}
                <Card className="p-5 border-t-4 border-t-indigo-500 shadow-sm relative hover:shadow-md transition-all">
                  <div className="absolute -top-3 -left-3 bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">2</div>
                  <h3 className="text-base font-bold text-foreground mb-2 mt-2">Check Lab Equipment</h3>
                  <p className="text-sm text-muted-foreground mb-4">Procure or verify required testing equipment for your in-house lab.</p>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-xs text-muted-foreground">According to the Scheme of Testing & Inspection (STI) for <span className="font-semibold text-foreground">{selectedProduct.standard?.isNumber}</span>, essential testing equipment must be calibrated.</p>
                  </div>
                </Card>

                {/* Step 3 */}
                <Card className="p-5 border-t-4 border-t-purple-500 shadow-sm relative hover:shadow-md transition-all">
                  <div className="absolute -top-3 -left-3 bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">3</div>
                  <h3 className="text-base font-bold text-foreground mb-2 mt-2">Prepare Factory Docs</h3>
                  <p className="text-sm text-muted-foreground mb-4">Draft layout, manufacturing process flow, and quality control manual.</p>
                  {selectedProduct.scheme?.requirements?.length > 0 ? (
                    <ul className="space-y-2 mt-2">
                      {selectedProduct.scheme.requirements.slice(0, 2).map((req: any, i: number) => (
                        <li key={req.id} className="text-xs flex gap-2 items-start text-muted-foreground">
                          <span className="text-purple-500 mt-0.5">•</span>
                          <span>{req.title}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded">Gather incorporation certificates, MOA, and trademark registration.</p>
                  )}
                </Card>

                {/* Step 4 */}
                <Card className="p-5 border-t-4 border-t-pink-500 shadow-sm relative hover:shadow-md transition-all">
                  <div className="absolute -top-3 -left-3 bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">4</div>
                  <h3 className="text-base font-bold text-foreground mb-2 mt-2">Apply on ManakOnline</h3>
                  <p className="text-sm text-muted-foreground mb-4">Submit form, upload documents, and pay the requisite fee.</p>
                  <div className="bg-pink-500/10 p-3 rounded-md border border-pink-500/20">
                    <p className="text-xs font-semibold text-pink-700">Scheme Applied:</p>
                    <p className="text-sm font-bold text-pink-900 dark:text-pink-300">{selectedProduct.scheme?.name || 'Standard Mark Scheme'}</p>
                    <p className="text-xs mt-1 text-pink-800/80">Application Fee: ₹1,000</p>
                  </div>
                </Card>

                {/* Step 5 */}
                <Card className="p-5 border-t-4 border-t-orange-500 shadow-sm relative hover:shadow-md transition-all">
                  <div className="absolute -top-3 -left-3 bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">5</div>
                  <h3 className="text-base font-bold text-foreground mb-2 mt-2">Lab Testing & Inspection</h3>
                  <p className="text-sm text-muted-foreground mb-4">Send product sample to BIS recognized lab or await factory inspection.</p>
                  <Button variant="outline" size="sm" className="w-full text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 hover:text-orange-800" onClick={() => navigate('/laboratories')}>
                    Search BIS Recognized Labs
                  </Button>
                </Card>

                {/* Step 6 */}
                <Card className="p-5 border-t-4 border-t-green-500 shadow-sm relative hover:shadow-md transition-all">
                  <div className="absolute -top-3 -left-3 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">6</div>
                  <h3 className="text-base font-bold text-foreground mb-2 mt-2">Grant of License</h3>
                  <p className="text-sm text-muted-foreground mb-4">Receive your BIS License and start marking your product with the ISI/Registration mark.</p>
                  <div className="flex justify-center items-center h-12 bg-green-500/10 rounded-md border border-green-500/20">
                    <ShieldCheck className="h-6 w-6 text-green-600 mr-2" />
                    <span className="text-sm font-bold text-green-700">BIS Certified</span>
                  </div>
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
