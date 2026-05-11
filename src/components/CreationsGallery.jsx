import React, { useState, useEffect } from 'react';
import profileService from '../services/ProfileService';
import './CreationsGallery.css';

const CreationsGallery = ({ type, onClose }) => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCreations = async () => {
      try {
        setLoading(true);
        const result = await profileService.getUserCreations(type, 50);
        if (result.success) {
          setCreations(result.data || []);
        } else {
          setError(result.message || 'Không thể tải danh sách tác phẩm');
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchCreations();
  }, [type]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const handleImageClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="creations-gallery-overlay" onClick={onClose}>
      <div className="creations-gallery-modal" onClick={(e) => e.stopPropagation()}>
        <div className="creations-gallery-header">
          <h2>
            {type === 'images' ? 'Hình ảnh đã tạo' : 
             type === 'videos' ? 'Video đã tạo' : 
             'Tác phẩm đã tạo'}
          </h2>
          <button className="creations-gallery-close" onClick={onClose}>×</button>
        </div>
        
        <div className="creations-gallery-content">
          {loading && (
            <div className="creations-gallery-loading">
              Đang tải...
            </div>
          )}
          
          {error && (
            <div className="creations-gallery-error">
              {error}
            </div>
          )}
          
          {!loading && !error && creations.length === 0 && (
            <div className="creations-gallery-empty">
              Chưa có tác phẩm nào
            </div>
          )}
          
          {!loading && !error && creations.length > 0 && (
            <div className="creations-gallery-grid">
              {creations.map((creation) => (
                <div key={creation.id} className="creations-gallery-item">
                  <div 
                    className="creations-gallery-media"
                    onClick={() => handleImageClick(creation.resultUrl)}
                  >
                    {creation.type === 'video' ? (
                      <video 
                        src={creation.resultUrl} 
                        className="creations-gallery-video"
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <img 
                        src={creation.resultUrl} 
                        alt="Tác phẩm" 
                        className="creations-gallery-image"
                        loading="lazy"
                      />
                    )}
                    <div className="creations-gallery-overlay-info">
                      <span className="creations-gallery-type">
                        {creation.type === 'video' ? '🎬' : '🎨'}
                      </span>
                    </div>
                  </div>
                  <div className="creations-gallery-info">
                    <div className="creations-gallery-date">
                      {formatDate(creation.completedAt || creation.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreationsGallery;
