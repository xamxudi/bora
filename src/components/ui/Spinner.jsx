import React from "react";
import "./Spinner.css";

export default function Spinner({ size = "medium", color = "#3498db" }) {
  return (
    <div
      className={`spinner ${size}`}
      style={{ borderTopColor: color }}
    ></div>
  );
}
