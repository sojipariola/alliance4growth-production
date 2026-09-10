const PLACEHOLDER = '/images/event-default.svg';

export const getImageUrl = (url) => {
  if (!url || url === 'null' || url === 'undefined') return PLACEHOLDER;
  if (url.startsWith('data:image/')) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    return url.startsWith('/') ? url : `/${url}`;
  }
  if (url.startsWith('/images/')) return url;
  if (!url.startsWith('/')) return `/uploads/events/${encodeURIComponent(url)}`;
  return url;
};

export const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = PLACEHOLDER;
};

export const DEFAULT_EVENT_IMAGE = '/images/event-default.svg';
export const DEFAULT_GALLERY_IMAGE = '/images/gallery-default.svg';

export default getImageUrl;
