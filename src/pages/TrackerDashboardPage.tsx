import React, { useState, useEffect } from 'react';
import { Target, ListTodo, CheckCircle2, ChevronRight, Award, FileText, Settings, Rocket } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

interface TrackerStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ElementType;
}

const DEFAULT_STEPS: TrackerStep[] = [
  { id: 's1', title: 'Identify Standard', description: 'Search and confirm the applicable IS number for your product.', completed: false, icon: Target },
  { id: 's2', title: 'Check Lab Equipment', description: 'Procure or verify required testing equipment for in-house lab.', completed: false, icon: Settings },
  { id: 's3', title: 'Prepare Factory Docs', description: 'Draft layout, manufacturing process flow, and quality control manual.', completed: false, icon: FileText },
  { id: 's4', title: 'Apply on ManakOnline', description: 'Submit form, upload documents, and pay the requisite application fee.', completed: false, icon: Rocket },
  { id: 's5', title: 'Lab Testing & Inspection', description: 'Send product sample to BIS recognized lab or await factory inspection.', completed: false, icon: ListTodo },
  { id: 's6', title: 'Grant of License', description: 'Receive your BIS License and start marking your product.', completed: false, icon: Award },
];

export function TrackerDashboardPage() {
  const [goal, setGoal] = useState('');
  const [activeGoal, setActiveGoal] = useState('');
  const [steps, setSteps] = useState<TrackerStep[]>(DEFAULT_STEPS);

  // Load from local storage on mount
  useEffect(() => {
    const savedGoal = localStorage.getItem('bis_tracker_goal');
    const savedSteps = localStorage.getItem('bis_tracker_steps');
    if (savedGoal) {
      setActiveGoal(savedGoal);
      setGoal(savedGoal);
    }
    if (savedSteps) {
      try {
        const parsedSteps = JSON.parse(savedSteps);
        // Merge saved completion status with DEFAULT_STEPS to preserve icon functions!
        setSteps(DEFAULT_STEPS.map(defaultStep => {
            const savedStep = parsedSteps.find((s: any) => s.id === defaultStep.id);
            return savedStep ? { ...defaultStep, completed: savedStep.completed } : defaultStep;
        }));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleSetGoal = () => {
    if (!goal.trim()) return;
    setActiveGoal(goal);
    localStorage.setItem('bis_tracker_goal', goal);
    
    // Reset steps if it's a completely new goal
    if (goal !== activeGoal) {
      setSteps(DEFAULT_STEPS);
      localStorage.setItem('bis_tracker_steps', JSON.stringify(DEFAULT_STEPS));
    }
  };

  const toggleStep = (id: string) => {
    const updated = steps.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
    setSteps(updated);
    localStorage.setItem('bis_tracker_steps', JSON.stringify(updated));
  };

  const progress = Math.round((steps.filter(s => s.completed).length / steps.length) * 100) || 0;

  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-500" />
            Personalized Certification Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Set your target standard and track your end-to-end certification journey in one interactive dashboard.
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">Actionable Tool</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column - Goal Setting & Summary */}
        <div className="md:col-span-4 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-sm flex items-center gap-2">
              <Award className="h-4 w-4" />
              Set Your Goal
            </h3>
            <div className="space-y-3">
              <Input 
                placeholder="e.g., Applying for IS 13252" 
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
              <Button className="w-full" onClick={handleSetGoal}>
                {activeGoal ? 'Update Goal' : 'Start Tracking'}
              </Button>
            </div>
          </Card>

          {activeGoal && (
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
              <div className="mb-4">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Current Goal</p>
                <h2 className="text-xl font-bold text-gray-900">{activeGoal}</h2>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-gray-700">Overall Progress</span>
                  <span className="text-purple-700">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2.5 bg-purple-200" />
              </div>

              {progress === 100 && (
                <div className="mt-5 bg-green-100 border border-green-200 text-green-800 text-xs p-3 rounded-lg flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>Congratulations! You have completed all mandatory steps for this certification.</p>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right Column - Interactive Checklist */}
        <div className="md:col-span-8">
          {!activeGoal ? (
            <Card className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-muted/10 border-dashed">
              <ListTodo className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Active Goal</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Enter your product standard in the left panel to generate your personalized action plan and track your workflow.
              </p>
            </Card>
          ) : (
            <div className="space-y-4 animate-slide-up">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                Actionable Workflow
                <Badge variant="secondary" className="ml-2 font-normal">{steps.filter(s => s.completed).length} / {steps.length} Done</Badge>
              </h3>
              
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <Card 
                      key={step.id} 
                      className={"p-4 transition-all " + (step.completed ? "bg-muted/30 border-muted opacity-75" : "hover:border-purple-300")}
                    >
                      <div className="flex items-start gap-4">
                        <div className="pt-1">
                          <Checkbox 
                            checked={step.completed} 
                            onCheckedChange={() => toggleStep(step.id)}
                            className={step.completed ? "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" : ""}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className={"flex items-center gap-2 mb-1 " + (step.completed ? "text-muted-foreground line-through" : "text-foreground")}>
                            <Icon className="h-4 w-4 text-purple-500" />
                            <h4 className="font-medium text-sm">Step {index + 1}: {step.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground pl-6 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                        
                        {!step.completed && (
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-purple-600 self-center">
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
