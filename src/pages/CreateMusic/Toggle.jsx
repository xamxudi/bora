import React from "react";
import './Toggle.css';

export const Toggle = ({ checked, onChange, variant = "primary" }) => (
  <div
    className={`toggle ${checked ? 'active' : ''} ${variant}`}
    onClick={() => onChange(!checked)}
    role="button"
    aria-pressed={checked}
    tabIndex={0}
  >
    <span className="toggle-thumb" />
  </div>
);
