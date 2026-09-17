import { useState } from 'react';
import { Search, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/shared/state-components';

export function RecommendationPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRecommend(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch('http://localhost:3001/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Recommendation failed');
      
      if (data.success && data.recommendations) {
        setResults(data.recommendations);
      } else {
        setError(data.message || 'No recommendations found.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Smart Standard Recommendation
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Describe the product you want to manufacture or import. The AI will intelligently recommend the applicable BIS standards and certification schemes.
        </p>
      </div>

      <Card className="mb-8 p-6 bg-gradient-to-br from-card to-card/50">
        <form onSubmit={handleRecommend} className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., I want to manufacture electric water heaters for domestic use"
              className="pl-10 py-6 text-lg"
            />
          </div>
          <Button type="submit" disabled={loading || !query.trim()} size="lg" className="w-full sm:w-auto self-end">
            <Sparkles className="mr-2 h-5 w-5" />
            Recommend Standard
          </Button>
        </form>
      </Card>

      {error && (
        <div className="mb-8 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingState message="AI is analyzing product requirements and finding exact standards..." className="py-12" />
      ) : hasSearched && results.length === 0 && !error ? (
        <div className="rounded-lg border border-dashed px-4 py-12 text-center">
          <p className="text-muted-foreground">Insufficient verified BIS information to confidently recommend a standard.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((rec, idx) => (
            <Card key={rec.id} className="p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                    {rec.isNumber}
                    {rec.score > 0.6 && <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">High Match</span>}
                  </h3>
                  <p className="text-foreground font-medium mt-1">{rec.title}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/standards/${rec.id}`)}>
                    <BookOpen className="h-4 w-4 mr-2" /> View Standard
                  </Button>
                </div>
              </div>
              
              <div className="bg-primary/5 rounded-md p-4 mb-4">
                <p className="text-sm font-medium text-foreground flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {rec.explanation}
                </p>
              </div>

              {rec.products && rec.products.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Applicable Certification</p>
                  {rec.products.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium">{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
