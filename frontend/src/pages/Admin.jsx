import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminUsers from '../components/admin/AdminUsers';
import AdminEvents from '../components/admin/AdminEvents';
import AdminPastEvents from '../components/admin/AdminPastEvents';
import AdminHeroImages from '../components/admin/AdminHeroImages';
import AdminDonations from '../components/admin/AdminDonations';
import AdminBankTransfers from '../components/admin/AdminBankTransfers';
import AdminStats from '../components/admin/AdminStats';
import Sidebar from '../components/admin/Sidebar';

const Admin = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const initialTab = location.state?.activeTab || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary">
            Admin Dashboard
          </h1>
          <p className="text-neutral">Welcome back, {user?.first_name}!</p>
        </div>
        
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'events' && <AdminEvents />}
        {activeTab === 'pastevents' && <AdminPastEvents />}
        {activeTab === 'heroimages' && <AdminHeroImages />}
        {activeTab === 'donations' && <AdminDonations />}
        {activeTab === 'banktransfers' && <AdminBankTransfers />}
        {activeTab === 'stats' && <AdminStats />}
      </div>
    </div>
  );
};

export default Admin;
