import { useState } from 'react';
import { LandingPage } from './components/landing-page';
import { Dashboard } from './components/dashboard';
import { ProgressUI } from './components/progress-ui';
import { ResultsPage } from './components/results-page';
import { HistoryPage } from './components/history-page';
import { AuthModal } from './components/auth-modal';
import { DataModelInsights } from './components/data-model-insights';
import { ZKVerifier } from './components/zk-verifier';

type Page = 'landing' | 'dashboard' | 'progress' | 'results' | 'history' | 'insights' | 'verifier';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [trainingData, setTrainingData] = useState<any>(null);
  const [trainingResults, setTrainingResults] = useState<any>(null);

  // Apply dark mode
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark');
  }

  const handleAuth = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
    setCurrentPage('dashboard');
  };

  const handleStartTraining = (data: any) => {
    setTrainingData(data);
    setCurrentPage('progress');
  };

  const handleTrainingComplete = (results: any) => {
    setTrainingResults(results);
    setCurrentPage('results');
  };

  const navigateTo = (page: Page) => {
    if (!isAuthenticated && page !== 'landing') {
      setShowAuth(true);
    } else {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {currentPage === 'landing' && (
        <LandingPage 
          onTryDemo={() => navigateTo('dashboard')} 
          onLogin={() => setShowAuth(true)}
        />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard 
          onNavigate={navigateTo}
          onStartTraining={handleStartTraining}
        />
      )}
      {currentPage === 'progress' && (
        <ProgressUI 
          onNavigate={navigateTo}
          onComplete={handleTrainingComplete}
          trainingData={trainingData}
        />
      )}
      {currentPage === 'results' && (
        <ResultsPage 
          onNavigate={navigateTo}
          trainingData={trainingData}
          trainingResults={trainingResults}
        />
      )}
      {currentPage === 'history' && (
        <HistoryPage onNavigate={navigateTo} />
      )}
      {currentPage === 'insights' && (
        <DataModelInsights onNavigate={navigateTo} />
      )}
      {currentPage === 'verifier' && (
        <ZKVerifier onNavigate={navigateTo} />
      )}
      
      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)}
          onAuth={handleAuth}
        />
      )}
    </div>
  );
}