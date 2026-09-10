import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { 
  FaUsers, 
  FaUserClock, 
  FaCalendarCheck, 
  FaChartLine, 
  FaHistory, 
  FaCalendarPlus,
  FaHeart,
  FaClipboardList
} from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalEvents: 0,
    totalRegistrations: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/events?upcoming=true&limit=5')
      ]);
      setStats(statsRes.data);
      setRecentEvents(eventsRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToTab = (tab) => {
    navigate('/admin', { state: { activeTab: tab } });
  };

  const statCards = [
    { icon: FaUsers, label: 'Total Members', value: stats.totalUsers, color: 'bg-blue-500' },
    { icon: FaUserClock, label: 'Pending Approvals', value: stats.pendingUsers, color: 'bg-yellow-500' },
    { icon: FaCalendarCheck, label: 'Total Events', value: stats.totalEvents, color: 'bg-green-500' },
    { icon: FaChartLine, label: 'Registrations', value: stats.totalRegistrations, color: 'bg-purple-500' },
  ];

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral">{card.label}</p>
                  <p className="text-3xl font-heading font-bold text-primary">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg text-white`}>
                  <Icon className="text-xl" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-heading font-semibold text-primary mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => navigateToTab('events')}
              className="bg-primary text-white px-4 py-3 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
            >
              <FaCalendarPlus /> Create Event
            </button>
            <button
              onClick={() => navigateToTab('pastevents')}
              className="bg-secondary text-white px-4 py-3 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
            >
              <FaHistory /> Add Past Event
            </button>
            <button
              onClick={() => navigateToTab('users')}
              className="bg-accent text-white px-4 py-3 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
            >
              <FaUsers /> Review Users
            </button>
            <button
              onClick={() => navigateToTab('donations')}
              className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
            >
              <FaHeart /> View Donations
            </button>
            <button
              onClick={() => navigateToTab('stats')}
              className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
            >
              <FaChartLine /> View Stats
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-heading font-semibold text-primary">
              Recent Events
            </h3>
            <button
              onClick={() => navigateToTab('events')}
              className="text-sm text-accent hover:text-primary transition-colors"
            >
              View All →
            </button>
          </div>
          {recentEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral">No upcoming events</p>
              <button
                onClick={() => navigateToTab('events')}
                className="mt-2 text-primary hover:underline text-sm"
              >
                Create your first event →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <div>
                    <p className="font-semibold text-sm">{event.title}</p>
                    <p className="text-xs text-neutral">
                      {new Date(event.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {event.registered_count || 0} registered
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <p className="text-sm text-neutral">Pending Approvals</p>
          <p className="text-2xl font-heading font-bold text-primary">{stats.pendingUsers}</p>
          <button
            onClick={() => navigateToTab('users')}
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            Review now →
          </button>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
          <p className="text-sm text-neutral">Upcoming Events</p>
          <p className="text-2xl font-heading font-bold text-primary">{stats.totalEvents}</p>
          <button
            onClick={() => navigateToTab('events')}
            className="text-xs text-green-600 hover:underline mt-1"
          >
            Manage events →
          </button>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
          <p className="text-sm text-neutral">Total Donations</p>
          <p className="text-2xl font-heading font-bold text-red-600">
            £{stats.totalDonations || 0}
          </p>
          <button
            onClick={() => navigateToTab('donations')}
            className="text-xs text-red-600 hover:underline mt-1"
          >
            View donations →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
