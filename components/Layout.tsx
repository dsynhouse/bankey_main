
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBanky } from '../context/useBanky';
import { Sparkles, LayoutDashboard, Wallet, Calculator, Settings, LogOut } from 'lucide-react';
import Mascot from './Mascot';
import { VoiceInputButton } from './VoiceInputButton';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, userState, logout } = useBanky();

  const isPublicRoute = ['/', '/login', '/register', '/privacy', '/terms', '/data-protection',
    '/cancellation', '/disclaimers', '/contact', '/shipping', '/health', '/ios-install'].includes(location.pathname);

  // Don't show layout on public routes except legal pages
  if (isPublicRoute && !location.pathname.startsWith('/privacy') &&
    !location.pathname.startsWith('/terms') && !location.pathname.startsWith('/data-protection') &&
    !location.pathname.startsWith('/cancellation') && !location.pathname.startsWith('/disclaimers') &&
    !location.pathname.startsWith('/contact') && !location.pathname.startsWith('/shipping')) {
    return <>{children}</>;
  }

  // For legal pages, show minimal layout
  if (location.pathname.startsWith('/privacy') || location.pathname.startsWith('/terms') ||
    location.pathname.startsWith('/data-protection') || location.pathname.startsWith('/cancellation') ||
    location.pathname.startsWith('/disclaimers') || location.pathname.startsWith('/contact') ||
    location.pathname.startsWith('/shipping')) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        {children}
      </div>
    );
  }

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/budget', label: 'Budget', icon: Calculator },
    { path: '/advisor', label: 'AI Advisor', icon: Sparkles },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-paper text-ink overflow-hidden transition-colors duration-300">

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r-4 border-ink p-6 sticky top-0 h-screen z-10 transition-colors duration-300">
        {/* Enhanced Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 mb-10 group px-2">
          <Mascot className="w-12 h-12 animate-float" isStatic={false} mood="cool" />
          <div className="flex flex-col">
            <span className="text-5xl font-black tracking-tighter text-ink italic font-display hover:scale-105 transition-all relative">
              bankey.
              <span className="absolute bottom-1 left-0 w-full h-1.5 bg-banky-yellow -z-10 group-hover:h-3 transition-all"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-ink/60 mt-1 pl-1 whitespace-nowrap">
              Level Up Your Finances
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 font-black uppercase text-sm transition-all border-2 rounded-xl mb-2 ${isActive
                      ? 'bg-ink text-white border-ink shadow-neo translate-x-2'
                      : 'border-transparent text-ink/70 hover:bg-banky-yellow hover:border-ink hover:shadow-neo-sm hover:translate-x-1'
                      } `}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-banky-blue' : ''} `} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile & Logout */}
        <div className="mt-auto space-y-4">
          <button onClick={logout} className="w-full flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500 px-4 py-2 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          <div className="p-4 bg-ink text-paper border-2 border-ink shadow-neo rounded-xl mx-2">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs font-bold text-banky-blue uppercase tracking-widest">Level {userState.level}</p>
                <p className="text-xl font-black truncate max-w-[120px]">{user?.name || 'Saver'}</p>
              </div>
              <p className="text-xs font-mono">{userState.totalXp} XP</p>
            </div>
            <div className="w-full bg-gray-800 h-4 border border-white/20">
              <div
                className="bg-banky-green h-full border-r border-white/20 relative overflow-hidden transition-all duration-1000"
                style={{ width: `${(userState.totalXp % 500) / 5}% ` }}
              >
                <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhZWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 md:pb-0 relative bg-[radial-gradient(var(--color-ink)_1px,transparent_1px)] [background-size:24px_24px] opacity-100 transition-colors duration-300 scroll-smooth [-webkit-overflow-scrolling:touch]">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between mb-6 bg-white border-4 border-ink shadow-neo p-3">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Mascot className="w-8 h-8" isStatic={false} mood="cool" />
              <span className="text-2xl font-black tracking-tighter text-ink italic font-display">bankey.</span>
            </Link>
            <button
              onClick={logout}
              className="bg-white border-2 border-ink p-2 rounded-xl text-ink hover:text-red-500 hover:bg-red-50 transition-colors shadow-neo-sm"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-ink z-50 safe-area-bottom">
        <div className="flex items-center justify-around p-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 transition-all ${isActive ? 'text-ink' : 'text-gray-400'
                  } `}
              >
                <item.icon className={`w-6 h-6 ${isActive ? 'text-banky-blue' : ''} `} />
                <span className="text-[10px] font-black uppercase">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Global Voice Input */}
      <VoiceInputButton />
    </div>
  );
};

export default Layout;
