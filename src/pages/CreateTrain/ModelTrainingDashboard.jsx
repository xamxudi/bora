import React, { useState, useRef } from 'react';
import './ModelTraining.css';
import ParameterSettings from "./ParameterSettings";

const ModelTraining = () => {
  const [activeTab, setActiveTab] = useState('image');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const filesWithPreview = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    // Thêm các file mới vào danh sách hiện tại
    setSelectedFiles(prev => [...prev, ...filesWithPreview]);

    // Reset input để lần sau có thể chọn cùng file nếu muốn
    e.target.value = null;
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="model-training-container">
      {/* Tabs */}
      <div className="model-tabs">
        <button 
          className={`model-tab ${activeTab === 'image' ? 'active' : ''}`}
          onClick={() => setActiveTab('image')}
        >
          Image Model
        </button>
        <button 
          className={`model-tab ${activeTab === 'video' ? 'active' : ''}`}
          onClick={() => setActiveTab('video')}
        >
          Video Model <span className="new-badge">NEW</span>
        </button>
      </div>

      {activeTab === 'image' && (
        <div className="content-wrapper">
          {/* Left Column */}
          <div className="dataset-column">
            <div className="upload-card">
              <div className="upload-header">
                <span>Dataset 0</span>
                <div className="upload-actions">
                  <button className="upload-action">+ Add Dataset Normalization</button>
                  <button className="upload-action">Example Images/Videos</button>
                </div>
              </div>
              <div 
                className="drop-zone"
                onClick={handleUploadClick}
              >
                <div className="drop-content">
                  <div className="upload-icon">🖼️</div>
                  <p>Click or Drag Images to upload.</p>
                  <p className="formats">Supported formats: PNG / JPG / JPEG / WebP</p>
                  <button 
                    className="upload-button"
                    onClick={handleUploadClick}
                  >
                    Upload Images
                  </button>
                  {/* Hidden input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* Preview Thumbnails */}
              {selectedFiles.length > 0 && (
                <div className="file-previews">
                  {selectedFiles.map(({ file, preview }, index) => (
                    <div key={index} className="file-preview">
                      <img src={preview} alt={file.name} />
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="or-divider">
                <span>Or Upload Dataset</span>
              </div>
              <div className="dataset-info">
                <p>Supports zip packages within 500Mb.</p>
                <p>Please ensure that images and tagging files correspond one by one.</p>
                <p>Multi-level directories cannot be included in the zip package.</p>
                <p>Total number of characters in file names should be less than 255.</p>
              </div>
              <div className="upload-limit">
                You can add up to 100 images, pro member can add 1000 images 
                <button className="upgrade-btn">Upgrade</button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="parameter-column">
            <ParameterSettings/>
          </div>
        </div>
      )}

      {activeTab === 'video' && (
        <div className="video-content">
          <p>Video Model training is coming soon.</p>
        </div>
      )}
    </div>
  );
};

export default ModelTraining;
