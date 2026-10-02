import React, { useState, useEffect } from 'react';
import { Bell, BookmarkPlus, BookmarkCheck, Search, AlertTriangle, Info, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SubscribedStandard {
  id: string;
  name: string;
  subscribedAt: string;
  hasAlert: boolean;
}

const MOCK_DB = [
  { id: 'IS 269', name: 'Ordinary Portland Cement', alert: 'Amendment 3 issued on Sept 15, 2026 regarding revised compressive strength limits.' },
  { id: 'IS 14543', name: 'Packaged Drinking Water', alert: 'Draft revision available for public comments until Oct 10, 2026.' },
  { id: 'IS 13252', name: 'Information Technology Equipment - Safety', alert: 'New mandatory testing requirements for internal batteries effective Jan 2027.' },
  { id: 'IS 17899', name: 'Textiles - Protective Clothing', alert: 'Amendment 1 issued covering new flame retardant testing methods.' }
];

export function ProactiveAlertsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscribedStandard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('bis_alerts_subscriptions');
    if (saved) {
      try {
        setSubscriptions(JSON.parse(saved));
      } catch (e) {}
    } else {
      // Default demo subscription
      const demoSubs = [
        { id: 'IS 269', name: 'Ordinary Portland Cement', subscribedAt: new Date().toISOString(), hasAlert: true }
      ];
      setSubscriptions(demoSubs);
      localStorage.setItem('bis_alerts_subscriptions', JSON.stringify(demoSubs));
    }
  }, []);

  const handleSubscribe = () => {
    if (!searchQuery.trim()) return;
    
    const query = searchQuery.toUpperCase();
    if (subscriptions.find(s => s.id === query)) {
      toast({ title: 'Already Subscribed', description: `You are already tracking ${query}` });
      return;
    }

    // See if we have a mock DB entry for realistic alerts
    const dbMatch = MOCK_DB.find(m => m.id.includes(query) || m.name.toUpperCase().includes(query));
    
    const newSub: SubscribedStandard = {
      id: dbMatch ? dbMatch.id : query,
      name: dbMatch ? dbMatch.name : 'Custom Standard Tracking',
      subscribedAt: new Date().toISOString(),
      hasAlert: !!dbMatch
    };

    const updated = [newSub, ...subscriptions];
    setSubscriptions(updated);
    localStorage.setItem('bis_alerts_subscriptions', JSON.stringify(updated));
    setSearchQuery('');
    
    toast({ 
      title: 'Successfully Subscribed', 
      description: `You will now receive proactive alerts for ${newSub.id}`,
      variant: 'default'
    });
  };

  const handleUnsubscribe = (id: string) => {
    const updated = subscriptions.filter(s => s.id !== id);
    setSubscriptions(updated);
    localStorage.setItem('bis_alerts_subscriptions', JSON.stringify(updated));
    toast({ title: 'Unsubscribed', description: `Stopped tracking ${id}` });
  };

  const activeAlerts = subscriptions.filter(s => s.hasAlert);

  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Bell className="h-6 w-6 text-orange-500 fill-orange-500/20" />
            Proactive Amendment Alerts
          </h1>
          <p className="text-sm text-muted-foreground">
            Subscribe to your core business standards and get instant notifications on revisions, drafts, and amendments.
          </p>
        </div>
        <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">Continuous Compliance</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column - Subscription Management */}
        <div className="md:col-span-5 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-sm flex items-center gap-2">
              <BookmarkPlus className="h-4 w-4" />
              Subscribe to a Standard
            </h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="e.g. IS 269 or Cement" 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                />
              </div>
              <Button onClick={handleSubscribe} className="bg-orange-600 hover:bg-orange-700">Track</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              *Try searching for "IS 269", "IS 14543", or "IS 13252" to see dynamic amendment alerts in action.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-sm flex items-center gap-2">
              <BookmarkCheck className="h-4 w-4" />
              Your Tracked Standards
            </h3>
            
            {subscriptions.length === 0 ? (
              <div className="text-center py-6">
                <Info className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">You are not tracking any standards yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{sub.id}</span>
                        {sub.hasAlert && <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{sub.name}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleUnsubscribe(sub.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Alert Feed */}
        <div className="md:col-span-7">
          <Card className="h-full min-h-[400px] flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-orange-500" />
                Critical Compliance Alerts
              </h3>
              {activeAlerts.length > 0 && (
                <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">
                  {activeAlerts.length} New Alerts
                </Badge>
              )}
            </div>

            <div className="p-6 flex-1 bg-gradient-to-b from-white to-orange-50/20">
              {activeAlerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500/20 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">All Clear!</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    None of your tracked standards have recent amendments or revisions. You are 100% compliant.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-slide-up">
                  {activeAlerts.map(alert => {
                    const dbInfo = MOCK_DB.find(m => m.id === alert.id);
                    return (
                      <div key={alert.id} className="relative p-5 border border-orange-200 bg-orange-50/50 rounded-xl shadow-sm">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 rounded-l-xl"></div>
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                            {alert.id} Amendment
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Just now
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{alert.name}</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {dbInfo?.alert || "A new revision has been drafted for this standard. Please review to maintain compliance."}
                        </p>
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700 h-8 text-xs">View Document</Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs">Mark as Read</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
