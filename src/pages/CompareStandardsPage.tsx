import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Scale, Plus, X, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/state-components';

export function CompareStandardsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const ids = searchParams.get('ids')?.split(',') || [];
  
  const [standards, setStandards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ids.length === 0) {
      setStandards([]);
      return;
    }
    
    setLoading(true);
    // Fetch each standard
    Promise.all(ids.map(id => 
      fetch(`http://localhost:3001/api/standards/${id}`).then(r => r.json())
    ))
    .then(data => {
      setStandards(data.filter(d => d && !d.error));
      setLoading(false);
    })
    .catch(e => {
      setError(e.message);
      setLoading(false);
    });
  }, [searchParams]);

  function removeStandard(id: string) {
    const newIds = ids.filter(i => i !== id);
    if (newIds.length > 0) {
      setSearchParams({ ids: newIds.join(',') });
    } else {
      setSearchParams({});
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          Compare Standards
        </h1>
        <p className="text-muted-foreground mt-1">Side-by-side comparison of BIS Standards.</p>
      </div>

      {loading ? (
        <LoadingState message="Loading standards for comparison..." />
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max">
            {standards.map(std => (
              <Card key={std.id} className="w-[350px] shrink-0 flex flex-col relative overflow-hidden">
                <div className="p-4 border-b bg-muted/50 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-primary">{std.isNumber}</h2>
                    {std.status && (
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-sm mt-1 inline-block">
                        {std.status}
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2 opacity-50 hover:opacity-100" onClick={() => removeStandard(std.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-4 flex-1 space-y-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Title</p>
                    <p className="font-medium text-sm">{std.title}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Publication Year</p>
                    <p className="text-sm">{std.publicationYear || <span className="text-muted-foreground italic text-xs">Not available</span>}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Department & Committee</p>
                    <p className="text-sm">{std.technicalDepartment || <span className="text-muted-foreground italic text-xs">Unspecified</span>}</p>
                    <p className="text-xs text-muted-foreground mt-1">{std.sectionalCommittee}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Amendments</p>
                    <p className="text-sm">{std.amendmentInformation || 'No amendments listed.'}</p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Connected Products/Certifications</p>
                    {std.products?.length > 0 ? (
                      <ul className="space-y-2">
                        {std.products.map((p: any) => (
                          <li key={p.id} className="text-xs bg-success/10 text-success-foreground p-2 rounded border border-success/20">
                            <strong>{p.name}</strong> <br/>
                            <span className="opacity-80">Scheme: {p.schemeId}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Information not available in the verified BIS database.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            
            {standards.length < 3 && (
              <Card className="w-[350px] shrink-0 border-dashed flex flex-col items-center justify-center p-8 bg-transparent cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => window.location.href='/standards-explorer'}>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground">Add Standard</h3>
                <p className="text-sm text-center text-muted-foreground mt-2">Find another standard in the explorer to compare.</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
