import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, BookOpen, ShieldCheck, Microscope } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/shared/state-components';
import { Button } from '@/components/ui/button';

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [q]);

  if (!q) return <div className="p-8 text-center text-muted-foreground">Enter a search term above.</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          Search Results for "{q}"
        </h1>
        {results && <p className="text-muted-foreground mt-2">Found {results.totalResults} exact matches.</p>}
      </div>

      {loading ? (
        <LoadingState message="Searching the BIS Knowledge Base..." />
      ) : results ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* STANDARDS */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
              <BookOpen className="h-5 w-5 text-primary" /> Standards ({results.standards.length})
            </h2>
            {results.standards.length === 0 ? <p className="text-sm text-muted-foreground">No standards found.</p> : null}
            {results.standards.map((std: any) => (
              <Card key={std.id} className="p-4 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(`/standards/${std.id}`)}>
                <p className="font-bold text-primary">{std.isNumber}</p>
                <p className="text-sm mt-1 line-clamp-2">{std.title}</p>
              </Card>
            ))}
          </div>

          {/* CERTIFICATIONS */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
              <ShieldCheck className="h-5 w-5 text-success" /> Products/Certs ({results.products.length})
            </h2>
            {results.products.length === 0 ? <p className="text-sm text-muted-foreground">No products found.</p> : null}
            {results.products.map((prod: any) => (
              <Card key={prod.id} className="p-4 cursor-pointer hover:border-success/50 transition-colors" onClick={() => navigate(`/certifications?q=${encodeURIComponent(prod.name)}`)}>
                <p className="font-bold text-success">{prod.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Scheme: {prod.scheme?.name}</p>
                {prod.standard && <p className="text-xs text-primary mt-1">IS: {prod.standard.isNumber}</p>}
              </Card>
            ))}
          </div>

          {/* LABORATORIES */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
              <Microscope className="h-5 w-5 text-purple-500" /> Laboratories ({results.laboratories.length})
            </h2>
            {results.laboratories.length === 0 ? <p className="text-sm text-muted-foreground">No laboratories found.</p> : null}
            {results.laboratories.map((lab: any) => (
              <Card key={lab.id} className="p-4 cursor-pointer hover:border-purple-500/50 transition-colors" onClick={() => navigate(`/laboratories/${lab.id}`)}>
                <p className="font-bold text-purple-600">{lab.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{lab.city}, {lab.state}</p>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
          Verified BIS information is currently unavailable for this query.
        </div>
      )}
    </div>
  );
}
