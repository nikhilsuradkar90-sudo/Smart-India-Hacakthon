import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, FileUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ComplianceResult {
  productName: string;
  overallStatus: 'Pass' | 'Fail' | 'Manual Review Required';
  summary: string;
  parameters: Array<{
    name: string;
    extractedValue: string;
    allowedLimit: string;
    status: 'Pass' | 'Fail' | 'Unknown';
    remarks: string;
  }>;
}

export function ComplianceCheckerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [standard, setStandard] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({ title: 'Please select a file to upload.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setResult(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('standard', standard || 'General BIS Requirements');

    try {
      const res = await fetch('http://localhost:3001/api/compliance', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze document');
      }

      setResult(data);
    } catch (err: any) {
      toast({ title: 'Analysis Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-primary" />
            AI Compliance Checker
          </h1>
          <p className="text-sm text-muted-foreground">
            Smart Document Analyzer (Mega USP). Upload your lab report or specs, and AI will automatically verify compliance against BIS parameters.
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">SIH Beta Feature</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Section */}
        <Card className="col-span-1 p-6 flex flex-col h-fit sticky top-24">
          <h3 className="font-semibold mb-4 text-sm">Upload Document</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Standard (Optional)</label>
              <Input 
                placeholder="e.g. IS 14543 for Packaged Water" 
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="h-9"
              />
            </div>
            
            <div 
              className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <>
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm font-medium text-foreground truncate max-w-[150px]">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground">Click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG allowed</p>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf,image/*,.txt"
              />
            </div>

            <Button 
              className="w-full h-10" 
              onClick={handleAnalyze}
              disabled={!file || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing with AI...
                </>
              ) : 'Run Compliance Check'}
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        <div className="col-span-1 md:col-span-2">
          {loading && (
            <Card className="p-12 flex flex-col items-center justify-center text-center h-full border-dashed min-h-[400px]">
              <div className="relative">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full -z-10"></div>
              </div>
              <h3 className="text-lg font-semibold mt-6 mb-2">Extracting & Analyzing Data</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Our AI is currently performing OCR on your document and cross-referencing values with official BIS standard limits...
              </p>
            </Card>
          )}

          {!loading && !result && (
            <Card className="p-12 flex flex-col items-center justify-center text-center h-full bg-muted/20 min-h-[400px]">
              <CheckCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No Report Analyzed Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Upload a product specification sheet or test report to see the AI automatically flag failing parameters and compliance gaps.
              </p>
            </Card>
          )}

          {!loading && result && (
            <div className="space-y-6 animate-slide-up">
              <Card className="p-6 overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  result.overallStatus === 'Pass' ? 'bg-green-500' : 
                  result.overallStatus === 'Fail' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">{result.productName}</h2>
                    <p className="text-sm text-muted-foreground">Automated Analysis Report</p>
                  </div>
                  <Badge variant={
                    result.overallStatus === 'Pass' ? 'default' : 
                    result.overallStatus === 'Fail' ? 'destructive' : 'secondary'
                  } className={`text-sm px-3 py-1 ${result.overallStatus === 'Pass' ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                    {result.overallStatus.toUpperCase()}
                  </Badge>
                </div>

                <div className="bg-muted/40 rounded-lg p-4 mb-6 text-sm leading-relaxed border border-border/50">
                  <p className="font-medium text-foreground mb-1">AI Executive Summary:</p>
                  {result.summary}
                </div>

                <h3 className="font-semibold text-sm mb-3">Parameter Breakdown</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 font-medium">Parameter</th>
                        <th className="px-4 py-3 font-medium">Extracted Value</th>
                        <th className="px-4 py-3 font-medium">BIS Limit</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {result.parameters.map((param, i) => (
                        <tr key={i} className="bg-card">
                          <td className="px-4 py-3 font-medium text-foreground">{param.name}</td>
                          <td className="px-4 py-3">{param.extractedValue}</td>
                          <td className="px-4 py-3">{param.allowedLimit}</td>
                          <td className="px-4 py-3">
                            <span className={`flex items-center gap-1.5 text-xs font-medium ${
                              param.status === 'Pass' ? 'text-green-600' : 
                              param.status === 'Fail' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {param.status === 'Pass' ? <CheckCircle className="h-3 w-3" /> : 
                               param.status === 'Fail' ? <XCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                              {param.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
