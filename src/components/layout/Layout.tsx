import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="relative min-h-screen">
      {/* Fixed Nature Background */}
      <div 
        className="fixed inset-0 z-0 nature-bg"
        aria-hidden="true"
      />
      
      {/* Green Overlay */}
      <div 
        className="fixed inset-0 z-0 nature-overlay"
        aria-hidden="true"
      />
      
      {/* Content Layer */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        {showFooter && <Footer />}
      </div>
    </div>
  );
}
