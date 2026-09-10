import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { getImageUrl, handleImageError } from '../utils/imageHelpers';
import { FaCalendar, FaMapMarker, FaUsers, FaHeart, FaHands, FaLeaf, FaExpand, FaImage } from 'react-icons/fa';
import ImageGallery from '../components/common/ImageGallery';
import HeroCarousel from '../components/landing/HeroCarousel';
import DonateButton from '../components/landing/DonateButton';

const Home = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const [upcomingRes, pastRes] = await Promise.all([
        api.get('/events?upcoming=true&limit=3'),
        api.get('/events?is_past=1&limit=6')
      ]);
      console.log('📦 Upcoming events:', upcomingRes.data);
      console.log('📦 Past events:', pastRes.data);
      setUpcomingEvents(upcomingRes.data || []);
      setPastEvents(pastRes.data || []);
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
    if (event.image_url && event.image_url !== 'null' && event.image_url !== '') {
      return event.image_url;
    }
    if (event.gallery_images && event.gallery_images.length > 0) {
      return event.gallery_images[0];
    }
    return null;
  };

  const testimonials = [
    {
      id: 1,
      name: "Jasper O.",
      role: "Member",
      content: "A4G has been a lifeline for me. The support and community I've found here is incredible.",
      rating: 5
    },
    {
      id: 2,
      name: "Soji O.",
      role: "Volunteer",
      content: "Volunteering with A4G has been one of the most rewarding experiences of my life.",
      rating: 5
    },
    {
      id: 3,
      name: "David R.",
      role: "Member",
      content: "The men's wellness group has helped me connect with others and improve my mental health.",
      rating: 5
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-xl text-neutral">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section with Carousel */}
      <HeroCarousel />

      {/* Mission & Vision Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-heading font-bold text-primary text-center mb-12">
              About Alliance4Growth Forth Valley
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-2xl font-heading font-semibold text-primary mb-3">
                  Our Mission
                </h3>
                <p className="text-neutral leading-relaxed">
                  Alliance4Growth Forth Valley is a community interest organisation 
                  dedicated to supporting family and men's wellness in the Forth Valley region. 
                  We believe in building stronger communities through connection, support, and growth.
                </p>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">🌟</div>
                <h3 className="text-2xl font-heading font-semibold text-primary mb-3">
                  Our Vision
                </h3>
                <p className="text-neutral leading-relaxed">
                  To create a supportive network where every individual and family in Forth Valley 
                  has access to wellness resources, community connection, and opportunities for 
                  personal growth.
                </p>
              </div>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center transform hover:scale-105 transition-transform duration-300">
                <div className="text-4xl text-primary mb-3 flex justify-center">
                  <FaHands />
                </div>
                <h4 className="text-lg font-heading font-semibold text-primary">Community</h4>
                <p className="text-sm text-neutral">Building connections that matter</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center transform hover:scale-105 transition-transform duration-300">
                <div className="text-4xl text-secondary mb-3 flex justify-center">
                  <FaHeart />
                </div>
                <h4 className="text-lg font-heading font-semibold text-secondary">Wellness</h4>
                <p className="text-sm text-neutral">Supporting mental and physical health</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl text-center transform hover:scale-105 transition-transform duration-300">
                <div className="text-4xl text-accent mb-3 flex justify-center">
                  <FaLeaf />
                </div>
                <h4 className="text-lg font-heading font-semibold text-accent">Growth</h4>
                <p className="text-sm text-neutral">Empowering individuals to reach their potential</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Past Events Gallery Section */}
      {pastEvents.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-heading font-bold text-primary text-center mb-12">
              Past Events Gallery
            </h2>
            <p className="text-center text-neutral mb-8 max-w-2xl mx-auto">
              Click on any image to view the full gallery
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => {
                const eventImages = getEventImages(event);
                const mainImage = getMainImage(event);
                const hasImages = eventImages.length > 0;
                
                return (
                  <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 group">
                    <div 
                      className="relative h-64 overflow-hidden cursor-pointer bg-gray-100"
                      onClick={() => hasImages && openGallery(eventImages, 0)}
                    >
                      {mainImage ? (
                        <img 
                          src={getImageUrl(mainImage)} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            console.error('❌ Main image failed to load:', mainImage);
                            handleImageError(e);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <FaImage className="text-6xl text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <FaExpand className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Past Event
                      </div>
                      {hasImages && eventImages.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs">
                          {eventImages.length} photos
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-heading font-semibold text-primary mb-2 line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-neutral text-sm mb-3 line-clamp-2">
                        {event.description || 'No description available'}
                      </p>
                      <p className="text-sm text-neutral mb-3">
                        <FaCalendar className="inline mr-2 text-primary" />
                        {formatDate(event.start_date)}
                      </p>
                      
                      {event.gallery_images && event.gallery_images.length > 0 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                          {event.gallery_images.slice(0, 4).map((img, idx) => (
                            <img 
                              key={idx}
                              src={getImageUrl(img)}
                              alt={`Gallery ${idx + 1}`}
                              className="w-16 h-16 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer border-2 border-gray-200 hover:border-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                const allImages = getEventImages(event);
                                const index = allImages.indexOf(img);
                                openGallery(allImages, index >= 0 ? index : 0);
                              }}
                              onError={(e) => {
                                console.error('❌ Gallery image failed to load:', img);
                                handleImageError(e);
                              }}
                            />
                          ))}
                          {event.gallery_images.length > 4 && (
                            <div 
                              className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-semibold text-neutral cursor-pointer hover:bg-gray-300 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                const allImages = getEventImages(event);
                                openGallery(allImages, 4);
                              }}
                            >
                              +{event.gallery_images.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-heading font-bold text-primary">
                  Upcoming Events
                </h2>
                <p className="text-neutral mt-2">Click on any image to view the gallery</p>
              </div>
              <Link
                to="/events"
                className="text-accent hover:text-primary transition-colors font-semibold flex items-center gap-2"
              >
                View All →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => {
                const eventImages = getEventImages(event);
                const mainImage = getMainImage(event);
                const hasImages = eventImages.length > 0;
                
                return (
                  <div 
                    key={event.id} 
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                  >
                    <div 
                      className="relative h-64 overflow-hidden cursor-pointer bg-gray-100"
                      onClick={() => hasImages && openGallery(eventImages, 0)}
                    >
                      {mainImage ? (
                        <img 
                          src={getImageUrl(mainImage)} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            console.error('❌ Main image failed to load:', mainImage);
                            handleImageError(e);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <FaImage className="text-6xl text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <FaExpand className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Upcoming
                      </div>
                      {hasImages && eventImages.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs">
                          {eventImages.length} photos
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">
                          {event.category || 'Event'}
                        </span>
                        <span className="text-sm text-neutral flex items-center gap-1">
                          <FaUsers className="text-primary" />
                          {event.registered_count || 0}/{event.max_attendees || '∞'}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-heading font-semibold text-primary mb-2 group-hover:text-accent transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      
                      <p className="text-neutral text-sm mb-4 line-clamp-2">
                        {event.description || 'No description available'}
                      </p>
                      
                      <div className="space-y-2 text-sm text-neutral mb-4">
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
                      </div>
                      
                      <Link
                        to={`/events/${event.id}`}
                        className="block text-center bg-primary text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors font-semibold"
                      >
                        Register Now →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading font-bold text-primary text-center mb-12">
            What Our Community Says
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-yellow-400 text-xl mb-3">
                  {'★'.repeat(testimonial.rating)}
                </div>
                <p className="text-neutral leading-relaxed mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-heading font-semibold text-primary">{testimonial.name}</p>
                  <p className="text-sm text-neutral">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold mb-4">
            Stay Connected
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-8 opacity-90">
            Subscribe to our newsletter for updates on events, wellness resources, 
            and community news.
          </p>
          
          <form 
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const email = e.target.elements.email.value;
              if (email) {
                alert(`Thank you for subscribing with: ${email}`);
                e.target.reset();
              }
            }}
          >
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-neutral focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <button
              type="submit"
              className="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Donate Button - Fixed floating button */}
      <DonateButton />

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

export default Home;
