import React, { useState, useEffect } from 'react';
import Sidebar from '../SidebarNavigation/Sidebar';
import MobileSidebar from '../SidebarNavigation/MobileSidebar';
import { useTheme } from '../ThemeProvider';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MainLayout = ({ children }) => {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check viewport width for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Adjust padding for mobile screens
  const mainContentStyles = {
    paddingLeft: isMobile ? '0' : '70px', // Match the collapsed sidebar width
  };
  
  return (
    <div className={`flex min-h-screen bg-background ${theme}`}>
      {/* Desktop Sidebar - hidden on mobile */}
      {!isMobile && <Sidebar />}
      
      {/* Mobile Sidebar */}
      {isMobile && (
        <MobileSidebar 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />
      )}
      
      {/* Main content */}
      <div 
        className="flex-1 transition-all duration-300 overflow-auto"
        style={mainContentStyles}
      >
        {/* Mobile header with menu button */}
        {isMobile && (
          <div className="sticky top-0 z-10 flex items-center h-16 px-4 border-b bg-background/95 backdrop-blur">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(true)}
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
            <div className="flex-1" />
          </div>
        )}
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 