import re

with open('src/pages/StandardsFinderPage.tsx', 'r') as f:
    content = f.read()

# Change initial hasSearched state to true, and call doSearch on mount
content = content.replace("const [hasSearched, setHasSearched] = useState(false);", "const [hasSearched, setHasSearched] = useState(true);")
content = content.replace("  useEffect(() => {\n    if (searchParams.get('query')) {\n      doSearch();\n    }\n  }, [searchParams, doSearch]);", "  useEffect(() => {\n    doSearch();\n  }, []);")

with open('src/pages/StandardsFinderPage.tsx', 'w') as f:
    f.write(content)
