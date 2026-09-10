import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { getImageUrl, handleImageError } from '../utils/imageHelpers';
import { FaCalendar, FaMapMarker, FaUsers, FaArrowLeft, FaUserPlus, FaCheck, FaClock, FaPhone, FaEnvelope, FaHome } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    full_name: '',
    phone: '',
    address: '',
    emergency_contact: '',
    special_requirements: ''
  });

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
      
      // Pre-fill registration form with user data
      if (user) {
        setRegistrationData({
          full_name: `${user.first_name || ''} ${user.surname || ''}`.trim(),
          phone: user.phone || '',
          address: user.address || '',
          emergency_contact: '',
          special_requirements: ''
        });
      }
      
      // Check if user is registered (if logged in)
      if (isAuthenticated && user) {
        try {
          const regResponse = await api.get(`/registrations/check?eventId=${id}`);
          setIsRegistered(regResponse.data.isRegistered);
        } catch (error) {
          setIsRegistered(false);
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Event not found');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to register for this event');
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      const data = {
        eventId: id,
        ...registrationData
      };
      
      await api.post('/registrations', data);
      toast.success('Successfully registered for this event!');
      setIsRegistered(true);
      setShowRegistrationForm(false);
      fetchEventDetails(); // Refresh event data
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!confirm('Are you sure you want to cancel your registration?')) return;
    
    setRegistering(true);
    try {
      await api.delete(`/registrations/${id}`);
      toast.success('Registration cancelled');
      setIsRegistered(false);
      fetchEventDetails(); // Refresh event data
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel registration');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-xl text-neutral">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-heading font-bold text-primary">Event not found</h2>
        <Link to="/events" className="text-accent hover:underline mt-4 inline-block">
          Back to Events
        </Link>
      </div>
    );
  }

  const isPast = new Date(event.start_date) < new Date();

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/events" className="inline-flex items-center text-primary hover:text-accent transition-colors mb-6">
        <FaArrowLeft className="mr-2" /> Back to Events
      </Link>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Event Image */}
        <div className="relative h-96 overflow-hidden">
          <img 
            src={getImageUrl(event.image_url)} 
            alt={event.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          {isPast && (
            <div className="absolute top-4 right-4 bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
              Past Event
            </div>
          )}
        </div>

        <div className="p-8">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-2">
                {event.title}
              </h1>
              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                {event.category}
              </span>
              {event.event_type && (
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold ml-2">
                  {event.event_type}
                </span>
              )}
            </div>
            
            {!isPast && (
              <div className="flex-shrink-0">
                {isRegistered ? (
                  <button
                    onClick={handleCancelRegistration}
                    disabled={registering}
                    className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <FaCheck /> {registering ? 'Processing...' : 'Registered ✓'}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowRegistrationForm(true)}
                    disabled={registering}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
                  >
                    <FaUserPlus /> Register Now
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FaCalendar className="text-primary text-xl mt-1" />
                <div>
                  <p className="font-semibold">Date & Time</p>
                  <p className="text-neutral">{formatDate(event.start_date)}</p>
                  {event.end_date && (
                    <p className="text-neutral text-sm">to {formatDate(event.end_date)}</p>
                  )}
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-3">
                  <FaMapMarker className="text-primary text-xl mt-1" />
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-neutral">{event.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <FaUsers className="text-primary text-xl mt-1" />
                <div>
                  <p className="font-semibold">Capacity</p>
                  <p className="text-neutral">
                    {event.registered_count || 0} registered
                    {event.max_attendees ? ` / ${event.max_attendees} max` : ''}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-primary mb-2">About this event</p>
                <p className="text-neutral leading-relaxed">
                  {event.description || 'No description available.'}
                </p>
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          {event.gallery_images && event.gallery_images.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-heading font-semibold text-primary mb-4">
                Event Gallery
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {event.gallery_images.map((img, index) => (
                  <img 
                    key={index}
                    src={getImageUrl(img)}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                    onError={handleImageError}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Registration Info */}
          {!isPast && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <FaClock className="inline mr-2" />
                {isRegistered 
                  ? 'You are registered for this event! Check your email for details.'
                  : 'Register now to secure your spot at this event.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && !isRegistered && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-heading font-bold text-primary mb-6">
              Register for {event.title}
            </h2>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={registrationData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={registrationData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">
                  Address
                </label>
                <div className="relative">
                  <FaHome className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    name="address"
                    value={registrationData.address}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  name="emergency_contact"
                  value={registrationData.emergency_contact}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Name and phone number of emergency contact"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">
                  Special Requirements
                </label>
                <textarea
                  name="special_requirements"
                  value={registrationData.special_requirements}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Any special requirements (dietary, accessibility, etc.)"
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  disabled={registering}
                  className="btn-primary flex-1"
                >
                  {registering ? 'Registering...' : 'Confirm Registration'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegistrationForm(false)}
                  className="flex-1 bg-gray-200 text-neutral py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
