import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { FaCheck, FaTimes, FaEye, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminBankTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/donations?status=pending&payment_method=bank_transfer');
      setTransfers(response.data || []);
    } catch (error) {
      console.error('Error fetching bank transfers:', error);
      toast.error('Failed to load bank transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    if (!confirm('Confirm this bank transfer?')) return;
    try {
      await api.put(`/bank-transfer/confirm/${id}`);
      toast.success('Bank transfer confirmed');
      fetchTransfers();
    } catch (error) {
      toast.error('Failed to confirm transfer');
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject this bank transfer?')) return;
    try {
      await api.put(`/bank-transfer/reject/${id}`);
      toast.success('Bank transfer rejected');
      fetchTransfers();
    } catch (error) {
      toast.error('Failed to reject transfer');
    }
  };

  const handleViewDetails = (transfer) => {
    setSelectedTransfer(transfer);
    setShowDetails(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading bank transfers...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-heading font-semibold text-primary">
            Pending Bank Transfers
          </h3>
          <p className="text-sm text-neutral">
            Confirm or reject bank transfer donations
          </p>
        </div>
        <button
          onClick={fetchTransfers}
          className="bg-gray-200 text-neutral px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
        >
          <FaSpinner className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {transfers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-neutral">No pending bank transfers</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Donor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{formatDate(transfer.created_at)}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{transfer.donor_name}</p>
                      <p className="text-xs text-neutral">{transfer.donor_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">£{transfer.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-mono">{transfer.transaction_id}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(transfer)}
                        className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleConfirm(transfer.id)}
                        className="text-green-500 hover:text-green-700 p-1 hover:bg-green-50 rounded"
                        title="Confirm"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => handleReject(transfer.id)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                        title="Reject"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-heading font-bold text-primary mb-6">
              Bank Transfer Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral">Donor</p>
                <p className="font-semibold">{selectedTransfer.donor_name}</p>
              </div>
              
              <div>
                <p className="text-sm text-neutral">Email</p>
                <p className="font-semibold">{selectedTransfer.donor_email}</p>
              </div>
              
              {selectedTransfer.donor_phone && (
                <div>
                  <p className="text-sm text-neutral">Phone</p>
                  <p className="font-semibold">{selectedTransfer.donor_phone}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-neutral">Amount</p>
                <p className="text-2xl font-heading font-bold text-primary">
                  £{selectedTransfer.amount.toFixed(2)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-neutral">Reference</p>
                <p className="font-mono">{selectedTransfer.transaction_id}</p>
              </div>
              
              {selectedTransfer.message && (
                <div>
                  <p className="text-sm text-neutral">Message</p>
                  <p className="text-neutral p-3 bg-gray-50 rounded-lg">
                    {selectedTransfer.message}
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-neutral">Date</p>
                <p className="font-semibold">
                  {new Date(selectedTransfer.created_at).toLocaleString('en-GB')}
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleConfirm(selectedTransfer.id)}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <FaCheck /> Confirm
              </button>
              <button
                onClick={() => handleReject(selectedTransfer.id)}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <FaTimes /> Reject
              </button>
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

export default AdminBankTransfers;
