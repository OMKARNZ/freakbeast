import { ReactNode } from 'react';
import BottomNavigation from './BottomNavigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20"> {/* Add padding bottom for navigation */}
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Layout;