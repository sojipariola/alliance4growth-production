import { useState, useEffect } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { getImageUrl } from '../../utils/imageHelpers';

// Import additional plugins for better experience
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import 'yet-another-react-lightbox/plugins/counter.css';

const ImageGallery = ({ images, initialIndex = 0, isOpen, onClose }) => {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    if (images && images.length > 0) {
      const formattedSlides = images.map(img => ({
        src: getImageUrl(img),
        alt: 'Event image',
        title: 'Event Gallery'
      }));
      setSlides(formattedSlides);
    }
  }, [images]);

  if (!isOpen || slides.length === 0) return null;

  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      slides={slides}
      index={initialIndex}
      plugins={[Zoom, Counter]}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 1.5,
      }}
      counter={{
        container: { style: { 
          backgroundColor: 'rgba(0, 0, 0, 0.6)', 
          padding: '8px 16px', 
          borderRadius: '20px',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold'
        } }
      }}
      styles={{
        container: { 
          backgroundColor: 'rgba(0, 0, 0, 0.95)' 
        },
        button: { 
          color: '#fff',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          padding: '12px',
        },
        icon: { color: '#fff' }
      }}
      render={{
        iconPrev: () => '←',
        iconNext: () => '→',
        iconClose: () => '✕',
      }}
    />
  );
};

export default ImageGallery;
