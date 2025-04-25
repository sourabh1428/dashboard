import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  PlusCircle,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

import { useTheme } from '../ThemeProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
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

  // Handle hover events
  const handleMouseEnter = () => setIsExpanded(true);
  const handleMouseLeave = () => setIsExpanded(false);

  // Handle resize for mobile view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/signin');
  };

  // Sidebar variants for animation
  const sidebarVariants = {
    expanded: {
      width: '240px',
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(var(--card), 0.8)',
      transition: {
        duration: 0.3,
        type: 'spring',
        damping: 20
      }
    },
    collapsed: {
      width: '70px',
      backdropFilter: 'blur(2px)',
      backgroundColor: 'rgba(var(--card), 0.5)',
      transition: {
        duration: 0.3,
        type: 'spring',
        damping: 20
      }
    }
  };

  const navTextVariants = {
    expanded: {
      opacity: 1,
      display: 'block',
      transition: {
        duration: 0.2,
        delay: 0.1
      }
    },
    collapsed: {
      opacity: 0,
      display: 'none',
      transition: {
        duration: 0.2
      }
    }
  };

  const renderNavItem = (item, index) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    
    return (
      <li key={index}>
        <Link 
          to={item.path}
          className={`flex items-center px-4 py-2.5 transition-all duration-200 ${
            isActive 
              ? 'text-primary bg-primary/5 font-medium' 
              : 'text-muted-foreground hover:bg-accent/5 hover:backdrop-blur-md'
          }`}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <motion.span
            className="ml-4 truncate text-sm"
            variants={navTextVariants}
            initial="collapsed"
            animate={isExpanded ? 'expanded' : 'collapsed'}
          >
            {item.name}
          </motion.span>
        </Link>
      </li>
    );
  };

  return (
    <motion.div
      className="h-screen backdrop-blur-sm fixed left-0 top-0 z-40 flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      variants={sidebarVariants}
      initial="collapsed"
      animate={isExpanded ? 'expanded' : 'collapsed'}
      style={{
        boxShadow: isExpanded ? '0 0 15px rgba(0, 0, 0, 0.1)' : 'none',
        borderRight: '1px solid rgba(var(--border), 0.2)'
      }}
    >
      {/* Empty space for logo area */}
      <div className="h-16"></div>
      
      {/* Main Navigation - using max-height with no scrollbar */}
      <div className="flex-grow py-2 flex flex-col overflow-hidden">
        <nav className="space-y-0.5 mb-4">
          <motion.p 
            className="px-4 py-1 text-xs uppercase text-muted-foreground font-medium tracking-wider"
            variants={navTextVariants}
            initial="collapsed"
            animate={isExpanded ? 'expanded' : 'collapsed'}
          >
            Main
          </motion.p>
          <ul className="space-y-0.5">
            {mainNavItems.map(renderNavItem)}
          </ul>
        </nav>
        
        {/* Create Section */}
        <nav className="space-y-0.5 mb-4">
          <div className="px-4 py-1 flex items-center">
            <motion.p 
              className="text-xs uppercase text-muted-foreground font-medium tracking-wider flex-1"
              variants={navTextVariants}
              initial="collapsed"
              animate={isExpanded ? 'expanded' : 'collapsed'}
            >
              Create
            </motion.p>
            
            {/* Create Dropdown when collapsed */}
            {!isExpanded && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right">
                  {createNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{item.name}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <ul className="space-y-0.5">
            {createNavItems.map(renderNavItem)}
          </ul>
        </nav>
        
        {/* Utility Section */}
        <nav className="space-y-0.5">
          <motion.p 
            className="px-4 py-1 text-xs uppercase text-muted-foreground font-medium tracking-wider"
            variants={navTextVariants}
            initial="collapsed"
            animate={isExpanded ? 'expanded' : 'collapsed'}
          >
            Utility
          </motion.p>
          <ul className="space-y-0.5">
            {utilityNavItems.map(renderNavItem)}
          </ul>
        </nav>
      </div>
      
      {/* User section & Logout */}
      <div className="pb-2 pt-1">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center text-left px-4 py-2.5 hover:bg-accent/5 text-muted-foreground transition-all duration-200 hover:backdrop-blur-md"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <motion.span
            className="ml-4 truncate text-sm"
            variants={navTextVariants}
            initial="collapsed"
            animate={isExpanded ? 'expanded' : 'collapsed'}
          >
            Log out
          </motion.span>
        </button>
      </div>
      
      {/* Theme toggle */}
      <div className="p-2 flex justify-center mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
          className="hover:backdrop-blur-md"
        >
          {theme === 'dark' ? (
            <motion.div
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Sun className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ rotate: 30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Moon className="h-5 w-5" />
            </motion.div>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default Sidebar; 