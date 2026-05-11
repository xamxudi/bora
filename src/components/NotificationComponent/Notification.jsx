import React, { useState, useEffect } from 'react';
import {
  MdClose,
  MdLock,
  MdStar,
  MdFlashOn,
  MdSecurity,
  MdArrowForward,
  MdSmartToy,
  MdWorkspacePremium
} from 'react-icons/md';
import './Notification.css';
import LogoAi from "../../assets/images/notification/logo512.png";
const ModernAINotification = ({
  isOpen = true,
  onClose,
  onUpgrade,
  featureName = "Đầy đủ các tính năng  AI"
}) => {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleUpgrade = () => {
    if (onUpgrade) onUpgrade();
  };

  if (!isOpen) return null;

  return (
    <div className="ai-notification-overlay" onClick={handleClose}>
      {/* Floating particles background */}
      <div className="ai-particles-container">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="ai-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="ai-notification-modal" onClick={(e) => e.stopPropagation()}>
        {/* Animated gradient border */}
        <div className="ai-modal-border" />
        <div className="ai-modal-content">

          {/* Header */}
          <div className="ai-header">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="ai-close-button"
            >
              <MdClose size={20} />
            </button>

            {/* Status indicator */}
            <div className="ai-status-indicator">
              <div className="ai-status-dot ai-status-ping" />
              <div className="ai-status-dot" />
            </div>

            {/* AI Bot icon with glow effect */}
            <div className="ai-icon-container">
              <div className="ai-icon-glow" />
              <div className="ai-icon-wrapper">
                <img
                  src={LogoAi}
                  className="logo-image"
                  alt="logo"

                />
              </div>
            </div>

            <h2 className="ai-title">Nâng cấp AI VIP</h2>
            <p className="ai-subtitle">Mở khóa sức mạnh AI tiên tiến</p>

            {/* Animated tech lines */}
            <div className="ai-tech-line" />
          </div>

          {/* Content */}
          <div className="ai-content">
            {/* Lock status */}
            <div className="ai-lock-section">
              <div className="ai-lock-row">
                <MdLock size={16} className="ai-lock-icon" />
                <span className="ai-lock-text">Tính năng bị khóa</span>
              </div>
              <p className="ai-feature-text">
                Bạn cần tài khoản VIP để sử dụng{' '}
                <span className="ai-feature-highlight">{featureName}</span>
              </p>
            </div>

            {/* Premium features */}
            <div className="ai-features">
              <div className="ai-feature-item ai-feature-purple">
                <div className="ai-feature-icon-wrapper ai-feature-icon-purple">
                  <MdStar size={16} className="ai-feature-icon" />
                </div>
                <span className="ai-feature-description">
                  Truy cập không giới hạn tất cả tính năng AI
                </span>
              </div>

              <div className="ai-feature-item ai-feature-blue">
                <div className="ai-feature-icon-wrapper ai-feature-icon-blue">
                  <MdFlashOn size={16} className="ai-feature-icon" />
                </div>
                <span className="ai-feature-description">
                  Xử lý siêu nhanh với AI tốc độ cao
                </span>
              </div>

              <div className="ai-feature-item ai-feature-cyan">
                <div className="ai-feature-icon-wrapper ai-feature-icon-cyan">
                  <MdSecurity size={16} className="ai-feature-icon" />
                </div>
                <span className="ai-feature-description">
                  Hỗ trợ VIP 24/7 & không quảng cáo
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="ai-buttons">
              <button
                className="ai-upgrade-button"
                onClick={handleUpgrade}
              >
                <div className="ai-upgrade-glow" />
                <div className="ai-upgrade-content">
                  <MdWorkspacePremium size={20} />
                  <span>Nâng cấp VIP ngay</span>
                  <MdArrowForward size={16} className="ai-arrow" />
                </div>
              </button>

              <button
                onClick={handleClose}
                className="ai-later-button"
              >
                Để sau
              </button>
            </div>
          </div>

          {/* Bottom tech accent */}
          <div className="ai-bottom-accent" />
        </div>
      </div>
    </div>
  );
};

export default ModernAINotification;
