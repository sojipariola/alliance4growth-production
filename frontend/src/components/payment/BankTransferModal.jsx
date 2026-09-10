import { useState, useEffect } from 'react';
import { FaTimes, FaCopy, FaCheck, FaSpinner, FaHeart } from 'react-icons/fa';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const BankTransferModal = ({ isOpen, onClose, amount, donorName, donorEmail, donorPhone }) => {
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedFields, setCopiedFields] = useState({});
  const [formData, setFormData] = useState({
    amount: amount || '',
    donor_name: donorName || '',
    donor_email: donorEmail || '',
    donor_phone: donorPhone || '',
    message: '',
    reference: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchBankDetails();
      setFormData(prev => ({
        ...prev,
        amount: amount || prev.amount,
        donor_name: donorName || prev.donor_name,
        donor_email: donorEmail || prev.donor_email,
        donor_phone: donorPhone || prev.donor_phone
      }));
    }
  }, [isOpen, amount, donorName, donorEmail, donorPhone]);

  const fetchBankDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bank-transfer/details');
      setBankDetails(response.data);
      setFormData(prev => ({
        ...prev,
        reference: response.data.reference
      }));
    } catch (error) {
      console.error('Error fetching bank details:', error);
      toast.error('Failed to load bank details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedFields(prev => ({ ...prev, [field]: true }));
      toast.success(`${field} copied to clipboard!`);
      setTimeout(() => {
        setCopiedFields(prev => ({ ...prev, [field]: false }));
      }, 3000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const donationData = {
        amount: parseFloat(formData.amount),
        donor_name: formData.donor_name,
        donor_email: formData.donor_email,
        donor_phone: formData.donor_phone || null,
        message: formData.message || null,
        reference: formData.reference
      };

      const response = await api.post('/bank-transfer/record', donationData);
      
      toast.success('Donation recorded! Please send the bank transfer.');
      console.log('Donation recorded:', response.data);
      
      setTimeout(() => {
        onClose();
        setSubmitting(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error recording donation:', error);
      toast.error(error.response?.data?.error || 'Failed to record donation');
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-70 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        <div className="inline-block w-full max-w-3xl overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-2xl">
          <div className="relative p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <FaHeart className="text-2xl" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-primary">Bank Transfer</h2>
              <p className="text-neutral mt-2">
                Transfer your donation directly to our bank account.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <FaSpinner className="animate-spin text-3xl text-primary" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bank Details */}
                {bankDetails && (
                  <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                    <h3 className="font-semibold text-primary text-lg mb-3">Bank Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-neutral">Bank Name</label>
                        <p className="font-medium">{bankDetails.bankName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-neutral">Account Name</label>
                        <p className="font-medium">{bankDetails.accountName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-neutral">Account Number</label>
                        <p className="font-medium flex items-center gap-2">
                          {bankDetails.accountNumber}
                          <button
                            type="button"
                            onClick={() => copyToClipboard(bankDetails.accountNumber, 'Account Number')}
                            className="text-accent hover:text-primary"
                          >
                            {copiedFields['Account Number'] ? <FaCheck className="text-green-500" /> : <FaCopy />}
                          </button>
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-neutral">Sort Code</label>
                        <p className="font-medium flex items-center gap-2">
                          {bankDetails.sortCode}
                          <button
                            type="button"
                            onClick={() => copyToClipboard(bankDetails.sortCode, 'Sort Code')}
                            className="text-accent hover:text-primary"
                          >
                            {copiedFields['Sort Code'] ? <FaCheck className="text-green-500" /> : <FaCopy />}
                          </button>
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-neutral">Reference</label>
                        <p className="font-medium flex items-center gap-2">
                          <span className="text-primary font-bold">{bankDetails.reference}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(bankDetails.reference, 'Reference')}
                            className="text-accent hover:text-primary"
                          >
                            {copiedFields['Reference'] ? <FaCheck className="text-green-500" /> : <FaCopy />}
                          </button>
                        </p>
                        <p className="text-xs text-neutral mt-1">
                          Use this reference when making the transfer
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">{bankDetails.instructions}</p>
                    </div>
                  </div>
                )}

                {/* Donation Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-1">
                      Donation Amount *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      min="1"
                      step="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter amount"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="donor_name"
                        value={formData.donor_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="donor_email"
                        value={formData.donor_email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="donor_phone"
                      value={formData.donor_phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="+44 1234 567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-1">
                      Message (optional)
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Leave a message of support..."
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Important:</strong> After submitting, please complete the bank transfer using the details above. 
                    Your donation will be confirmed manually by our team.
                  </p>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <><FaSpinner className="animate-spin" /> Processing...</> : 'Submit Donation'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-200 text-neutral py-3 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankTransferModal;
