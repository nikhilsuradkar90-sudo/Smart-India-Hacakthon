import re

with open('src/pages/LaboratoryFinderPage.tsx', 'r') as f:
    content = f.read()

imports = """import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { LoadingState, NoResultsState, EmptyState } from '@/components/shared/state-components';"""

content = content.replace("import { LoadingState, NoResultsState, EmptyState } from '@/components/shared/state-components';", imports)

state_additions = """  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;"""

content = content.replace("  const [hasSearched, setHasSearched] = useState(false);", "  const [hasSearched, setHasSearched] = useState(false);\n" + state_additions)

old_doSearch = r"  const doSearch = useCallback\(async \(\) => \{.*?\n  \}, \[query, state, productCategory, testType\]\);"
new_doSearch = """  const doSearch = useCallback(async (p: number = 1) => {
    setLoading(true);
    setHasSearched(true);
    const filters: LaboratorySearchFilters = {
      query: query.trim() || undefined,
      state: state !== 'All States' ? state : undefined,
      productCategory: productCategory !== 'All Categories' ? productCategory : undefined,
      testType: testType !== 'All Test Types' ? testType : undefined,
      page: p,
      pageSize: PAGE_SIZE,
    };
    const result = await laboratoryService.search(filters);
    if (result.error) {
      setError(result.error);
      setResults([]);
      setTotal(0);
    } else if (result.data) {
      setError(null);
      setResults(result.data.items);
      setTotal(result.data.total);
    }
    setLoading(false);
  }, [query, state, productCategory, testType]);"""

content = re.sub(old_doSearch, new_doSearch, content, flags=re.DOTALL)

content = content.replace("  useEffect(() => {\n    doSearch();\n  }, [doSearch]);", "  useEffect(() => {\n    doSearch(1);\n  }, [doSearch]);\n  const totalPages = Math.ceil(total / PAGE_SIZE);")
content = content.replace("    doSearch();\n  }", "    setPage(1);\n    doSearch(1);\n  }")

# Adding Pagination to UI
pagination_ui = """          {/* Pagination */}
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  // Only show a few pages around the current page to avoid clutter
                  if (p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2)) {
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
                    aria-disabled={page === totalPages}
                    className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>"""

content = content.replace("        </div>\n      )}\n    </div>", pagination_ui + "\n      )}\n    </div>")

content = content.replace("{results.length} laborator{results.length !== 1 ? 'ies' : 'y'} found", "{total} laborator{total !== 1 ? 'ies' : 'y'} found")

with open('src/pages/LaboratoryFinderPage.tsx', 'w') as f:
    f.write(content)
