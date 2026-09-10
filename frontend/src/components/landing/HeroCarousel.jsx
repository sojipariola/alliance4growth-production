import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { getImageUrl } from '../../utils/imageHelpers';

// HeroCarousel component displays a carousel of hero images with titles, subtitles, and navigation controls. It fetches active hero images from the API and falls back to default images if none are available. The carousel auto-slides every 5 seconds and allows manual navigation through arrows and dots.

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch hero images from API
  useEffect(() => {
    fetchHeroImages();
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (heroImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  const fetchHeroImages = async () => {
    try {
      console.log('🔄 Fetching active hero images...');
      
      // Use the active endpoint which returns only active images
      const response = await api.get('/content/hero/active');
      console.log('📦 Active hero images response:', response.data);
      
      if (response.data && response.data.length > 0) {
        setHeroImages(response.data);
      } else {
        // Use default images if none are active
        console.log('⚠️ No active hero images, using defaults');
        setHeroImages([
          { 
            id: 'default1',
            url: '/images/hero1.jpg', 
            title: 'Community Wellness', 
            subtitle: 'Supporting families and individuals' 
          },
          { 
            id: 'default2',
            url: '/images/hero2.jpg', 
            title: "Men's Health Matters", 
            subtitle: 'Building stronger communities' 
          },
          { 
            id: 'default3',
            url: '/images/hero3.jpg', 
            title: 'Family Togetherness', 
            subtitle: 'Creating connections that last' 
          }
        ]);
      }
    } catch (error) {
      console.error('❌ Error fetching hero images:', error);
      // Fallback to default images
      setHeroImages([
        { 
          id: 'default1',
          url: '/images/hero1.jpg', 
          title: 'Community Wellness', 
          subtitle: 'Supporting families and individuals' 
        },
        { 
          id: 'default2',
          url: '/images/hero2.jpg', 
          title: "Men's Health Matters", 
          subtitle: 'Building stronger communities' 
        },
        { 
          id: 'default3',
          url: '/images/hero3.jpg', 
          title: 'Family Togetherness', 
          subtitle: 'Creating connections that last' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Manually go to next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  // Manually go to previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  if (loading) {
    return (
      <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-pulse">
            <div className="h-16 w-64 bg-white/20 rounded-lg mx-auto mb-6"></div>
            <div className="h-8 w-96 bg-white/20 rounded-lg mx-auto mb-8"></div>
            <div className="flex justify-center gap-4">
              <div className="h-12 w-32 bg-white/20 rounded-lg"></div>
              <div className="h-12 w-32 bg-white/20 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!heroImages || heroImages.length === 0) {
    return null;
  }

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden">
      {/* Background Images with Smooth Transition */}
      {heroImages.map((image, index) => (
        <div
          key={image.id || index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ zIndex: index === currentSlide ? 5 : 1 }}
        >
          <img
            src={getImageUrl(image.url)}
            alt={image.title || 'Hero background'}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('❌ Image failed to load:', image.url);
              e.target.onerror = null;
              e.target.src = '/images/hero-default.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl text-white">
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 animate-fade-in">
              Alliance4Growth
              <span className="block text-accent text-3xl md:text-4xl mt-2">
                Clacks & Forth Valley
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-4 font-light">
              {heroImages[currentSlide]?.subtitle || 'Supporting Family and Men\'s Wellness'}
            </p>
            <div className="w-24 h-1 bg-accent mb-8"></div>
            <p className="text-lg mb-10 max-w-2xl opacity-90">
              Building stronger communities through connection, support, and growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-center"
              >
                Join Our Community
              </Link>
              <Link
                to="/events"
                className="bg-accent text-white px-8 py-4 rounded-lg font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-center"
              >
                View All Events
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex gap-3">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-accent w-8'
                : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
};

export default HeroCarousel;
