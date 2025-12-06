import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PieChart, GraduationCap, Wallet, Calculator, LogOut, Settings, Moon, Sun, Sparkles } from 'lucide-react';
import { useBanky } from '../context/useBanky';
import { useSettings } from '../context/SettingsContext';
import Mascot from './Mascot';
import DsynLabsLogo from './DsynLabsLogo';
import DailyBonusModal from './DailyBonusModal';
import OnboardingModal from './OnboardingModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  // Use domain context for theme settings
  const { theme, toggleTheme } = useSettings();
  // Use main context for user and session operations
  const { user, userState, logout, showDailyBonus, closeDailyBonus } = useBanky();

  // Hide Sidebar on Public pages
  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);

  // Render Public Layout (simpler)
  if (isPublicPage) {
    return (
      <>
        <div className="absolute top-4 right-4 z-50 md:hidden">
          <button
            onClick={toggleTheme}
            className="bg-white border-2 border-ink p-2 rounded-full shadow-neo-sm active:translate-y-0.5 active:shadow-none transition-all"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-ink" /> : <Moon className="w-5 h-5 text-ink" />}
          </button>
        </div>
        {children}
        {/* Theme Toggle for Desktop Public Pages */}
        <div className="hidden md:block fixed bottom-6 right-6 z-50">
          <button
            onClick={toggleTheme}
            className="bg-paper border-2 border-ink p-3 rounded-full shadow-neo hover:-translate-y-1 transition-all flex items-center gap-2"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-ink" /> : <Moon className="w-5 h-5 text-ink" />}
            <span className="text-xs font-black uppercase text-ink">Mode</span>
          </button>
        </div>
      </>
    );
  }

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { path: '/tracker', label: 'The Drip Check', icon: PieChart },
    { path: '/budget', label: 'The Limit', icon: Calculator },
    { path: '/accounts', label: 'The Wallet', icon: Wallet },
    { path: '/education', label: 'The Learn Tab', icon: GraduationCap },
    { path: '/advisor', label: 'Hype Man', icon: Sparkles },

    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper text-ink transition-colors duration-300">

      {/* Daily Bonus Modal Overlay */}
      {showDailyBonus && <DailyBonusModal onClose={closeDailyBonus} />}

      {/* Onboarding Modal Overlay - Checks user state internally */}
      <OnboardingModal />

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r-2 border-ink p-6 sticky top-0 h-screen z-10 transition-colors duration-300">
        <Link to="/dashboard" className="flex flex-col items-start gap-2 mb-12 group">
          <div className="flex items-center gap-2">
            <Mascot className="w-12 h-12" isStatic mood="cool" />
            <span className="text-4xl font-black tracking-tighter text-ink italic font-display">bankey.</span>
          </div>
          <DsynLabsLogo className="h-6 ml-2" />
        </Link>

        <nav className="flex-1 space-y-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 border-2 transition-all duration-200 group ${isActive
                  ? 'bg-banky-pink text-ink border-ink shadow-neo font-bold translate-x-1 -translate-y-1'
                  : 'bg-transparent border-transparent text-gray-500 hover:text-ink hover:bg-banky-yellow hover:border-ink hover:shadow-neo hover:-translate-y-1'
                  }`}
              >
                <Icon className={`w-6 h-6 stroke-[2.5px] ${isActive ? 'text-ink' : 'text-current'}`} />
                <span className="text-lg">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Toggle */}
        <div className="mt-auto space-y-4">


          <button onClick={logout} className="w-full flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500 px-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          <div className="p-4 bg-ink text-paper border-2 border-ink shadow-neo">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs font-bold text-banky-yellow uppercase tracking-widest">Level {userState.level}</p>
                <p className="text-xl font-black truncate max-w-[120px]">{user?.name || 'Saver'}</p>
              </div>
              <p className="text-xs font-mono">{userState.totalXp} XP</p>
            </div>
            <div className="w-full bg-gray-800 h-4 border border-white/20">
              <div
                className="bg-banky-green h-full border-r border-white/20 relative overflow-hidden transition-all duration-1000"
                style={{ width: `${(userState.totalXp % 500) / 5}%` }}
              >
                <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhZWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative bg-[radial-gradient(var(--color-ink)_1px,transparent_1px)] [background-size:24px_24px] opacity-100 transition-colors duration-300">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col gap-2 mb-6 bg-white border-2 border-ink shadow-neo p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mascot className="w-8 h-8" isStatic mood="cool" />
                <span className="text-xl font-black italic tracking-tighter font-display text-ink">bankey.</span>
              </div>
              <div className="flex items-center gap-2">

                <div className="px-3 py-1 bg-ink text-banky-yellow text-xs border-2 border-transparent font-bold">
                  Lvl {userState.level}
                </div>
                <button onClick={logout} className="p-1 text-ink"><LogOut className="w-5 h-5" /></button>
              </div>
            </div>
          </div>

          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-ink px-4 py-3 flex justify-around items-center z-50 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${isActive ? 'bg-banky-yellow border-2 border-ink shadow-neo-sm -translate-y-2' : 'text-gray-400'
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-ink' : 'text-gray-400'}`} strokeWidth={2.5} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
