import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, BookOpen, BadgeCheck, FlaskConical, Gem, LifeBuoy, Languages, Target, Users, FileSearch, Globe, ArrowRight } from 'lucide-react';
import { APP_NAME, APP_TAGLINE, APP_ORGANIZATION, APP_DEPARTMENT, APP_MINISTRY, DISCLAIMER_LONG } from '@/data/constants';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DisclaimerBanner } from '@/components/shared/trust-badges';

// ============================================================
// Help / About page
// ============================================================

const ABOUT_SECTIONS = [
  { icon: Target, title: 'Purpose', description: 'The BIS AI Assistant is designed to help users discover and understand Indian Standards and BIS services through an intelligent, source-backed interface.' },
  { icon: Users, title: 'Target Users', description: 'Industries, MSMEs, startups, manufacturers, students and consumers who need guidance on Indian Standards, certification, testing, hallmarking and BIS services.' },
  { icon: FileSearch, title: 'Source-Backed Answers', description: 'Every AI response is designed to include source references and citations, so users can verify information against official BIS publications.' },
  { icon: Languages, title: 'Multilingual Support', description: 'The system is architected to support multiple Indian languages, making BIS information accessible to users across the country.' },
  { icon: BookOpen, title: 'Standards Discovery', description: 'Users can search for relevant standards by describing their product, material or application, and explore the standards catalog.' },
  { icon: BadgeCheck, title: 'Certification Guidance', description: 'A step-by-step certification guide helps users understand the BIS certification process and assess their readiness.' },
  { icon: FlaskConical, title: 'Laboratory Finder', description: 'Users can search for testing laboratories by product, test type, or location.' },
  { icon: Gem, title: 'Hallmarking Assistance', description: 'Dedicated guidance on hallmarking of precious metals and jewellery for both industry and consumers.' },
  { icon: LifeBuoy, title: 'Consumer Help', description: 'Simple, accessible guidance for consumers on product quality, BIS marks, complaints and awareness.' },
];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>{APP_MINISTRY}</span>
          <span aria-hidden="true">·</span>
          <span>{APP_DEPARTMENT}</span>
          <span aria-hidden="true">·</span>
          <span>{APP_ORGANIZATION}</span>
        </div>
      </div>

      {/* Phase notice */}
      <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Phase 1 — Frontend Demonstration</p>
            <p className="text-xs text-muted-foreground mt-1">
              This is a Phase 1 frontend demonstration. The AI model, RAG pipeline, vector database, real BIS APIs,
              and production database are not yet connected. All data shown is clearly labeled as demo data.
              The architecture is designed for seamless Phase 2 integration with real AI and BIS knowledge base.
            </p>
          </div>
        </div>
      </Card>

      {/* About sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {ABOUT_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{section.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{section.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Disclaimer */}
      <DisclaimerBanner message={DISCLAIMER_LONG} className="mb-8" />

      {/* Quick links */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/assistant">
          <Button><Sparkles className="h-4 w-4 mr-2" /> Try the AI Assistant</Button>
        </Link>
        <Link to="/explorer">
          <Button variant="outline"><BookOpen className="h-4 w-4 mr-2" /> Explore Standards</Button>
        </Link>
        <Link to="/settings">
          <Button variant="outline">Settings <ArrowRight className="h-4 w-4 ml-2" /></Button>
        </Link>
      </div>
    </div>
  );
}
