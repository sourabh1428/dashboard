// App.jsx
import { Route, Routes, useLocation } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import AllCampaign from './Components/AllCampaign';
import Allusers from './Components/Allusers';
import UserActivity from './Components/UserActivity';
import Navbar from './Components/Navbar';
import SignUp from './Auth/SignUp';
import SignIn from './Auth/SignIn';
import Analytics from './Charts/Analytics';
import MultiStepForm from './Campaigns/CreateIt';
import SingleCampaign from './Campaigns/SingleCampaign';

const AppContent = () => {
  const location = useLocation();
  const showNavbar = !['/signin', '/signup'].includes(location.pathname);

  return (
    <div>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<AllCampaign />} />
        <Route path="/users" element={<Allusers />} />
        <Route path="/user/:id" element={<UserActivity />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/analytics" element={<Analytics/>} />
        <Route path="/createit" element={<MultiStepForm/>} />
        <Route path="/campaign/:cid" element={<SingleCampaign/>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <div>
      <AppContent />
    </div>
  );
}

export default App;
