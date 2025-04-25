import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Mail, 
  Users, 
  Settings, 
  Zap,
  FileText,
  MessageSquare,
  BarChart3,
  CreditCard,
  Upload,
  Code,
  LogOut,
  X,
  Sun,
  Moon
} from 'lucide-react';

import { useTheme } from '../ThemeProvider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetClose } from "@/components/ui/sheet";

const MobileSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const mainNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Customers', icon: Users, path: '/users' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'Billing', icon: CreditCard, path: '/invoicing' },
    { name: 'Automations', icon: Zap, path: '/automation' },
  ];

  const createNavItems = [
    { name: 'Email Campaign', icon: Mail, path: '/Createemail' },
    { name: 'Onsite Campaign', icon: FileText, path: '/Createonsite' },
    { name: 'WhatsApp Campaign', icon: MessageSquare, path: '/createWhatsapp' },
  ];

  const utilityNavItems = [
    { name: 'User Upload', icon: Upload, path: '/userUpload' },
    { name: 'HTML Editor', icon: Code, path: '/htmlEditor' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/signin');
    onClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    
    return (
      <button
        key={item.path}
        className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${
          isActive 
            ? 'text-primary bg-primary/5 font-medium' 
            : 'text-muted-foreground hover:bg-accent/1 hover:backdrop-blur-xl'
        }`}
        onClick={() => handleNavigation(item.path)}
      >
        <Icon className="h-4 w-4" />
        <span>{item.name}</span>
      </button>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="left" 
        className="w-[260px] sm:w-[300px] p-0 bg-card/75 backdrop-blur-lg"
        style={{
          boxShadow: '0 0 25px rgba(0, 0, 0, 0.1)',
          borderRight: '1px solid rgba(var(--border), 0.15)'
        }}
      >
        <SheetHeader className="p-4 flex justify-end">
          <SheetClose>
            <Button variant="ghost" size="icon" className="hover:backdrop-blur-xl hover:bg-accent/5">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </SheetHeader>
        
        <div className="overflow-hidden py-2 flex flex-col h-[calc(100vh-70px)]">
          {/* Main Navigation */}
          <div className="px-3 mb-3">
            <p className="px-3 py-1 text-xs uppercase text-muted-foreground font-medium tracking-wider">
              Main
            </p>
            <div className="space-y-1 mt-1">
              {mainNavItems.map(renderNavItem)}
            </div>
          </div>
          
          {/* Create Section */}
          <div className="px-3 mb-3">
            <p className="px-3 py-1 text-xs uppercase text-muted-foreground font-medium tracking-wider">
              Create
            </p>
            <div className="space-y-1 mt-1">
              {createNavItems.map(renderNavItem)}
            </div>
          </div>
          
          {/* Utility Section */}
          <div className="px-3">
            <p className="px-3 py-1 text-xs uppercase text-muted-foreground font-medium tracking-wider">
              Utility
            </p>
            <div className="space-y-1 mt-1">
              {utilityNavItems.map(renderNavItem)}
            </div>
          </div>
          
          {/* Theme Toggle */}
          <div className="px-6 py-3 mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Theme</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hover:backdrop-blur-xl hover:bg-accent/5"
              >
                {theme === 'dark' ? (
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span className="text-xs">Light</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span className="text-xs">Dark</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
          
          {/* Logout Button */}
          <div className="px-6 py-3">
            <Button
              variant="outline"
              className="w-full justify-start hover:backdrop-blur-xl hover:bg-accent/5"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar; 