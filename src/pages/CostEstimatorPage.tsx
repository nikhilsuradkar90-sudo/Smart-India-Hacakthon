import React, { useState } from 'react';
import { Calculator, Clock, CreditCard, HelpCircle, FileText, CheckCircle2, TrendingDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EstimateResult {
  applicationFee: number;
  inspectionFee: number;
  licenseFee: number;
  markingFee: number;
  timelineDays: string;
  total: number;
  subsidy: string;
  aiAdvice: string;
}

export function CostEstimatorPage() {
  const [product, setProduct] = useState('');
  const [scale, setScale] = useState('micro');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EstimateResult | null>(null);

  const handleCalculate = () => {
    if (!product) return;
    setLoading(true);
    
    setTimeout(() => {
      let appFee = 1000;
      let inspFee = 7000; // Rs 7000 per man day for inspection
      let licFee = 1000; // Annual License Fee
      let markingFee = 2000; // Minimum Marking Fee
      
      let subsidyText = "Eligible for 80% concession on Minimum Marking Fee.";
      let days = "30-45";
      
      if (scale === 'micro') {
         subsidyText = "Eligible for 80% concession on Marking Fee as per BIS MSME rules.";
      } else if (scale === 'small') {
         subsidyText = "Eligible for 80% concession (Startup/Women) or standard MSME benefits.";
      } else if (scale === 'medium') {
         inspFee = 14000;
         markingFee = 5000;
         subsidyText = "Standard Marking Fees apply. Lab delays possible.";
         days = "45-60";
      } else {
         inspFee = 21000;
         markingFee = 10000;
         subsidyText = "No MSME concession. Corporate guidelines apply.";
         days = "60-90";
      }

      if (product.toLowerCase().includes('electronic') || product.toLowerCase().includes('toy')) {
        days = "60-90";
      }

      setResult({
        applicationFee: appFee,
        inspectionFee: inspFee,
        licenseFee: licFee,
        markingFee: markingFee,
        timelineDays: days,
        total: appFee + inspFee + licFee + markingFee,
        subsidy: subsidyText,
        aiAdvice: `For ${product} manufacturing at ${scale} scale, note that Lab Testing Fees (paid directly to the lab) are excluded. Ensure all internal manufacturing and QC equipment is calibrated to meet the ${days} days timeline.`
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-500" />
            AI Cost & Timeline Estimator
          </h1>
          <p className="text-sm text-muted-foreground">
            Instantly calculate approximate BIS certification costs, government subsidies, and timelines based on your business scale.
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Business USP</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Input Form */}
        <div className="md:col-span-5 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Business Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Product Category or IS Number</label>
                <Input 
                  placeholder="e.g., Packaged Drinking Water, Toys, IS 14543" 
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Business Scale (MSME)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setScale('micro')}
                    className={`py-2 px-3 text-xs font-medium border rounded-md transition-all ${scale === 'micro' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-background hover:bg-muted'}`}
                  >
                    Micro (&lt;5 Cr)
                  </button>
                  <button 
                    onClick={() => setScale('small')}
                    className={`py-2 px-3 text-xs font-medium border rounded-md transition-all ${scale === 'small' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-background hover:bg-muted'}`}
                  >
                    Small (&lt;50 Cr)
                  </button>
                  <button 
                    onClick={() => setScale('medium')}
                    className={`py-2 px-3 text-xs font-medium border rounded-md transition-all ${scale === 'medium' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-background hover:bg-muted'}`}
                  >
                    Medium (&lt;250 Cr)
                  </button>
                  <button 
                    onClick={() => setScale('large')}
                    className={`py-2 px-3 text-xs font-medium border rounded-md transition-all ${scale === 'large' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-background hover:bg-muted'}`}
                  >
                    Large Enterprise
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Manufacturing State</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option>Delhi</option>
                  <option>Maharashtra</option>
                  <option>Gujarat</option>
                  <option>Karnataka</option>
                  <option>Tamil Nadu</option>
                  <option>Other</option>
                </select>
              </div>

              <Button 
                className="w-full h-11 mt-2" 
                onClick={handleCalculate}
                disabled={!product || loading}
              >
                {loading ? 'AI Analyzing Guidelines...' : 'Calculate Estimate'}
              </Button>
            </div>
          </Card>

          <Card className="p-4 bg-muted/40 border-dashed">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Note: Testing fees vary based on the independent laboratory chosen. This tool provides a baseline estimate based on official BIS guidelines for MSME concessions.
              </p>
            </div>
          </Card>
        </div>

        {/* Results Section */}
        <div className="md:col-span-7">
          {!result && !loading && (
            <Card className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-muted/10">
              <Calculator className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Estimate Generator</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Enter your product details and business scale to get an AI-powered breakdown of costs and timelines.
              </p>
            </Card>
          )}

          {loading && (
            <Card className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-dashed">
              <div className="animate-pulse flex flex-col items-center">
                <Calculator className="h-12 w-12 text-blue-400 mb-4 animate-bounce" />
                <h3 className="text-lg font-semibold text-foreground">Calculating Costs...</h3>
                <p className="text-sm text-muted-foreground mt-2">Checking MSME subsidies and lab testing times...</p>
              </div>
            </Card>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-slide-up">
              {/* Top Banner */}
              <Card className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg overflow-hidden relative">
                <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                  <Calculator className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                  <p className="text-blue-100 text-sm font-medium mb-1">Estimated Total Initial Cost</p>
                  <h2 className="text-4xl font-bold mb-4">₹{result.total.toLocaleString()}*</h2>
                  
                  <div className="flex items-center gap-2 bg-white/20 w-fit px-3 py-1.5 rounded-full text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    Estimated Timeline: {result.timelineDays} Days
                  </div>
                </div>
              </Card>

              {/* Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Application Fee</p>
                  <p className="text-xl font-bold text-foreground">₹{result.applicationFee}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Inspection Fee</p>
                  <p className="text-xl font-bold text-foreground">₹{result.inspectionFee.toLocaleString()}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Minimum Marking Fee</p>
                  <p className="text-xl font-bold text-foreground">₹{result.markingFee.toLocaleString()}</p>
                </Card>
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingDown className="h-3.5 w-3.5 text-green-600" />
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider">MSME Benefit</p>
                  </div>
                  <p className="text-sm font-medium text-green-800">{result.subsidy}</p>
                </Card>
              </div>

              {/* AI Insight */}
              <Card className="p-5 border-l-4 border-l-blue-500">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  AI Strategic Advice
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.aiAdvice}
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
