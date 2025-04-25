import { Route, Routes, useLocation } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ErrorBoundary from './Components/ErrorBoundary';
import ProtectedRoute from './Components/ProtectedRoute';
import Navbar from './Components/Navbar';

// Lazy load components
const AllCampaign = lazy(() => import('./Components/AllCampaign'));
const Allusers = lazy(() => import('./Components/Allusers'));
const UserActivity = lazy(() => import('./Components/UserActivity'));
const SignUp = lazy(() => import('./Auth/SignUp'));
const SignIn = lazy(() => import('./Auth/SignIn'));
const Analytics = lazy(() => import('./Charts/Analytics'));
const MultiStepForm = lazy(() => import('./Campaigns/CreateOnsite'));
const SingleCampaign = lazy(() => import('./Campaigns/SingleCampaign'));
const EmailCampaign = lazy(() => import('./Components/Emails/EmailCampaign'));
const Home = lazy(() => import('./Components/Dashboard'));
const CreateEmail = lazy(() => import('./Components/Emails/CreateEmail'));
const Dashboard = lazy(() => import('./bdashboard/Bdashboard'));
const CreateWhatsapp = lazy(() => import('./Campaigns/CreateWhatsapp'));
const UserUpload = lazy(() => import('./Components/UserUpload/UserUpload'));
const Settings = lazy(() => import('./Components/Settings/Settings'));
const NotionReciept = lazy(() => import('./bdashboard/NotionReciept'));
const HTMLEditor = lazy(() => import('./Components/HTML/HTMLEditor'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  const location = useLocation();
  const showNavbar = !['/signin', '/signup', '/invoicing'].includes(location.pathname);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {showNavbar && <Navbar />}
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/allCampaign" element={
              <ProtectedRoute>
                <AllCampaign />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <Allusers />
              </ProtectedRoute>
            } />
            <Route path="/user/:id" element={
              <ProtectedRoute>
                <UserActivity />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/Createonsite" element={
              <ProtectedRoute>
                <MultiStepForm />
              </ProtectedRoute>
            } />
            <Route path="/campaign/:cid" element={
              <ProtectedRoute>
                <SingleCampaign />
              </ProtectedRoute>
            } />
            <Route path="/Createemail" element={
              <ProtectedRoute>
                <CreateEmail />
              </ProtectedRoute>
            } />
            <Route path="/EmailCampaign" element={
              <ProtectedRoute>
                <EmailCampaign />
              </ProtectedRoute>
            } />
            <Route path="/invoicing" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/createWhatsapp" element={
              <ProtectedRoute>
                <CreateWhatsapp />
              </ProtectedRoute>
            } />
            <Route path="/userUpload" element={
              <ProtectedRoute>
                <UserUpload />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/NotionReciept" element={
              <ProtectedRoute>
                <NotionReciept />
              </ProtectedRoute>
            } />
            <Route path="/htmlEditor" element={
              <ProtectedRoute>
                <HTMLEditor />
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