import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { FaCheck, FaTimes, FaUserCheck, FaUserClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        api.get('/admin/users/pending'),
        api.get('/admin/users/all')
      ]);
      setPendingUsers(pendingRes.data);
      setApprovedUsers(approvedRes.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/approve`);
      toast.success('User approved successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    if (!confirm('Are you sure you want to reject this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}/reject`);
      toast.success('User rejected');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to reject user');
    }
  };

  const renderUserList = (users, showActions = false) => {
    if (users.length === 0) {
      return (
        <div className="text-center py-8 text-neutral">
          <FaUserCheck className="text-4xl text-gray-300 mx-auto mb-2" />
          <p>No users found</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Joined</th>
              {showActions && <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{user.first_name} {user.surname}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.phone || '—'}</td>
                <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                {showActions && (
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="text-green-500 hover:text-green-700 p-1 hover:bg-green-50 rounded"
                        title="Approve user"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                        title="Reject user"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-12">Loading users...</div>;
  }

  return (
    <div>
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-neutral hover:bg-gray-300'
          }`}
        >
          <FaUserClock /> Pending ({pendingUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === 'approved'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-neutral hover:bg-gray-300'
          }`}
        >
          <FaUserCheck /> Approved ({approvedUsers.length})
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {activeTab === 'pending' 
          ? renderUserList(pendingUsers, true)
          : renderUserList(approvedUsers, false)
        }
      </div>
    </div>
  );
};

export default AdminUsers;
