import { useState, useEffect } from 'react';
import { FaTimes, FaHeart, FaSpinner, FaUniversity } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const DonateModal = ({ isOpen, onClose, onBankTransfer }) => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState('');
  const [formData, setFormData] = useState({
    donor_name: '',
    donor_email: '',
    donor_phone: '',
    message: '',
    anonymous: false
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        donor_name: `${user.first_name} ${user.surname}`,
        donor_email: user.email || '',
        donor_phone: user.phone || ''
      }));
    }
  }, [isAuthenticated, user]);

  const presetAmounts = [10, 20, 50, 100];

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelectedAmount(0);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getAmount = () => {
    return customAmount ? parseFloat(customAmount) : selectedAmount;
  };

  const handleBankTransfer = () => {
    const amount = getAmount();
    if (!amount || amount <= 0) {
      toast.error('Please select or enter a valid donation amount');
      return;
    }
    if (!formData.donor_name || formData.donor_name.trim().length < 2) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.donor_email || !formData.donor_email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Pass data to parent for bank transfer
    onBankTransfer({
      amount: amount,
      donor_name: formData.donor_name,
      donor_email: formData.donor_email,
      donor_phone: formData.donor_phone,
      message: formData.message,
      anonymous: formData.anonymous
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-70 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        <div className="inline-block w-full max-w-2xl overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-2xl">
          <div className="relative p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                <FaHeart className="text-2xl" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-primary">Support A4G</h2>
              <p className="text-neutral mt-2">
                Your donation helps us continue our vital work in the community.
              </p>
            </div>

            <div className="space-y-6">
              {/* Amount Selection */}
              <div>
                <label className="block text-sm font-semibold text-neutral mb-3">
                  Choose Amount
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {presetAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleAmountSelect(amount)}
                      className={`py-3 rounded-lg font-semibold transition-all ${
                        selectedAmount === amount && !customAmount
                          ? 'bg-primary text-white shadow-lg transform scale-105'
                          : 'bg-gray-100 text-neutral hover:bg-gray-200'
                      }`}
                    >
                      £{amount}
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <input
                    type="number"
                    placeholder="Custom amount (£)"
                    value={customAmount}
                    onChange={handleCustomAmount}
                    min="1"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Donor Details */}
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
                  Phone Number (optional)
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="anonymous"
                  checked={formData.anonymous}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label className="ml-2 text-sm text-neutral">
                  Donate anonymously
                </label>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleBankTransfer}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <FaUniversity /> Donate via Bank Transfer
                </button>

                <p className="text-xs text-neutral text-center">
                  🔒 Your information is safe and secure. We will contact you to confirm your donation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonateModal;
