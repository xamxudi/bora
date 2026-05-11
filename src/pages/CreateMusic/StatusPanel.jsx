// StatusPanel.jsx
import React from "react";
import './StatusPanel.css';
const StatusPanel = ({ taskId, status, error, downloadUrl, onRefresh, onCancel, isGenerating }) => (
  <div className={`status-card ${error ? 'error' : status?.toLowerCase()}`}>
    <div className="status-header">
      <h3>Generation Status</h3>
      {status && <span className="status-badge">{status}</span>}
    </div>

    {error && <div className="error-message">{error}</div>}

    <div className="status-details">
      {taskId && (
        <div className="detail-row">
          <span className="detail-label">Task ID:</span>
          <span className="detail-value">{taskId}</span>
        </div>
      )}

      
          {/* 👇 Thêm player tại đây */}
          <div className="detail-row" style={{ marginTop: 12 }}>
            <span className="detail-label">Preview:</span>
            <div className="detail-value" style={{ width: '100%' }}>
              <audio
                controls
                preload="none"
                src={downloadUrl}
                style={{ width: '100%' }}
              />
            </div>
          </div>
      
     
    </div>

    <div className="status-actions">
      <button className="action-btn" onClick={onRefresh} disabled={!taskId || isGenerating}>
        Refresh Status
      </button>
      <button className="action-btn" onClick={onCancel} disabled={isGenerating === false}>
        Cancel Generation
      </button>
    </div>
  </div>
);

export default StatusPanel;
