const fs = require('fs');
let code = fs.readFileSync('src/pages/CertificationPage.tsx', 'utf8');

// Update imports
if (!code.includes('ChevronLeft')) {
  code = code.replace(
    "import { Search, ArrowRight, ShieldCheck, BookOpen, Microscope, Info, GitMerge } from 'lucide-react';",
    "import { Search, ArrowRight, ShieldCheck, BookOpen, Microscope, Info, GitMerge, ChevronLeft, ChevronRight } from 'lucide-react';"
  );
}

// Add state for pagination
code = code.replace(
  "const [hasSearched, setHasSearched] = useState(false);",
  "const [hasSearched, setHasSearched] = useState(false);\n  const [page, setPage] = useState(1);\n  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, hasNext: false, hasPrevious: false });"
);

// Modify doSearch to accept page
code = code.replace(
  "const doSearch = useCallback(async (q: string) => {",
  "const doSearch = useCallback(async (q: string, targetPage: number = 1) => {"
);

code = code.replace(
  "const res = await fetch(`http://localhost:3001/api/certifications?q=${encodeURIComponent(q)}`);",
  "const res = await fetch(`http://localhost:3001/api/certifications?q=${encodeURIComponent(q)}&page=${targetPage}&limit=20`);"
);

code = code.replace(
  "const data = await res.json();\n      setResults(data.products || []);",
  "const data = await res.json();\n      setResults(data.products || []);\n      setPagination({ total: data.total, totalPages: data.totalPages, hasNext: data.hasNext, hasPrevious: data.hasPrevious });\n      setPage(targetPage);"
);

// Add useEffect to load empty search on mount
code = code.replace(
  "useEffect(() => {\n    if (initialQ) {\n      doSearch(initialQ);\n    }\n  }, [initialQ, doSearch]);",
  "useEffect(() => {\n    doSearch(initialQ, 1);\n  }, [initialQ, doSearch]);"
);

// Update handleSearch to reset page to 1
code = code.replace(
  "doSearch(query);",
  "doSearch(query, 1);"
);

// Disable the "disabled={loading || !query.trim()}" on Search button so we can search empty
code = code.replace(
  "disabled={loading || !query.trim()}",
  "disabled={loading}"
);

// Add Pagination UI before the "GRAPH VIEW" else block
const paginationUI = `
          {/* Pagination Controls */}
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
`;

code = code.replace(
  "          )}\n        </div>\n      ) : (",
  "          )}\n        </div>\n" + paginationUI + "\n      ) : ("
);

// Change mapped text to show Category (Compulsory/Voluntary)
code = code.replace(
  "<span className=\"text-xs flex items-center gap-1 text-primary\"><BookOpen className=\"h-3 w-3\"/> {product.standard?.isNumber || 'No Standard mapped'}</span>",
  "<span className=\"text-xs flex items-center gap-1 text-primary\"><BookOpen className=\"h-3 w-3\"/> {product.standard?.isNumber || 'No Standard mapped'}</span>\n                      <span className={`text-xs flex items-center gap-1 ${product.category === 'Compulsory' ? 'text-destructive' : 'text-muted-foreground'}`}><Info className=\"h-3 w-3\"/> {product.category}</span>"
);

// Modify empty state message
code = code.replace(
  "No certifications found matching your query.",
  "No verified BIS certification information found for this search."
);

fs.writeFileSync('src/pages/CertificationPage.tsx', code);
