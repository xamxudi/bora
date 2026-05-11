import React from "react";
import "./Slider.css";

export const Slider = ({ value, onChange, max = 100, step = 0.01, label, info }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="slider-group">
      <div className="slider-header">
        <label className="slider-label">{label}</label>
        <div className="slider-value">{value.toFixed(2)}</div>
      </div>
      <div className="slider-container">
        <div className="slider-track" style={{ width: `${percentage}%` }} />
        <input
          type="range"
          min="0"
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="slider-input"
        />
        <div className="slider-thumb" style={{ left: `${percentage}%` }} />
      </div>
      {info && <div className="slider-info">{info}</div>}
    </div>
  );
};
