import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LifeBuoy, Package, BadgeCheck, MessageSquareWarning, BookOpen, Gem, GraduationCap } from 'lucide-react';
import type { ConsumerQuery } from '@/types';
import { consumerService } from '@/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/state-components';
import { DisclaimerBanner } from '@/components/shared/trust-badges';
import { DISCLAIMER_SHORT } from '@/data/constants';

// ============================================================
// Consumer Help page
// ============================================================

const ICON_MAP: Record<string, typeof Package> = {
  'Product Quality': Package,
  'BIS Mark Questions': BadgeCheck,
  'Complaint Guidance': MessageSquareWarning,
  'Product Standards': BookOpen,
  'Hallmarking': Gem,
  'Consumer Awareness': GraduationCap,
};

export function ConsumerHelpPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<ConsumerQuery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    consumerService.getTopics().then((result) => {
      if (result.data) setTopics(result.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold text-foreground">BIS Consumer Help</h1>
          
        </div>
        <p className="text-sm text-muted-foreground">
          Guidance for consumers on product quality, BIS marks, complaints and more.
        </p>
      </div>

      <DisclaimerBanner message={DISCLAIMER_SHORT} className="mb-6" />

      {/* CTA */}
      <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-base font-semibold text-foreground">Have a consumer question?</h2>
            <p className="text-sm text-muted-foreground">Ask the BIS Assistant about product quality, marks, complaints and more.</p>
          </div>
          <Button onClick={() => navigate('/assistant')}>
            <MessageSquareWarning className="h-4 w-4 mr-2" />
            Ask a Consumer Question
          </Button>
        </div>
      </Card>

      {/* Topic cards */}
      {loading ? (
        <LoadingState message="Loading consumer help topics…" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topics.map((topic) => {
            const Icon = ICON_MAP[topic.category] || LifeBuoy;
            return (
              <Card key={topic.id} className="p-5 transition-all hover:shadow-md hover:border-primary/30">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground mb-1">{topic.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{topic.description}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto text-xs"
                      onClick={() => navigate('/assistant')}
                    >
                      Get help <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
