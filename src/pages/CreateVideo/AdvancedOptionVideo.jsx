import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./AdvancedOptionVideo.css";
import { useUIMode } from "../../contexts/UIModeContext";
import { GiPerspectiveDiceSixFacesOne } from "react-icons/gi";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function AdvancedOptions({
  steps,
  setSteps,
  cfg,
  setCfg,
  seed,
  setSeed,
  resolution,
  setResolution,
  duration,
  setDuration,
  fps,
  setFps,
  quality,
  setQuality,
  // <- thêm prop để phân chế độ
}) {
  const [showQualityOptions, setShowQualityOptions] = useState(false);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("type") || "text2video";
  });
  const [isOpen, setIsOpen] = useState(false);
  const { uiMode } = useUIMode();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabType = params.get("type") || "text2video";
    setActiveTab(tabType);
  }, [location.search]);

  const handleRandomSeed = () => {
    const random = Math.floor(Math.random() * 1000000);
    setSeed(String(random));
  };

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [window.innerWidth]);

  return (
    <div className="advanced-options">
      <div className="advanced-header">
        <h2 className="panel-title">Cài đặt</h2>
        <button
          type="button"
          className="btn toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>
     
      {isOpen && (
      <div className="advanced-body">

        {/* Chỉ hiển thị trong Advanced mode */}
        {uiMode === "advanced" && (
          <>
            {/* Steps */}
            <div className="input-group slider-group">
              <label htmlFor="steps">Steps</label>
              <div className="slider-row">
                <input
                  id="steps"
                  type="range"
                  min="1"
                  max="100"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                />
                <div className="slider-value">{steps}</div>
              </div>
            </div>

            {/* CFG Scale */}
            <div className="input-group slider-group">
              <label htmlFor="cfg">CFG Scale</label>
              <div className="slider-row">
                <input
                  id="cfg"
                  type="range"
                  min="1"
                  max="30"
                  value={cfg}
                  onChange={(e) => setCfg(Number(e.target.value))}
                />
                <div className="slider-value">{cfg}</div>
              </div>
            </div>

            {/* Seed */}
            <div className="input-group seed-group">
              <label htmlFor="seed">Seed</label>
              <div className="seed-input-wrapper">
                <input
                  id="seed"
                  type="text"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Empty for random"
                />
                <button
                  type="button"
                  className="random-seed-btn"
                  onClick={handleRandomSeed}
                  title="Random Seed"
                >
                  <GiPerspectiveDiceSixFacesOne />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Luôn hiển thị (cả Basic và Advanced) */}
        <div className="video-controls">
          <select disabled={activeTab !== "text2video"} value={resolution} onChange={(e) => setResolution(e.target.value)}>
            <option value="1280x720">720p (9:16)</option>
            <option value="720x1280">720p (9:16)</option>
            <option value="720:720">720p (1:1)</option>
          </select>

          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="5">5 giây</option>
            <option value="10">10 giây</option>
          </select>

          <select value={fps} onChange={(e) => setFps(e.target.value)}>
            <option value="16">16 fps</option>
          </select>

          <div className="quality-wrapper" style={{ display: "none" }}>
            <button
              className="quality-btn"
              onClick={() => setShowQualityOptions(!showQualityOptions)}
            >
              {quality} quality
            </button>
            {showQualityOptions && (
              <div className="quality-menu">
                <div
                  onClick={() => {
                    setQuality("Low");
                    setShowQualityOptions(false);
                  }}
                >
                  Low
                </div>
                <div
                  onClick={() => {
                    setQuality("Medium");
                    setShowQualityOptions(false);
                  }}
                >
                  Medium
                </div>
                <div
                  onClick={() => {
                    setQuality("High");
                    setShowQualityOptions(false);
                  }}
                >
                  High
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
