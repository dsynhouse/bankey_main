
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { BankyProvider } from './context/BankyContext';
import { useBanky } from './context/useBanky';
import { FeatureFlagProvider } from './context/FeatureFlagContext';
import { Loader2 } from 'lucide-react';
import { supabase } from './services/supabase';

// Lazy Load Pages
const LandingPage = React.lazy(() => import('./components/LandingPage'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Tracker = React.lazy(() => import('./components/Tracker'));
const Education = React.lazy(() => import('./components/Education'));
const Advisor = React.lazy(() => import('./components/Advisor'));
const Accounts = React.lazy(() => import('./components/Accounts'));
const BudgetPlanner = React.lazy(() => import('./components/BudgetPlanner'));

const Login = React.lazy(() => import('./components/Login'));
const Register = React.lazy(() => import('./components/Register'));
const Settings = React.lazy(() => import('./components/Settings'));
const KnowledgeBank = React.lazy(() => import('./components/knowledge-bank/KnowledgeBank'));
const ModuleView = React.lazy(() => import('./components/knowledge-bank/ModuleView'));
const LessonView = React.lazy(() => import('./components/knowledge-bank/LessonView'));

// Protected Route Wrapper
const RequireAuth = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useBanky();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-paper">
        <Loader2 className="w-10 h-10 animate-spin text-ink" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Wrapper to redirect authenticated users away from public pages
const PublicRouteWrapper = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useBanky();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleInitialSession = async () => {
      // 1. Check if we are coming back from a Supabase Email Link
      const hash = window.location.hash;
      const isSupabaseRedirect = hash && (hash.includes('access_token') || hash.includes('type=recovery') || hash.includes('type=signup'));

      if (isSupabaseRedirect) {
        console.log("Supabase Redirect detected. intercepting...");

        // Let Supabase SDK process the hash implicitly
        const { data, error } = await supabase?.auth.getSession() || { data: {}, error: null };

        if (!error && data.session) {
          console.log("Session established via link.");
        }

        // CRITICAL: WIPE THE HASH before the Router sees it.
        // This prevents the "Broken Page" / hash conflict.
        window.history.replaceState(null, '', window.location.pathname);
      }

      // 2. Ready to render app
      setIsReady(true);
    };

    handleInitialSession();
  }, []);

  if (!isReady) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-paper text-ink gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-banky-green" />
        <h2 className="text-xl font-black uppercase font-display">Initializing...</h2>
      </div>
    );
  }

  return (
    <BankyProvider>
      <FeatureFlagProvider>
        <Router>
          <Layout>
            <React.Suspense fallback={
              <div className="h-screen w-full flex items-center justify-center bg-paper">
                <Loader2 className="w-10 h-10 animate-spin text-banky-blue" />
              </div>
            }>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicRouteWrapper><LandingPage /></PublicRouteWrapper>} />
                <Route path="/login" element={<PublicRouteWrapper><Login /></PublicRouteWrapper>} />
                <Route path="/register" element={<PublicRouteWrapper><Register /></PublicRouteWrapper>} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="/tracker" element={<RequireAuth><Tracker /></RequireAuth>} />
                <Route path="/budget" element={<RequireAuth><BudgetPlanner /></RequireAuth>} />
                {/* <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} /> */}
                <Route path="/knowledge-bank" element={<RequireAuth><KnowledgeBank /></RequireAuth>} />
                <Route path="/knowledge-bank/module/:moduleId" element={<RequireAuth><ModuleView /></RequireAuth>} />
                <Route path="/knowledge-bank/lesson/:lessonId" element={<RequireAuth><LessonView /></RequireAuth>} />
                <Route path="/education" element={<RequireAuth><Education /></RequireAuth>} />
                <Route path="/advisor" element={<RequireAuth><Advisor /></RequireAuth>} />
                <Route path="/accounts" element={<RequireAuth><Accounts /></RequireAuth>} />
                <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </React.Suspense>
          </Layout>
        </Router>
      </FeatureFlagProvider>
    </BankyProvider>
  );
};

export default App;
