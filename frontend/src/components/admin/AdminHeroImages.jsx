import { useState, useEffect, useRef } from 'react';
import api from '../../api/axiosConfig';
import { getImageUrl } from '../../utils/imageHelpers';
import { FaUpload, FaTrash, FaSpinner, FaImage, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminHeroImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHeroImages();
  }, []);

  const fetchHeroImages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/content/hero');
      setImages(response.data || []);
    } catch (error) {
      console.error('Error fetching hero images:', error);
      toast.error('Failed to load hero images');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('hero', file);
    });
    
    try {
      const response = await api.post('/content/hero/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success(`${response.data.count || 1} image(s) uploaded successfully`);
      fetchHeroImages();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this hero image?')) return;
    try {
      await api.delete(`/content/hero/${id}`);
      toast.success('Image deleted');
      fetchHeroImages();
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const toggleActive = (id) => {
    setImages(prevImages => 
      prevImages.map(img => 
        img.id === id 
          ? { ...img, is_active: img.is_active === 1 ? 0 : 1 }
          : img
      )
    );
  };

  const handleSaveActive = async () => {
    setSaving(true);
    try {
      // Get all active image IDs
      const activeImages = images.filter(img => img.is_active === 1);
      
      if (activeImages.length === 0) {
        toast.error('Please select at least one active image');
        setSaving(false);
        return;
      }

      // Save each image's active status
      for (const image of images) {
        await api.put(`/content/hero/${image.id}`, { 
          is_active: image.is_active 
        });
      }
      
      toast.success(`${activeImages.length} image(s) set as active`);
      fetchHeroImages(); // Refresh to get latest data
    } catch (error) {
      console.error('Error saving active images:', error);
      toast.error('Failed to save active images');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = () => {
    setImages(prevImages => 
      prevImages.map(img => ({ ...img, is_active: 1 }))
    );
  };

  const handleDeselectAll = () => {
    setImages(prevImages => 
      prevImages.map(img => ({ ...img, is_active: 0 }))
    );
  };

  if (loading) {
    return <div className="text-center py-12">Loading hero images...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-heading font-semibold text-primary">
            Hero Section Images
          </h3>
          <p className="text-sm text-neutral">
            Select multiple images to rotate in the hero section
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary flex items-center gap-2"
            disabled={uploading}
          >
            {uploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {images.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FaImage className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral mb-2">No Hero Images</h3>
          <p className="text-neutral">Upload images for the hero section carousel.</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 btn-primary inline-flex items-center gap-2"
          >
            <FaPlus /> Add Hero Images
          </button>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-neutral">
                {images.filter(img => img.is_active === 1).length} of {images.length} active
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-primary hover:underline"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-sm text-neutral hover:underline"
              >
                Deselect All
              </button>
            </div>
            <button
              onClick={handleSaveActive}
              disabled={saving || images.filter(img => img.is_active === 1).length === 0}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaCheck />}
              {saving ? 'Saving...' : 'Save Active Images'}
            </button>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div 
                key={image.id} 
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
                  image.is_active === 1 ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getImageUrl(image.url)}
                    alt={image.title || 'Hero image'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/hero-default.jpg';
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => toggleActive(image.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                        image.is_active === 1
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {image.is_active === 1 ? (
                        <><FaCheck size={10} /> Active</>
                      ) : (
                        'Inactive'
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-primary truncate max-w-[150px]">
                        {image.title || 'Untitled'}
                      </p>
                      <p className="text-xs text-neutral">
                        {image.order_index !== undefined ? `Order: ${image.order_index + 1}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Message */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Click on "Active" or "Inactive" buttons on each image to toggle.
              Images marked as <span className="font-semibold">Active</span> will appear in the rotating hero carousel.
              Click <span className="font-semibold">"Save Active Images"</span> to apply your changes.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminHeroImages;
