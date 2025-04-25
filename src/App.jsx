import { Route, Routes, useLocation } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ErrorBoundary from './Components/ErrorBoundary';
import ProtectedRoute from './Components/ProtectedRoute';
import MainLayout from './Components/Layout/MainLayout';

// Lazy load components
const AllCampaign = lazy(() => import('./Components/AllCampaign'));
const Allusers = lazy(() => import('./Components/Allusers'));
const UserActivity = lazy(() => import('./Components/UserActivity'));
const SignUp = lazy(() => import('./Auth/SignUp'));
const SignIn = lazy(() => import('./Auth/SignIn'));
const SuperAdminSignIn = lazy(() => import('./Auth/SuperAdminSignIn'));
const Analytics = lazy(() => import('./Charts/Analytics'));
const MultiStepForm = lazy(() => import('./Campaigns/CreateOnsite'));
const SingleCampaign = lazy(() => import('./Campaigns/SingleCampaign'));
const EmailCampaign = lazy(() => import('./Components/Emails/EmailCampaign'));
const Home = lazy(() => import('./Components/Dashboard'));
const CreateEmail = lazy(() => import('./Components/Emails/CreateEmail'));
const Dashboard = lazy(() => import('./bdashboard/Bdashboard'));
const ReceiptTemplates = lazy(() => import('./bdashboard/ReceiptTemplates'));
const CreateWhatsapp = lazy(() => import('./Campaigns/CreateWhatsapp'));
const UserUpload = lazy(() => import('./Components/UserUpload/UserUpload'));
const Settings = lazy(() => import('./Components/Settings/Settings'));
const NotionReciept = lazy(() => import('./bdashboard/NotionReciept'));
const HTMLEditor = lazy(() => import('./Components/HTML/HTMLEditor'));
const AutomationList = lazy(() => import('./Components/Automation/AutomationList'));
const AutomationDetail = lazy(() => import('./Components/Automation/AutomationDetail'));
const AutomationCreate = lazy(() => import('./Components/Automation/AutomationCreate'));
const AutomationSettings = lazy(() => import('./Components/Automation/AutomationSettings'));

// Super Admin Components
const SuperAdminLayout = lazy(() => import('./SuperAdmin/Layout'));
const SuperAdminDashboard = lazy(() => import('./SuperAdmin/Dashboard'));
const CreateTenant = lazy(() => import('./SuperAdmin/CreateTenant'));
const DatabaseManagement = lazy(() => import('./SuperAdmin/Database/DatabaseManagement'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// SuperAdmin route protection
const SuperAdminRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('superAdminToken');
  
  console.log("SuperAdminRoute - checking token:", token ? "exists" : "missing");
  
  if (!token) {
    console.log("No superAdminToken found, redirecting to login");
    return <Navigate to="/super-admin/login" />;
  }
  
  return children;
};

const App = () => {
  const location = useLocation();
  
  // Check if the current route should render without our main layout
  const isAuthRoute = ['/signin', '/signup', '/super-admin/login'].includes(location.pathname);
  const isSuperAdminRoute = location.pathname.startsWith('/super-admin');
  const isInvoicingRoute = location.pathname.startsWith('/invoicing');
  
  // Skip layout for auth routes and super admin routes
  const skipLayout = isAuthRoute || isSuperAdminRoute || isInvoicingRoute;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            
            {/* Super Admin routes */}
            <Route path="/super-admin/login" element={<SuperAdminSignIn />} />
            <Route path="/super-admin" element={
              <SuperAdminRoute>
                <SuperAdminLayout />
              </SuperAdminRoute>
            }>
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="tenants" element={<SuperAdminDashboard />} />
              <Route path="tenants/new" element={<CreateTenant />} />
              <Route path="tenants/:id" element={<SuperAdminDashboard />} />
              <Route path="database" element={<DatabaseManagement />} />
              <Route path="database/:tenantId" element={<DatabaseManagement />} />
              <Route path="admins" element={<SuperAdminDashboard />} />
              <Route path="settings" element={<SuperAdminDashboard />} />
              <Route index element={<Navigate to="/super-admin/dashboard" />} />
            </Route>
            
            {/* Invoicing routes without sidebar */}
            <Route path="/invoicing" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/invoicing/receipt-templates" element={
              <ProtectedRoute>
                <ReceiptTemplates />
              </ProtectedRoute>
            } />
            
            {/* Protected routes with sidebar */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <Home />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/allCampaign" element={
              <ProtectedRoute>
                <MainLayout>
                  <AllCampaign />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <MainLayout>
                  <Allusers />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/user/:id" element={
              <ProtectedRoute>
                <MainLayout>
                  <UserActivity />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <MainLayout>
                  <Analytics />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/Createonsite" element={
              <ProtectedRoute>
                <MainLayout>
                  <MultiStepForm />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/campaign/:cid" element={
              <ProtectedRoute>
                <MainLayout>
                  <SingleCampaign />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/Createemail" element={
              <ProtectedRoute>
                <MainLayout>
                  <CreateEmail />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/EmailCampaign" element={
              <ProtectedRoute>
                <MainLayout>
                  <EmailCampaign />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/createWhatsapp" element={
              <ProtectedRoute>
                <MainLayout>
                  <CreateWhatsapp />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/userUpload" element={
              <ProtectedRoute>
                <MainLayout>
                  <UserUpload />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/NotionReciept" element={
              <ProtectedRoute>
                <MainLayout>
                  <NotionReciept />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/htmlEditor" element={
              <ProtectedRoute>
                <MainLayout>
                  <HTMLEditor />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/automation/settings" element={
              <ProtectedRoute>
                <MainLayout>
                  <AutomationSettings />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/automation/create" element={
              <ProtectedRoute>
                <MainLayout>
                  <AutomationCreate />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/automation/:id" element={
              <ProtectedRoute>
                <MainLayout>
                  <AutomationDetail />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/automation" element={
              <ProtectedRoute>
                <MainLayout>
                  <AutomationList />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default App;