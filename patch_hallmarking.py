import re

with open('src/pages/HallmarkingPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("const [loading, setLoading] = useState(true);", "const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<string | null>(null);")

new_effect = """  useEffect(() => {
    hallmarkingService.getInfo().then((result) => {
      if (result.error) {
        setError(result.error);
        setInfo([]);
      } else if (result.data) {
        setInfo(result.data);
      }
      setLoading(false);
    });
  }, []);"""
content = re.sub(r'  useEffect\(\(\) => \{\n    hallmarkingService\.getInfo\(\)\.then\(\(result\) => \{\n      if \(result\.data\) setInfo\(result\.data\);\n      setLoading\(false\);\n    \}\);\n  \}, \[\]\);', new_effect, content)

content = content.replace("{loading ? (", "{error ? (\n        <div className=\"rounded-lg border border-destructive bg-destructive/10 p-6 text-center animate-fade-in mb-6\">\n          <p className=\"text-sm font-medium text-destructive\">{error}</p>\n        </div>\n      ) : loading ? (")

with open('src/pages/HallmarkingPage.tsx', 'w') as f:
    f.write(content)
