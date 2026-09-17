import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bookmark, History, Sparkles, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/shared/state-components';

export function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/dashboard', {
      headers: { 'x-session-id': localStorage.getItem('sessionId') || 'default-session' }
    })
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-12"><LoadingState message="Loading your dashboard..." /></div>;

  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          Personalized Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Manage your saved standards and view recent activity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMN 1: Saved Standards */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 border-b pb-2">
              <Bookmark className="h-5 w-5 text-primary" /> Saved Standards
            </h2>
            {data?.savedStandards?.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">You have not saved any standards yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.savedStandards?.map((s: any) => (
                  <Card key={s.id} className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => navigate(`/standards/${s.standard.id}`)}>
                    <p className="font-bold text-primary">{s.standard.isNumber}</p>
                    <p className="text-sm line-clamp-2 mt-1">{s.standard.title}</p>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Recommendations */}
          <Card className="p-6 bg-gradient-to-r from-card to-primary/5">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 border-b pb-2">
              <Sparkles className="h-5 w-5 text-purple-500" /> Recommended For You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.recommendations?.map((r: any) => (
                <Card key={r.id} className="p-4 cursor-pointer hover:border-purple-500/50 transition-colors" onClick={() => navigate(`/standards/${r.id}`)}>
                  <p className="font-bold text-purple-600">{r.isNumber}</p>
                  <p className="text-sm line-clamp-2 mt-1">{r.title}</p>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* COLUMN 2: Recent Activity */}
        <div className="space-y-6">
          <Card className="p-6 h-full">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 border-b pb-2">
              <History className="h-5 w-5 text-muted-foreground" /> Recent Activity
            </h2>
            {data?.activities?.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No recent activity.</p>
            ) : (
              <ul className="space-y-4">
                {data?.activities?.map((a: any) => (
                  <li key={a.id} className="text-sm flex gap-3">
                    <div className="mt-0.5"><BookOpen className="h-4 w-4 text-muted-foreground" /></div>
                    <div>
                      <p className="font-medium">{a.activityType.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
