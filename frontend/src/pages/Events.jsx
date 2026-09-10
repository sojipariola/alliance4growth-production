
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { getImageUrl, handleImageError } from '../utils/imageHelpers';
import { FaCalendar, FaMapMarker, FaUsers, FaExpand, FaImage } from 'react-icons/fa';
import ImageGallery from '../components/common/ImageGallery';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events?upcoming=true');
      console.log('📦 Events data:', response.data);
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getEventImages = (event) => {
    const images = [];
    if (event.image_url && event.image_url !== 'null' && event.image_url !== '') {
      images.push(event.image_url);
    }
    if (event.gallery_images && event.gallery_images.length > 0) {
      images.push(...event.gallery_images);
    }
    return images;
  };

  const getMainImage = (event) => {
    // Try image_url first
    if (event.image_url && event.image_url !== 'null' && event.image_url !== '') {
      return event.image_url;
    }
    // Try first gallery image
    if (event.gallery_images && event.gallery_images.length > 0) {
      return event.gallery_images[0];
    }
    return null;
  };

  const openGallery = (images, index = 0) => {
    if (!images || images.length === 0) return;
    setGalleryImages(images);
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    setGalleryImages([]);
    setGalleryIndex(0);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading events...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-heading font-bold text-primary text-center mb-8">
        Our Events
      </h1>
      
      {events.length === 0 ? (
        <p className="text-center text-neutral">No upcoming events. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const eventImages = getEventImages(event);
            const mainImage = getMainImage(event);
            const hasImages = eventImages.length > 0;
            
            return (
              <div 
                key={event.id} 
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div 
                  className="relative h-48 overflow-hidden cursor-pointer bg-gray-100"
                  onClick={() => hasImages && openGallery(eventImages, 0)}
                >
                  {mainImage ? (
                    <img 
                      src={getImageUrl(mainImage)} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        console.error('❌ Image failed to load:', mainImage);
                        handleImageError(e);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <FaImage className="text-5xl text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <FaExpand className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Upcoming
                  </div>
                  {hasImages && eventImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs">
                      {eventImages.length} photos
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-heading font-semibold text-primary mb-2 group-hover:text-accent transition-colors line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-neutral text-sm mb-4 line-clamp-2">
                    {event.description || 'No description available'}
                  </p>
                  <div className="text-sm text-neutral space-y-2">
                    <p className="flex items-center gap-2">
                      <FaCalendar className="text-primary" />
                      {formatDate(event.start_date)}
                    </p>
                    {event.location && (
                      <p className="flex items-center gap-2">
                        <FaMapMarker className="text-primary" />
                        {event.location}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <FaUsers className="text-primary" />
                      {event.registered_count || 0} registered
                    </p>
                  </div>
                  <Link
                    to={`/events/${event.id}`}
                    className="mt-4 block text-center bg-primary text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors font-semibold"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Gallery Lightbox */}
      <ImageGallery
        images={galleryImages}
        initialIndex={galleryIndex}
        isOpen={galleryOpen}
        onClose={closeGallery}
      />
    </div>
  );
};

export default Events;
