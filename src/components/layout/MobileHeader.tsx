import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, Menu, X, Home, BookOpen, Target, BarChart3, User, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const navigationItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Routines', href: '/workouts', icon: BookOpen },
  { name: 'Exercises', href: '/exercises', icon: Dumbbell },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Progress', href: '/progress', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">FreakBeast</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm animate-fade-in">
          <div className="pt-20 px-6 pb-6 h-full flex flex-col">
            <nav className="space-y-2 flex-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href ||
                  (item.href === '/workouts' && location.pathname.includes('/routines'));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 rounded-xl transition-colors text-base font-medium",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-4 rounded-xl text-destructive hover:bg-destructive/10 transition-colors text-base font-medium w-full"
              >
                <LogOut className="w-6 h-6" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileHeader;
