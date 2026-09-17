const fs = require('fs');
let code = fs.readFileSync('src/pages/StandardsFinderPage.tsx', 'utf8');

// Add imports
if (!code.includes('Pagination')) {
  code = code.replace(
    "} from '@/components/ui/select';",
    `} from '@/components/ui/select';\nimport {\n  Pagination,\n  PaginationContent,\n  PaginationItem,\n  PaginationNext,\n  PaginationPrevious,\n} from '@/components/ui/pagination';\nimport { cn } from '@/lib/utils';`
  );
}

// Add page state
if (!code.includes('const [page, setPage]')) {
  code = code.replace(
    'const [hasSearched, setHasSearched] = useState(true);',
    'const [hasSearched, setHasSearched] = useState(true);\n  const [page, setPage] = useState(1);'
  );
}

// Update doSearch
code = code.replace(
  'const doSearch = useCallback(async () => {',
  'const doSearch = useCallback(async (targetPage: number = page) => {'
);
code = code.replace(
  'page: 1,',
  'page: targetPage,'
);

// Add to dependencies
code = code.replace(
  '}, [query, category, industry, status]);',
  '}, [query, category, industry, status, page]);'
);

// Add reset page in handleSearch
code = code.replace(
  'function handleSearch(e: React.FormEvent) {\n    e.preventDefault();\n    doSearch();\n  }',
  'function handleSearch(e: React.FormEvent) {\n    e.preventDefault();\n    setPage(1);\n    doSearch(1);\n  }'
);

// Add pagination UI
const paginationUI = `
          {results.map((standard) => (
            <StandardResultCard key={standard.id} standard={standard} onAskAssistant={() => navigate('/assistant')} />
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
          )}`;

code = code.replace(
  `          {results.map((standard) => (
            <StandardResultCard key={standard.id} standard={standard} onAskAssistant={() => navigate('/assistant')} />
          ))}`,
  paginationUI
);

fs.writeFileSync('src/pages/StandardsFinderPage.tsx', code);
console.log('StandardsFinderPage updated');
