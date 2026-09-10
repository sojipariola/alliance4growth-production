import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { FaUsers, FaCalendarAlt, FaClipboardCheck, FaChartBar } from 'react-icons/fa';

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalEvents: 0,
    totalRegistrations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading statistics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral">Total Members</p>
              <p className="text-3xl font-heading font-bold text-primary">{stats.totalUsers}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg text-white">
              <FaUsers className="text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral">Pending Approvals</p>
              <p className="text-3xl font-heading font-bold text-yellow-600">{stats.pendingUsers}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg text-white">
              <FaClipboardCheck className="text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral">Total Events</p>
              <p className="text-3xl font-heading font-bold text-secondary">{stats.totalEvents}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg text-white">
              <FaCalendarAlt className="text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral">Registrations</p>
              <p className="text-3xl font-heading font-bold text-purple-600">{stats.totalRegistrations}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg text-white">
              <FaChartBar className="text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-heading font-semibold text-primary mb-4">
          Community Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-neutral">Approval Rate</p>
            <p className="text-2xl font-heading font-bold text-primary">
              {stats.totalUsers > 0 
                ? Math.round(((stats.totalUsers - stats.pendingUsers) / stats.totalUsers) * 100) 
                : 0}%
            </p>
            <p className="text-xs text-neutral mt-1">
              {stats.totalUsers - stats.pendingUsers} approved out of {stats.totalUsers} total
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-neutral">Average Registrations per Event</p>
            <p className="text-2xl font-heading font-bold text-primary">
              {stats.totalEvents > 0 
                ? Math.round(stats.totalRegistrations / stats.totalEvents) 
                : 0}
            </p>
            <p className="text-xs text-neutral mt-1">
              {stats.totalRegistrations} total registrations across {stats.totalEvents} events
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
