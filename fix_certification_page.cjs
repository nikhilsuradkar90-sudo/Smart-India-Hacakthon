const fs = require('fs');

const code = `
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, FileText, CheckCircle, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingState, EmptyState } from '@/components/shared/state-components';

export default function CertificationPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setHasSearched(true);
    setError(null);
    setSelectedProduct(null);
    
    try {
      const res = await fetch(\`/api/certifications?q=\${encodeURIComponent(q)}\`);
      if (!res.ok) throw new Error('Failed to fetch certifications');
      const data = await res.json();
      setResults(data.products || []);
    } catch (e: any) {
      setError(e.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">BIS Certification Guide</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search for a product to find its official BIS certification scheme, standard, and requirements.
        </p>
      </div>

      <Card className="mb-8 p-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product (e.g. 'Toys', 'Water', 'Cement')"
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={loading || !query.trim()}>Search</Button>
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
            <LoadingState message="Searching certification records..." />
          ) : hasSearched && results.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Certification information for this product is currently unavailable in the verified BIS knowledge base.
            </div>
          ) : (
            results.map((product) => (
              <Card key={product.id} className="p-4 cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setSelectedProduct(product)}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-primary text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">Standard: {product.standard?.isNumber || 'N/A'}</p>
                    <p className="text-sm font-medium mt-2">{product.scheme?.name}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="animate-fade-in space-y-6">
          <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)} className="mb-2">
            ← Back to results
          </Button>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-6 w-6 text-success" />
              <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Certification Scheme</p>
                <p className="font-medium">{selectedProduct.scheme?.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Applicable Standard</p>
                <p className="font-medium text-primary cursor-pointer hover:underline" onClick={() => navigate('/standards-finder')}>
                  {selectedProduct.standard?.isNumber || 'N/A'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Scheme Description</p>
                <p className="text-sm mt-1">{selectedProduct.scheme?.description}</p>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Certification Requirements / Steps</h3>
            {selectedProduct.scheme?.requirements?.length > 0 ? (
              <div className="grid gap-4">
                {selectedProduct.scheme.requirements.map((req: any, index: number) => (
                  <div key={req.id} className="flex gap-4 p-4 rounded-lg border bg-card">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold">{req.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Specific requirements are not detailed in the knowledge base.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button variant="outline" onClick={() => navigate('/laboratories')}>Find Laboratory</Button>
            <Button onClick={() => navigate('/assistant')}>Ask Assistant for Details</Button>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/pages/CertificationPage.tsx', code);
console.log('Updated CertificationPage.tsx');
