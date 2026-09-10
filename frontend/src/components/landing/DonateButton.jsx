import { useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import DonateModal from './DonateModal';
import BankTransferModal from '../payment/BankTransferModal';

const DonateButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [showBankTransfer, setShowBankTransfer] = useState(false);
  const [donationDetails, setDonationDetails] = useState({
    amount: 0,
    donor_name: '',
    donor_email: '',
    donor_phone: ''
  });

  const handleDonateClick = () => {
    setShowModal(true);
  };

  const handleBankTransferClick = (data) => {
    setDonationDetails({
      amount: data.amount || 0,
      donor_name: data.donor_name || '',
      donor_email: data.donor_email || '',
      donor_phone: data.donor_phone || ''
    });
    setShowModal(false);
    setShowBankTransfer(true);
  };

  return (
    <>
      <button
        onClick={handleDonateClick}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2 z-40 group"
      >
        <FaHeart className="text-xl group-hover:animate-pulse" />
        <span className="font-semibold">Donate</span>
      </button>

      <DonateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onBankTransfer={handleBankTransferClick}
      />

      <BankTransferModal
        isOpen={showBankTransfer}
        onClose={() => setShowBankTransfer(false)}
        amount={donationDetails.amount}
        donorName={donationDetails.donor_name}
        donorEmail={donationDetails.donor_email}
        donorPhone={donationDetails.donor_phone}
      />
    </>
  );
};

export default DonateButton;
