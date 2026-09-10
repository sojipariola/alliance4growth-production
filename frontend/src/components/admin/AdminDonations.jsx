import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { FaSync, FaTrash, FaEye, FaCheck, FaTimes, FaDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchDonations();
    fetchStats();
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/donations');
      setDonations(response.data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/donations/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching donation stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this donation?')) return;
    try {
      await api.delete(`/donations/${id}`);
      toast.success('Donation deleted');
      fetchDonations();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete donation');
    }
  };

  const handleViewDetails = (donation) => {
    setSelectedDonation(donation);
    setShowDetails(true);
  };

  const handleExportCSV = () => {
    if (donations.length === 0) {
      toast.error('No donations to export');
      return;
    }

    // Create CSV headers
    const headers = ['Date', 'Donor', 'Email', 'Amount', 'Currency', 'Status', 'Transaction ID'];
    
    // Create CSV rows
    const rows = donations.map(d => [
      new Date(d.created_at).toLocaleDateString(),
      d.anonymous ? 'Anonymous' : d.donor_name,
      d.anonymous ? 'Hidden' : d.donor_email,
      d.amount,
      d.currency || 'GBP',
      d.status,
      d.transaction_id || 'N/A'
    ]);

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Donations exported successfully');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading donations...</div>;
  }

  return (
    <div>
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-neutral">Total Donations</p>
            <p className="text-2xl font-heading font-bold text-primary">{stats.total_donations}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-neutral">Total Amount</p>
            <p className="text-2xl font-heading font-bold text-green-600">
              £{stats.total_amount?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-neutral">This Month</p>
            <p className="text-2xl font-heading font-bold text-primary">
              £{stats.monthly_amount?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-neutral">Pending</p>
            <p className="text-2xl font-heading font-bold text-yellow-600">{stats.pending_count}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-heading font-semibold text-primary">
          Donations History
        </h3>
        <div className="flex gap-2">
          <button
            onClick={fetchDonations}
            className="bg-gray-200 text-neutral px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <FaSync className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
          >
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {donations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral">No donations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Donor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{formatDate(donation.created_at)}</td>
                    <td className="px-6 py-4">
                      {donation.anonymous ? (
                        <span className="text-neutral">Anonymous</span>
                      ) : (
                        <div>
                          <p className="font-medium">{donation.donor_name}</p>
                          <p className="text-xs text-neutral">{donation.donor_email}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      £{donation.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        donation.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : donation.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(donation)}
                          className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDelete(donation.id)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Donation Details Modal */}
      {showDetails && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-heading font-bold text-primary mb-6">
              Donation Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral">Donor</p>
                <p className="font-semibold">
                  {selectedDonation.anonymous ? 'Anonymous' : selectedDonation.donor_name}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-neutral">Email</p>
                <p className="font-semibold">
                  {selectedDonation.anonymous ? 'Hidden' : selectedDonation.donor_email}
                </p>
              </div>
              
              {selectedDonation.donor_phone && (
                <div>
                  <p className="text-sm text-neutral">Phone</p>
                  <p className="font-semibold">{selectedDonation.donor_phone}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-neutral">Amount</p>
                <p className="text-2xl font-heading font-bold text-primary">
                  £{selectedDonation.amount.toFixed(2)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-neutral">Status</p>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedDonation.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : selectedDonation.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedDonation.status}
                </span>
              </div>
              
              {selectedDonation.message && (
                <div>
                  <p className="text-sm text-neutral">Message</p>
                  <p className="text-neutral p-3 bg-gray-50 rounded-lg">
                    {selectedDonation.message}
                  </p>
                </div>
              )}
              
              {selectedDonation.transaction_id && (
                <div>
                  <p className="text-sm text-neutral">Transaction ID</p>
                  <p className="font-mono text-sm">{selectedDonation.transaction_id}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-neutral">Date</p>
                <p className="font-semibold">
                  {new Date(selectedDonation.created_at).toLocaleString('en-GB')}
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 bg-gray-200 text-neutral py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDonations;
