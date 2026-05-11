import React, { useEffect, useState } from "react";
import { TaskService } from "../../services/ApiService";
import "./TaskDetailModal.css";

const getMediaType = (url) => {
  if (!url) return null;
  const lower = url.toLowerCase();
  const imgExts = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tiff"];
  const vidExts = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
  const ext = lower.substring(lower.lastIndexOf("."));
  if (imgExts.includes(ext)) return "image";
  if (vidExts.includes(ext)) return "video";
  return null;
};

const TaskDetailModal = ({ taskId, setSelectedTask }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!taskId) return;

    const fetchTask = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await TaskService.getById(taskId);
        setTask(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  if (!taskId) return null;

  const mediaType = getMediaType(task?.resultUrl);
  const processData = task?.processData || {};

  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('completed') || statusLower.includes('done')) return 'completed';
    if (statusLower.includes('queued') || statusLower.includes('waiting')) return 'queued';
    if (statusLower.includes('processing') || statusLower.includes('running')) return 'processing';
    if (statusLower.includes('failed') || statusLower.includes('error')) return 'failed';
    return 'queued';
  };

  return (
    <div className="task-modal-overlay" onClick={() => setSelectedTask(null)}>
      <div className="task-modal-content" onClick={(e) => e.stopPropagation()}>

        {/* Media Section */}
        <div className="task-modal-media">
          {loading && (
            <div className="loading-spinner"></div>
          )}

          {error && (
            <div className="error-message">{error}</div>
          )}

          {!loading && !error && task?.resultUrl && mediaType === "image" && (
            <img
              src={task.resultUrl}
              alt="AI Generated Output"
              loading="lazy"
            />
          )}

          {!loading && !error && task?.resultUrl && mediaType === "video" && (
            <video
              src={task.resultUrl}
              controls
              loop
              muted
              preload="metadata"
            />
          )}

          {!loading && !error && !task?.resultUrl && (
            <div className="no-media-message">Không có output media.</div>
          )}
        </div>

        {/* Info Section */}
        <div className="task-modal-info">
          <h3 className="modal-title">Thông tin chi tiết</h3>

          {loading && (
            <div className="info-section">
              <div className="loading-spinner"></div>
            </div>
          )}

          {error && (
            <div className="info-section">
              <div className="error-message">{error}</div>
            </div>
          )}

          {!loading && !error && task && (
            <>
              {/* Basic Info Section */}
              <div className="info-section">
                <h4 className="section-title">Thông tin cơ bản</h4>

                <div className="info-row">
                  <span className="info-label">ID:</span>
                  <span className="info-value highlight">{task.id}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Trạng thái:</span>
                  <span className={`status-badge ${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Tạo lúc:</span>
                  <span className="info-value">
                    {`${new Date(task.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })} ${new Date(task.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })}`}
                  </span>
                </div>

                {task.completedAt && (
                  <div className="info-row">
                    <span className="info-label">Hoàn thành:</span>
                    <span className="info-value success">{new Date(task.completedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Generation Parameters */}
              {processData?.Params && (
                <div className="info-section">
                  <h4 className="section-title">Thông số sinh ảnh / video</h4>

                  <div className="info-row">
                    <span className="info-label">Model:</span>
                    <span className="info-value highlight">{processData.Params.BaseModel?.Name || 'N/A'}</span>
                  </div>

                  {processData.Params.Prompt && (
                    <div className="info-row">
                      <span className="info-label">Prompt:</span>
                      <div className="prompt-display">{processData.Params.Prompt}</div>
                    </div>
                  )}

                  {processData.Params.NegativePrompt && (
                    <div className="info-row">
                      <span className="info-label">Negative:</span>
                      <div className="prompt-display">{processData.Params.NegativePrompt}</div>
                    </div>
                  )}

                  <div className="params-grid">
                    {processData.Params.Steps && (
                      <div className="param-item">
                        <span className="param-label">Steps</span>
                        <span className="param-value">{processData.Params.Steps}</span>
                      </div>
                    )}

                    {processData.Params.CFG && (
                      <div className="param-item">
                        <span className="param-label">CFG Scale</span>
                        <span className="param-value">{processData.Params.CFG}</span>
                      </div>
                    )}

                    {processData.Params.Seed !== undefined && (
                      <div className="param-item">
                        <span className="param-label">Seed</span>
                        <span className="param-value">{processData.Params.Seed}</span>
                      </div>
                    )}

                    {(processData.Params.Sampler || processData.Params.KSamplerName) && (
                      <div className="param-item">
                        <span className="param-label">Sampler</span>
                        <span className="param-value">{processData.Params.Sampler || processData.Params.KSamplerName}</span>
                      </div>
                    )}

                    {processData.Params.Width && processData.Params.Height && (
                      <div className="param-item">
                        <span className="param-label">Size</span>
                        <span className="param-value">{processData.Params.Width}×{processData.Params.Height}</span>
                      </div>
                    )}

                    {processData.Params.Denoise && (
                      <div className="param-item">
                        <span className="param-label">Denoise</span>
                        <span className="param-value">{processData.Params.Denoise}</span>
                      </div>
                    )}

                    {/* Thêm 3 trường mới: FPS, Duration, Resolution */}
                    {processData.Params.Fps && (
                      <div className="param-item">
                        <span className="param-label">FPS</span>
                        <span className="param-value">{processData.Params.Fps}</span>
                      </div>
                    )}

                    {processData.Params.Duration && (
                      <div className="param-item">
                        <span className="param-label">Duration</span>
                        <span className="param-value">{processData.Params.Duration}</span>
                      </div>
                    )}

                    {processData.Params.Resolution && (
                      <div className="param-item">
                        <span className="param-label">Resolution</span>
                        <span className="param-value">{processData.Params.Resolution}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          <button
            className="close-icon"
            onClick={() => setSelectedTask(null)}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
