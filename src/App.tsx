import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { AssistantPage } from '@/pages/AssistantPage';
import { LiveVoicePage } from '@/pages/LiveVoicePage';
import { ComplianceCheckerPage } from '@/pages/ComplianceCheckerPage';
import { CostEstimatorPage } from '@/pages/CostEstimatorPage';
import { TrackerDashboardPage } from '@/pages/TrackerDashboardPage';
import { ProactiveAlertsPage } from '@/pages/ProactiveAlertsPage';
import { StandardsFinderPage } from '@/pages/StandardsFinderPage';
import { StandardDetailsPage } from '@/pages/StandardDetailsPage';
import { CertificationPage } from '@/pages/CertificationPage';
import { RecommendationPage } from '@/pages/RecommendationPage';
import { SearchResultsPage } from '@/pages/SearchResultsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CompareStandardsPage } from '@/pages/CompareStandardsPage';
import { LaboratoryFinderPage } from '@/pages/LaboratoryFinderPage';
import { HallmarkingPage } from '@/pages/HallmarkingPage';
import { ConsumerHelpPage } from '@/pages/ConsumerHelpPage';
import { StandardsExplorerPage } from '@/pages/StandardsExplorerPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { NotificationProvider, useNotifications } from '@/contexts/NotificationContext';
import { useEffect } from 'react';
import { AboutPage } from '@/pages/AboutPage';


function NotificationPoller() {
  const { addNotification } = useNotifications();
  
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:3001/api/notifications/poll', {
        headers: { 'x-session-id': localStorage.getItem('sessionId') || 'default-session' }
      })
      .then(r => r.json())
      .then(data => {
        if (data && data.length > 0) {
          data.forEach((n: any) => addNotification({ title: n.title, message: n.message, type: n.type }));
        }
      })
      .catch(e => console.error(e));
    }, 10000); 
    
    return () => clearInterval(interval);
  }, [addNotification]);
  
  return null;
}

function App() {
  return (
    <SettingsProvider>
      <NotificationProvider>
        <BrowserRouter>
          <NotificationPoller />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/voice-mode" element={<LiveVoicePage />} />
              <Route path="/compliance" element={<ComplianceCheckerPage />} />
          <Route path="/estimator" element={<CostEstimatorPage />} />
          <Route path="/tracker" element={<TrackerDashboardPage />} />
          <Route path="/alerts" element={<ProactiveAlertsPage />} />
          <Route path="/standards-finder" element={<StandardsFinderPage />} />
          <Route path="/standards/:id" element={<StandardDetailsPage />} />
          <Route path="/certification" element={<CertificationPage />} />
          <Route path="/laboratories" element={<LaboratoryFinderPage />} />
          <Route path="/hallmarking" element={<HallmarkingPage />} />
          <Route path="/consumer" element={<ConsumerHelpPage />} />
          <Route path="/explorer" element={<StandardsExplorerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
      </NotificationProvider>
    </SettingsProvider>
  );
}

export default App;
