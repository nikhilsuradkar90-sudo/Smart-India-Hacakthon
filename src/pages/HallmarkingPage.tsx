import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gem, ShieldCheck, LifeBuoy, BookOpen, MessageSquareText, ArrowRight, ArrowDown } from 'lucide-react';
import type { HallmarkingInformation } from '@/types';
import { hallmarkingService } from '@/services';
import { HALLMARKING_FLOW } from '@/data/constants';
import { getIcon } from '@/lib/icons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/state-components';
import { VerificationNotice, DisclaimerBanner } from '@/components/shared/trust-badges';
import { DISCLAIMER_SHORT } from '@/data/constants';

// ============================================================
// Hallmarking page
// ============================================================

const HALLMARK_CARDS = [
  { id: 'understand', title: 'Understand Hallmarking', description: 'Learn what hallmarking is, its purpose, and why it matters for precious metal articles.', icon: 'BookOpen' },
  { id: 'check', title: 'Check Hallmark Information', description: 'Find out how to identify and verify hallmark details on precious metal articles.', icon: 'Gem' },
  { id: 'services', title: 'Hallmarking Services', description: 'Understand the hallmarking service infrastructure and how it works.', icon: 'ShieldCheck' },
  { id: 'ask', title: 'Ask a Question', description: 'Get answers to your hallmarking-related questions through the AI Assistant.', icon: 'MessageSquareText' },
];

export function HallmarkingPage() {
  const navigate = useNavigate();
  const [info, setInfo] = useState<HallmarkingInformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hallmarkingService.getInfo().then((result) => {
      if (result.error) {
        setError(result.error);
        setInfo([]);
      } else if (result.data) {
        setInfo(result.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold text-foreground">Hallmarking Assistance</h1>
          
        </div>
        <p className="text-sm text-muted-foreground">
          Understand hallmarking of precious metals and jewellery, and learn how to verify hallmark authenticity.
        </p>
      </div>

      <DisclaimerBanner message={DISCLAIMER_SHORT} className="mb-6" />

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {HALLMARK_CARDS.map((card) => {
          const Icon = getIcon(card.icon);
          return (
            <Card key={card.id} className="p-5 transition-all hover:shadow-md hover:border-primary/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{card.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{card.description}</p>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto text-xs"
                onClick={() => navigate(card.id === 'ask' ? '/assistant' : '/assistant')}
              >
                Learn more <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Visual educational flow */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-1">Hallmarking Flow</h2>
        <p className="text-sm text-muted-foreground mb-6">
          The typical journey from purchase to consumer guidance.
        </p>
        <div className="flex flex-col items-center gap-2">
          {HALLMARKING_FLOW.map((step, i) => {
            const Icon = getIcon(step.icon);
            return (
              <div key={step.id} className="flex flex-col items-center">
                <Card className="p-4 w-full max-w-md flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </Card>
                {i < HALLMARKING_FLOW.length - 1 && (
                  <ArrowDown className="h-5 w-5 text-border my-1" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info cards from service */}
      {error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center animate-fade-in mb-6">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      ) : loading ? (
        <LoadingState message="Loading hallmarking information…" />
      ) : (
        <div className="space-y-3 mb-6">
          <h2 className="text-lg font-semibold text-foreground">Hallmarking Information</h2>
          {info.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start gap-3">
                <LifeBuoy className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <VerificationNotice />

      {/* CTA */}
      <div className="flex flex-wrap gap-3 mt-6">
        <Button onClick={() => navigate('/assistant')}>
          <MessageSquareText className="h-4 w-4 mr-2" />
          Ask About Hallmarking
        </Button>
        <Button variant="outline" onClick={() => navigate('/consumer')}>
          Consumer Guidance
        </Button>
      </div>
    </div>
  );
}
