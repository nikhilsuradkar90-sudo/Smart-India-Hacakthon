with open('src/pages/CertificationPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("const [loading, setLoading] = useState(false);", "const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<string | null>(null);")

new_submit = """  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await certificationService.submitAssessment(formData);
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setAssessment(result.data);
      setView('result');
    }
    setLoading(false);
  }"""
content = content.replace("  async function handleSubmit(e: React.FormEvent) {\n    e.preventDefault();\n    setLoading(true);\n    const result = await certificationService.submitAssessment(formData);\n    if (result.data) {\n      setAssessment(result.data);\n      setView('result');\n    }\n    setLoading(false);\n  }", new_submit)

content = content.replace("        <form onSubmit={handleSubmit} className=\"space-y-6\">", "        {error && <div className=\"p-4 mb-6 rounded-md bg-destructive/10 text-destructive text-sm font-medium\">{error}</div>}\n        <form onSubmit={handleSubmit} className=\"space-y-6\">")

with open('src/pages/CertificationPage.tsx', 'w') as f:
    f.write(content)
