import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';

import {
  Activity,
  Moon,
  Sun,
  Sparkles,
  Search,
  Menu,
  CircleUser,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Users,
  BarChart3,
  LayoutDashboard,
  CreditCard,
  MessageSquare,
  Mail,
  PlusCircle,
  FileText,
  X,
  Upload,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useTheme } from './ThemeProvider';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLogout = () => {
    localStorage.clear();
    navigate('/signin');
  };

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/users', label: 'Customers', icon: Users },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/invoicing', label: 'Billing', icon: CreditCard },
    { path: '/automation', label: 'Automations', icon: Zap },
  ];

  const createLinks = [
    { path: '/Createemail', label: 'Email Campaign', icon: Mail },
    { path: '/Createonsite', label: 'Onsite Campaign', icon: FileText },
    { path: '/createWhatsapp', label: 'WhatsApp Campaign', icon: MessageSquare },
  ];

  // Placeholder notifications
  useEffect(() => {
    setNotifications([
      { id: 1, title: 'New subscriber', description: 'You have a new subscriber', time: '2 min ago' },
      { id: 2, title: 'Campaign completed', description: 'Your campaign has been completed', time: '1 hour ago' },
    ]);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled ? 'bg-background/85 backdrop-blur-md shadow-sm' : 'bg-background/50 backdrop-blur-sm'
    }`}>
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Mobile Nav */}
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px]">
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>Easibill</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="grid gap-5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-2 py-1.5 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-accent/10 text-accent font-medium' 
                            : 'text-muted-foreground hover:bg-muted'
                        }`
                      }
                      onClick={() => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </NavLink>
                  );
                })}
                
                <div className="divider">Actions</div>
                
                {createLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className="flex items-center gap-3 px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                      onClick={() => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </NavLink>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop Logo */}
          <NavLink to="/" className="mr-6 flex items-center space-x-2">

            <span className="hidden font-bold sm:inline-block">
              Easibill
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 ml-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive 
                        ? 'bg-accent/10 text-accent font-medium' 
                        : 'text-muted-foreground hover:bg-muted'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right Side - Search, Create, Theme, Notifications, Profile */}
        <div className="flex items-center gap-2">
          {/* Create New Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="hidden sm:flex items-center gap-2">
                <PlusCircle className="h-4 w-4" /> 
                <span>Create</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Create New</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {createLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <DropdownMenuItem key={link.path} onClick={() => navigate(link.path)}>
                    <Icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-lg">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Settings className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>


          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">User</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    user@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;