import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Store, 
  Users, 
  Home, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  PlusCircle, 
  Activity,
  ChevronDown,
  Database
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast, ToastContainer } from "@/components/ui/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

const SuperAdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, addToast, removeToast } = useToast();
  
  // Check if user is authenticated as super admin
  useEffect(() => {
    const token = localStorage.getItem('superAdminToken');
    const role = localStorage.getItem('superAdminRole');
    
    if (!token || role !== 'superAdmin') {
      navigate('/super-admin/login');
    }
  }, [navigate]);
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminRole');
    addToast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
      duration: 3000,
    });
    navigate('/super-admin/login');
  };
  
  // Navigation items
  const navItems = [
    { path: '/super-admin/dashboard', label: 'Dashboard', icon: Home },
    { path: '/super-admin/tenants', label: 'Tenants', icon: Store },
    { path: '/super-admin/admins', label: 'Admins', icon: Users },
    { path: '/super-admin/database', label: 'Database Management', icon: Database },
    { path: '/super-admin/settings', label: 'Settings', icon: Settings },
  ];
  
  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Desktop Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } hidden lg:block`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-700">
            <Shield className="h-6 w-6 text-blue-400" />
            <h1 className="text-xl font-bold">Super Admin</h1>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-700">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-gray-800 text-white border-r border-gray-700">
          <SheetHeader className="px-6 py-4 border-b border-gray-700">
            <SheetTitle className="flex items-center gap-2 text-white">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">Super Admin</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-full">
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            
            <div className="p-4 border-t border-gray-700">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon"
                className="lg:hidden text-gray-300 hover:text-white hover:bg-gray-700 mr-2"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <h2 className="text-xl font-semibold">
                {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full h-10 w-10 bg-gray-700">
                    <Shield className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700 text-white">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">Super Admin</p>
                    <p className="text-xs text-gray-400 truncate">
                      {localStorage.getItem('superAdminEmail') || 'admin@easibill.com'}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700"
                    onClick={() => navigate('/super-admin/settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-gray-700 focus:bg-gray-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout; 