import re
import os

def patch_page(filepath, service_name, result_key):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Add error state
    if "const [error, setError] = useState<string | null>(null);" not in content:
        content = content.replace("const [loading, setLoading] = useState(", "const [error, setError] = useState<string | null>(null);\n  const [loading, setLoading] = useState(")
    
    # Update search logic
    old_search = f"""    const result = await {service_name};
    if (result.data) {{
      set{result_key}(result.data.items || result.data);
    }}"""
    
    new_search = f"""    const result = await {service_name};
    if (result.error) {{
      setError(result.error);
      set{result_key}([]);
    }} else if (result.data) {{
      setError(null);
      set{result_key}(result.data.items || result.data);
    }}"""
    
    # Simple regex to replace the fetch logic
    content = re.sub(r'    const result = await '+service_name+r';\n    if \(result\.data\) \{\n      set'+result_key+r'\((.*?)\);\n    \}', new_search, content)

    # Render error
    if "{error ? (" not in content:
        render_replacement = """      {/* Results */}
      {error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center animate-fade-in mb-6">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      ) : loading ? ("""
        content = content.replace("      {/* Results */}\n      {loading ? (", render_replacement)
        content = content.replace("      {/* Error / Loading */}      \n      {loading ? (", render_replacement)
        content = content.replace("      {/* Content */}      \n      {loading ? (", render_replacement)

    with open(filepath, 'w') as f:
        f.write(content)

patch_page('src/pages/LaboratoryFinderPage.tsx', 'laboratoryService.search(filters)', 'Results')
