import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ComplianceChecklist({ standard, product }: { standard: any, product?: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Generate dynamic items based on available verified info
    const generated = [];
    
    generated.push({ id: 1, category: 'Standard', desc: `Applicable standard identified: ${standard.isNumber}`, checked: true });
    
    if (product?.scheme) {
      generated.push({ id: 2, category: 'Certification', desc: `Certification requirement checked (${product.scheme.name})`, checked: true });
      generated.push({ id: 3, category: 'Certification', desc: 'Applicable scheme identified', checked: true });
      
      product.scheme.requirements.forEach((req: any, i: number) => {
        generated.push({ id: 10 + i, category: 'Requirements', desc: req.title, checked: false });
      });
    } else if (standard.products && standard.products.length > 0) {
      generated.push({ id: 2, category: 'Certification', desc: 'Certification requirement checked (Multiple schemes exist)', checked: false });
    } else {
      generated.push({ id: 2, category: 'Certification', desc: 'Certification requirement verified (None explicitly listed)', checked: true });
    }

    generated.push({ id: 20, category: 'Testing', desc: 'Testing requirements identified', checked: false });
    generated.push({ id: 21, category: 'Testing', desc: 'Relevant laboratory identified', checked: false });
    
    setItems(generated);
  }, [standard, product]);

  useEffect(() => {
    if (items.length > 0) {
      const checked = items.filter(i => i.checked).length;
      setProgress(Math.round((checked / items.length) * 100));
    }
  }, [items]);

  function toggle(id: number) {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  }

  return (
    <Card className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-success" /> Compliance Checklist
        </h3>
        <div className="text-sm font-semibold bg-muted px-2 py-1 rounded">
          {progress}% Complete
        </div>
      </div>
      
      <div className="w-full bg-muted rounded-full h-2 mb-6 overflow-hidden">
        <div className="bg-success h-2 transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {items.map(item => (
          <div key={item.id} className="flex gap-3 items-start p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer" onClick={() => toggle(item.id)}>
            {item.checked ? (
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-sm ${item.checked ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}`}>
                {item.desc}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.category}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
