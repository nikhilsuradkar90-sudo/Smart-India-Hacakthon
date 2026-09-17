import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, BadgeCheck, FlaskConical, Gem, LifeBuoy, Compass, Layers, Microscope, Languages, ShieldCheck, Search } from 'lucide-react';
import { QUICK_ACTIONS, FEATURE_CARDS, HOW_IT_WORKS, APP_NAME, DISCLAIMER_SHORT } from '@/data/constants';
import { QuickActionCard } from '@/components/shared/QuickActionCard';
import { FeatureCardItem } from '@/components/shared/FeatureCardItem';
import { DisclaimerBanner } from '@/components/shared/trust-badges';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// ============================================================
// Home / Dashboard page
// ============================================================

export function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)', backgroundSize: '40px 40px' }} aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 lg:px-8 py-16 lg:py-24">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6 animate-slide-up">
              <ShieldCheck className="h-3.5 w-3.5" />
              {APP_NAME}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground text-balance leading-tight mb-4 animate-slide-up">
              Your Intelligent Assistant for Indian Standards &amp; BIS Services
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground text-balance mb-2 animate-slide-up" style={{ animationDelay: '0.05s' }}>
              Get clear, source-backed guidance on Indian Standards, certification, testing, hallmarking and BIS services.
            </p>
            <p className="text-sm text-muted-foreground/80 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Designed for Industries, MSMEs, Startups &amp; Consumers
            </p>
            <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <Link to="/assistant">
                <Button size="lg" className="w-full sm:w-auto">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Ask the BIS Assistant
                </Button>
              </Link>
              <Link to="/explorer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Compass className="h-4 w-4 mr-2" />
                  Explore Standards
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 lg:px-8 py-12 lg:py-16 space-y-16">
        {/* Quick actions */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-1">Quick Actions</h2>
            <p className="text-sm text-muted-foreground">Start with what you need to do.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <QuickActionCard key={action.id} action={action} />
            ))}
          </div>
        </section>

        {/* What can the assistant help with */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-1">
              What can the BIS Assistant help you with?
            </h2>
            <p className="text-sm text-muted-foreground">
              Explore the range of BIS information and services the assistant covers.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURE_CARDS.map((feature) => (
              <FeatureCardItem key={feature.id} feature={feature} />
            ))}
          </div>
        </section>

        {/* How it works */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-1">How it works</h2>
            <p className="text-sm text-muted-foreground">
              The intended workflow of the BIS AI Assistant (system design overview).
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((step, i) => (
              <Card key={step.id} className="p-5 relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold mb-3">
                  {step.id}
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-border" aria-hidden="true" />
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Demo flow CTA */}
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Try the complete demo flow
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Ask the assistant a question, explore standards, and walk through the certification guide.
                All data is labeled as demo — the real AI and BIS knowledge base will be connected in Phase 2.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/assistant">
                  <Button>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start with AI Assistant
                  </Button>
                </Link>
                <Link to="/certification">
                  <Button variant="outline">
                    <BadgeCheck className="h-4 w-4 mr-2" />
                    Certification Guide
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground shrink-0">
              <Link to="/standards-finder" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                <Search className="h-4 w-4" /> Standards Finder
              </Link>
              <Link to="/laboratories" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                <FlaskConical className="h-4 w-4" /> Laboratory Finder
              </Link>
              <Link to="/hallmarking" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                <Gem className="h-4 w-4" /> Hallmarking
              </Link>
              <Link to="/consumer" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                <LifeBuoy className="h-4 w-4" /> Consumer Help
              </Link>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section>
          <DisclaimerBanner message={DISCLAIMER_SHORT} />
        </section>
      </div>
    </div>
  );
}
