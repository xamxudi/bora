import React, { useEffect, useRef, useState } from "react";
import './HistoryList.css';
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaDownload,
  FaSyncAlt,
  FaCheck,
  FaTimes,
  FaHourglassHalf,
  FaCircle,
  FaSpinner,
} from "react-icons/fa";

function formatTime(sec) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function AudioCard({ item }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrent(audio.currentTime || 0);
    const onLoaded = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };
    const onEnd = () => setIsPlaying(false);
    const onLoadStart = () => setIsLoading(true);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("loadstart", onLoadStart);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("loadstart", onLoadStart);
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsLoading(true);

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setIsLoading(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.warn("Audio play failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = Number(e.target.value);
    audio.currentTime = newTime;
    setCurrent(newTime);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  };

  const safeTitle =
    (item.prompt || "Creative Track").replace(/[^\w\- ]+/g, "").trim() ||
    "Creative Track";

  const getFileExtension = (url, mimeType) => {
    if (mimeType) {
      if (mimeType.includes("ogg")) return ".ogg";
      if (mimeType.includes("mpeg")) return ".mp3";
      if (mimeType.includes("wav")) return ".wav";
      if (mimeType.includes("aac")) return ".aac";
    }

    try {
      const match = url.toLowerCase().match(/\.(mp3|ogg|wav|aac|m4a)(\?|#|$)/);
      return match ? `.${match[1]}` : ".ogg";
    } catch {
      return ".ogg";
    }
  };

  const handleDownload = async () => {
    const url = item.downloadUrl;
    if (!url) return;

    try {
      const response = await fetch(url, {
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const extension = getFileExtension(url, blob.type);
      const filename = `${safeTitle}_${item.taskId || Date.now()}${extension}`;

      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      URL.revokeObjectURL(downloadLink.href);
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.warn("CORS blocked download, opening URL instead:", error);
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const title = item.prompt || "Creative Mind";
  const artist = "AI Generated";

  return (
    <div className="player-card">
      <audio ref={audioRef} src={item.downloadUrl} preload="metadata" />

      <div className="player-top">
        <div className="cover" />
        <div className="meta">
          <h3 className="track-title">{title}</h3>
          <div className="track-artist">{artist}</div>
        </div>
      </div>

      <div className="seek-row">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step="0.1"
          value={current}
          onChange={handleSeek}
          className="seek"
          disabled={isLoading}
        />
        <div className="time-row">
          <span>{formatTime(current)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="controls-row">
        <button
          className="ctrl play"
          onClick={togglePlay}
          disabled={isLoading}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isLoading ? (
            <FaSpinner className="spin" size={20} />
          ) : isPlaying ? (
            <FaPause size={20} />
          ) : (
            <FaPlay size={20} />
          )}
        </button>
      </div>

      <div className="controls-row split">
        <button
          className="ctrl ghost volume"
          onClick={toggleMute}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>

        <button
          className="ctrl ghost download"
          onClick={handleDownload}
          title="Download Track"
        >
          <FaDownload />
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const S = (status || "").toLowerCase();
  const icon =
    S === "success" || S === "completed"
      ? <FaCheck />
      : S === "pending" || S === "processing"
      ? <FaHourglassHalf />
      : S === "failed" || S === "error"
      ? <FaTimes />
      : <FaCircle />;

  return (
    <span className={`status ${S || 'pending'}`}>
      <span className="status-icon">{icon}</span>
      {status || 'Unknown'}
    </span>
  );
}

function RefreshButton({ onRefresh, isLoading = false }) {
  return (
    <button
      className="refresh-btn"
      onClick={onRefresh}
      disabled={isLoading}
      title="Refresh history"
    >
      <span className={`refresh-icon ${isLoading ? 'spinning' : ''}`}>
        <FaSyncAlt />
      </span>
      {isLoading ? 'Loading...' : 'Refresh'}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-content">
        <h3>No Music Generated Yet</h3>
        <p>
          Start creating your AI-powered musical journey by entering a song idea or prompt above.
          Your generated tracks will appear here once they're ready to play.
        </p>
      </div>
    </div>
  );
}

const HistoryList = ({ history = [], onRefresh, isLoading = false }) => {
  // Add mouse move effect for cards
  useEffect(() => {
    const cards = document.querySelectorAll('.history-card');

    const handleMouseMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      card.style.setProperty('--x', `${x}%`);
      card.style.setProperty('--y', `${y}%`);
    };

    cards.forEach(card => {
      card.addEventListener('mousemove', handleMouseMove);
    });

    return () => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleMouseMove);
      });
    };
  }, [history]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="history-section">
      <div className="section-header">
        <div className="header-content">
          <h2 className="section-title">Lịch sử Âm nhạc của bạn</h2>
          <p className="section-subtitle">
            Khám phá và quản lý những kiệt tác âm nhạc do AI tạo ra
          </p>
        </div>
        <RefreshButton onRefresh={onRefresh} isLoading={isLoading} />
      </div>

      {history?.length ? (
        <div className="history-grid">
          {history.map((item, index) => (
            <div
              key={item.taskId || index}
              className="history-card dark"
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <div className="card-gradient" />

              <div className="card-header">
                <StatusBadge status={item.status} />
                <span className="date">
                  {formatDate(item.createdAt)}
                </span>
              </div>

              <div className="card-body">
                {item.downloadUrl && (item.status || '').toLowerCase() === 'success' ? (
                  <AudioCard item={item} />
                ) : (
                  <div className="track-preview">
                    <h4 className="prompt">
                      {item.prompt || 'Untitled Track'}
                    </h4>
                    {(item.status || '').toLowerCase() === 'pending' && (
                      <div className="loading-indicator">
                        <FaSpinner className="spin" />
                        <p className="loading-text">Generating your track...</p>
                      </div>
                    )}
                    {(item.status || '').toLowerCase() === 'failed' && (
                      <div className="error-indicator">
                        <p className="error-text">Generation failed. Please try again.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

export default HistoryList;
