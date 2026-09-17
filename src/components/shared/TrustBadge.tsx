import { ShieldCheck, ExternalLink, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export function TrustBadge({ 
  sourceUrl, 
  sourceName = 'Official BIS Source', 
  documentTitle,
  pageNumber,
  lastVerified
}: { 
  sourceUrl?: string; 
  sourceName?: string;
  documentTitle?: string;
  pageNumber?: number | string;
  lastVerified?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-success/10 text-success px-2 py-0.5 rounded cursor-pointer hover:bg-success/20 transition-colors">
          <ShieldCheck className="h-3 w-3" /> Verified Source
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-success mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm mb-1">Source Verification</h4>
            <div className="space-y-1.5 text-xs text-muted-foreground mt-2">
              <p><span className="font-medium text-foreground">Authority:</span> {sourceName}</p>
              {documentTitle && <p><span className="font-medium text-foreground">Document:</span> {documentTitle}</p>}
              {pageNumber && <p><span className="font-medium text-foreground">Page:</span> {pageNumber}</p>}
              <p><span className="font-medium text-foreground">Last Verified:</span> {lastVerified ? new Date(lastVerified).toLocaleDateString() : 'Real-time database extraction'}</p>
            </div>
            
            <div className="mt-4 pt-3 border-t">
              {sourceUrl ? (
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => window.open(sourceUrl, '_blank')}>
                  <ExternalLink className="h-3 w-3 mr-2" /> Open Official Source
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="h-3 w-3"/> Verified via secure internal ingestion.</p>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
