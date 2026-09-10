import { useState, useEffect, useRef } from 'react';
import api from '../../api/axiosConfig';
import { getImageUrl } from '../../utils/imageHelpers';
import { FaEdit, FaTrash, FaPlus, FaCalendarAlt, FaUpload, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Family',
    event_type: 'one-off',
    start_date: '',
    end_date: '',
    location: '',
    max_attendees: '',
    image_url: '',
    is_past: 0
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/events?upcoming=true');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      toast.error('Failed to load upcoming events');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('image', files[0]);
    
    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setFormData(prev => ({ ...prev, image_url: response.data.url }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        max_attendees: parseInt(formData.max_attendees) || null,
        is_past: 0
      };

      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, data);
        toast.success('Event updated successfully');
      } else {
        await api.post('/events', data);
        toast.success('Event created successfully');
      }
      
      setShowModal(false);
      setEditingEvent(null);
      resetForm();
      fetchUpcomingEvents();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      fetchUpcomingEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      category: event.category,
      event_type: event.event_type,
      start_date: event.start_date?.slice(0, 16) || '',
      end_date: event.end_date?.slice(0, 16) || '',
      location: event.location || '',
      max_attendees: event.max_attendees || '',
      image_url: event.image_url || '',
      is_past: 0
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Family',
      event_type: 'one-off',
      start_date: '',
      end_date: '',
      location: '',
      max_attendees: '',
      image_url: '',
      is_past: 0
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading upcoming events...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-heading font-semibold text-primary">
            Upcoming Events
          </h3>
          <p className="text-sm text-neutral">Manage events that are coming up</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingEvent(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FaPlus /> <span>Create Event</span>
        </button>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral mb-2">No Upcoming Events</h3>
          <p className="text-neutral">Create your first upcoming event to get started.</p>
          <button
            onClick={() => {
              resetForm();
              setEditingEvent(null);
              setShowModal(true);
            }}
            className="mt-4 btn-primary inline-flex items-center space-x-2"
          >
            <FaPlus /> <span>Create Event</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Registrations</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {event.image_url && (
                        <img 
                          src={getImageUrl(event.image_url)} 
                          alt="" 
                          className="w-10 h-10 rounded object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <span className="font-medium">{event.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      {event.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{formatDate(event.start_date)}</td>
                  <td className="px-6 py-4 text-sm">{event.registered_count || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-heading font-bold text-primary mb-6">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Family">Family</option>
                      <option value="Men's Wellness">Men's Wellness</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Social">Social</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-1">Event Type *</label>
                    <select
                      value={formData.event_type}
                      onChange={(e) => setFormData({...formData, event_type: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="one-off">One-off</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="bimonthly">Bimonthly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-1">Start Date *</label>
                    <input
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-1">End Date</label>
                    <input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral mb-1">Max Attendees</label>
                  <input
                    type="number"
                    value={formData.max_attendees}
                    onChange={(e) => setFormData({...formData, max_attendees: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral mb-1">Image</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90 flex items-center gap-2"
                      disabled={uploading}
                    >
                      {uploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                      Upload Image
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                    />
                    {formData.image_url && (
                      <span className="text-sm text-green-600">✓ Image uploaded</span>
                    )}
                  </div>
                  {formData.image_url && (
                    <div className="mt-2">
                      <img 
                        src={getImageUrl(formData.image_url)} 
                        alt="Preview" 
                        className="h-20 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/event-default.svg';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={uploading}
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
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

export default AdminEvents;
