import { useState, useEffect, useRef } from 'react';
import api from '../../api/axiosConfig';
import { getImageUrl, handleImageError } from '../../utils/imageHelpers';
import { FaEdit, FaTrash, FaPlus, FaImage, FaTimes, FaUpload, FaSpinner, FaCheck, FaCloudUploadAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminPastEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
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
    is_past: 1,
    event_date: '',
    gallery_images: []
  });

  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    fetchPastEvents();
  }, []);

  const fetchPastEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/events?is_past=1');
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching past events:', error);
      toast.error('Failed to load past events');
    } finally {
      setLoading(false);
    }
  };

  const handleMainImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('image', files[0]);
    
    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });
      
      console.log('Upload response:', response.data);
      
      const imageUrl = response.data.url || response.data.image_url;
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGalleryUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('gallery', file);
    });
    
    try {
      const response = await api.post('/upload/gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });
      
      console.log('Gallery upload response:', response.data);
      
      const newImages = response.data.urls || [];
      const updatedGallery = [...galleryImages, ...newImages];
      setGalleryImages(updatedGallery);
      setFormData(prev => ({ ...prev, gallery_images: updatedGallery }));
      toast.success(`${newImages.length} images uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = '';
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleGalleryUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For past events, use event_date as start_date
    let startDate = formData.start_date;
    if (!startDate && formData.event_date) {
      startDate = `${formData.event_date}T00:00:00`;
    }
    
    const data = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      event_type: formData.event_type || 'one-off',
      start_date: startDate,
      end_date: formData.end_date || null,
      location: formData.location || null,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
      image_url: formData.image_url || null,
      gallery_images: formData.gallery_images || [],
      is_past: 1,
      event_date: formData.event_date || null
    };

    console.log('Submitting event data:', data);

    try {
      let response;
      if (editingEvent) {
        response = await api.put(`/events/${editingEvent.id}`, data);
        toast.success('Past event updated successfully');
      } else {
        response = await api.post('/events', data);
        toast.success('Past event created successfully');
      }
      
      console.log('Server response:', response.data);
      
      setShowModal(false);
      setEditingEvent(null);
      resetForm();
      fetchPastEvents();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.error || 'Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this past event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Past event deleted');
      fetchPastEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    const galleryImages = event.gallery_images || [];
    let startDate = '';
    if (event.start_date) {
      startDate = event.start_date.slice(0, 16);
    }
    setFormData({
      title: event.title,
      description: event.description || '',
      category: event.category,
      event_type: event.event_type,
      start_date: startDate,
      end_date: event.end_date?.slice(0, 16) || '',
      location: event.location || '',
      max_attendees: event.max_attendees || '',
      image_url: event.image_url || '',
      is_past: 1,
      event_date: event.event_date || '',
      gallery_images: galleryImages
    });
    setGalleryImages(galleryImages);
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
      is_past: 1,
      event_date: '',
      gallery_images: []
    });
    setGalleryImages([]);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleRemoveGalleryImage = (index) => {
    const updatedImages = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(updatedImages);
    setFormData({ ...formData, gallery_images: updatedImages });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading past events...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-heading font-semibold text-primary">
            Past Events Gallery
          </h3>
          <p className="text-sm text-neutral">Manage historical events and their photo galleries</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingEvent(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FaPlus /> <span>Add Past Event</span>
        </button>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FaImage className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral mb-2">No Past Events</h3>
          <p className="text-neutral">Start adding your past events with photos to build your gallery.</p>
          <button
            onClick={() => {
              resetForm();
              setEditingEvent(null);
              setShowModal(true);
            }}
            className="mt-4 btn-primary inline-flex items-center space-x-2"
          >
            <FaPlus /> <span>Add Your First Past Event</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={getImageUrl(event.image_url)} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
                <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Past Event
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-heading font-semibold text-primary mb-1">
                  {event.title}
                </h3>
                <p className="text-sm text-neutral mb-2 line-clamp-2">
                  {event.description}
                </p>
                <p className="text-xs text-neutral mb-3">
                  📅 {formatDate(event.start_date)}
                </p>
                
                {event.gallery_images && event.gallery_images.length > 0 && (
                  <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
                    {event.gallery_images.slice(0, 4).map((img, idx) => (
                      <img 
                        key={idx}
                        src={getImageUrl(img)}
                        alt={`Gallery ${idx + 1}`}
                        className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 hover:border-primary transition-colors"
                        onError={handleImageError}
                      />
                    ))}
                    {event.gallery_images.length > 4 && (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-semibold text-neutral">
                        +{event.gallery_images.length - 4}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="flex-1 text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded flex items-center justify-center gap-1 text-sm"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="flex-1 text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded flex items-center justify-center gap-1 text-sm"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-heading font-bold text-primary mb-6">
              {editingEvent ? 'Edit Past Event' : 'Add Past Event'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral mb-1">Event Title *</label>
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
                    placeholder="Describe the event..."
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
                    <label className="block text-sm font-semibold text-neutral mb-1">Event Date *</label>
                    <input
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-neutral mt-1">When did this event take place?</p>
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

                {/* Main Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-neutral mb-1">Main Image</label>
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
                      onChange={(e) => handleMainImageUpload(e.target.files)}
                      className="hidden"
                    />
                    {formData.image_url && (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <FaCheck /> Image uploaded
                      </span>
                    )}
                  </div>
                  {formData.image_url && (
                    <div className="mt-2">
                      <img 
                        src={getImageUrl(formData.image_url)}
                        alt="Preview" 
                        className="h-20 rounded-lg object-cover"
                        onError={handleImageError}
                      />
                    </div>
                  )}
                </div>

                {/* Gallery Images Upload */}
                <div>
                  <label className="block text-sm font-semibold text-neutral mb-1">
                    Gallery Images (Upload Multiple)
                  </label>
                  
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleGalleryUpload(e.target.files)}
                      className="hidden"
                      id="gallery-upload"
                    />
                    
                    <div className="flex flex-col items-center gap-3">
                      <FaCloudUploadAlt className="text-4xl text-gray-400" />
                      <div>
                        <p className="text-sm text-neutral">
                          Drag & drop images here, or{' '}
                          <label 
                            htmlFor="gallery-upload" 
                            className="text-primary font-semibold cursor-pointer hover:underline"
                          >
                            browse
                          </label>
                        </p>
                        <p className="text-xs text-neutral mt-1">
                          Supports: JPG, PNG, GIF, WebP (Max 5MB each)
                        </p>
                      </div>
                      
                      {uploading && (
                        <div className="w-full max-w-xs">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-neutral mt-1">
                            Uploading... {uploadProgress}%
                          </p>
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 flex items-center gap-2"
                        disabled={uploading}
                      >
                        <FaUpload /> Select Multiple Images
                      </button>
                    </div>
                  </div>
                  
                  {galleryImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-neutral mb-2">
                        {galleryImages.length} images uploaded
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {galleryImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={getImageUrl(img)}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
                              onError={handleImageError}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
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
                  {editingEvent ? 'Update Event' : 'Save Event'}
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

export default AdminPastEvents;
