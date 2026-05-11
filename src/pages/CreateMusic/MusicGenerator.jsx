import React, { useEffect, useMemo, useRef, useState } from 'react';
import './MusicGenerator.css';
import { SonautoService } from '../../services/SonautoService';
import { MUSIC_GENRES } from './MusicGenres';
import { Toggle } from './Toggle';
import { Slider } from './Slider';
import StatusPanel from './StatusPanel';
import HistoryList from './HistoryList';
import { FaMusic, FaMagic, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
const MusicGenerator = () => {
  // ---------- State ----------
  const [activeTab, setActiveTab] = useState('Simple');
  const [songIdea, setSongIdea] = useState('A rock song about turtles flying');

  const [lyricsMode, setLyricsMode] = useState('Auto Lyrics'); // 'Auto Lyrics' | 'Custom Lyrics' | 'No Lyrics'
  const [lyricsContent, setLyricsContent] = useState('');

  const [fancyMode, setFancyMode] = useState(false);
  const [moreAdvanced, setMoreAdvanced] = useState(true);
  const [tryTestModels, setTryTestModels] = useState(true);

  const [lyricsStyleStrength, setLyricsStyleStrength] = useState(2.3);
  const [balance, setBalance] = useState(0.7);
  const [styleStrength, setStyleStrength] = useState(1.0);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [genStatus, setGenStatus] = useState(null);          // renamed from "status"
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);
  const [songHistory, setSongHistory] = useState([]);        // renamed from "history"

  const abortRef = useRef(null);

  // ---------- Helper ----------
  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag].slice(0, 10) // limit 10
    );
  };

  const filteredTags = useMemo(() => {
    let tags = [];
    if (selectedCategory === 'all') {
      Object.values(MUSIC_GENRES.tags).forEach(arr => { tags = [...tags, ...arr]; });
    } else {
      tags = MUSIC_GENRES.tags[selectedCategory] || [];
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      tags = tags.filter(t => t.toLowerCase().includes(q));
    }
    return [...new Set(tags)].sort();
  }, [selectedCategory, searchQuery]);

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // ...

  const buildPayload = () => {
    const isCustom = lyricsMode === 'Custom Lyrics';
    const isNoLyrics = lyricsMode === 'No Lyrics';

    const payload = {
      tags: selectedTags,
      lyrics: null,
      instrumental: isNoLyrics,
      promptStrength: null,                    // set null trước, rồi gán clamp
      balanceStrength: Number(balance) || null,
      styleStrength: Number(styleStrength) || null,
      experimental: tryTestModels,
      advancedMode: moreAdvanced,
      fancyMode,
    };

    // clamp về [0, 3.1]
    const ps = Number(lyricsStyleStrength);
    payload.promptStrength = Number.isFinite(ps) ? clamp(ps, 0, 3.1) : null;

    if (isCustom) {
      payload.lyrics = lyricsContent?.trim() || null;
      payload.prompt = null;
    } else {
      payload.prompt = songIdea?.trim() || '';
    }

    return payload;
  };
  const cancelPolling = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };

  const fetchHistory = async () => {
    try {
      const list = await SonautoService.getHistory();
      setSongHistory(list || []);
    } catch (e) {
      // không fail UI nếu lịch sử lỗi
      // eslint-disable-next-line no-console
      console.error('Failed to fetch history:', e);
    }
  };

  // ---------- Effects ----------
  useEffect(() => {
    fetchHistory();
    return () => cancelPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Handlers ----------
  const handleGenerate = async () => {
    setError(null);
    setGenStatus(null);
    setDownloadUrl(null);
    setIsGenerating(true);

    cancelPolling();
    abortRef.current = new AbortController();

    try {
      const payload = buildPayload();
      const { task_id } = await SonautoService.generate(payload);

      setTaskId(task_id);
      setGenStatus('PENDING');

      const result = await SonautoService.waitForDone(task_id, {
        intervalMs: 3000,
        timeoutMs: 180000,
        signal: abortRef.current.signal,
      });

      setGenStatus(result.status);
      setDownloadUrl(result.download_url || null);
      await fetchHistory();
    } catch (e) {
      setError(e?.message || 'Generation failed');
      if (!genStatus) setGenStatus('FAILED');
    } finally {
      setIsGenerating(false);
      cancelPolling();
    }
  };

  const handleCheckStatus = async () => {
    if (!taskId) return;
    try {
      const s = await SonautoService.getStatus(taskId);
      setGenStatus(s.status);
      setDownloadUrl(s.download_url || null);
    } catch (e) {
      setError(e?.message || 'Failed to check status');
    }
  };

  // ---------- Render ----------
  return (
    <div className="music-generator">
      <div className="container">
        {/* Tabs */}
        <div className="tabs">
          {['Simple', 'Advanced'].map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {activeTab === tab && <span className="tab-indicator" />}
            </button>
          ))}
        </div>

        {/* Simple */}
        {activeTab === 'Simple' && (
          <div className="simple-mode">
            <div className="input-card">
              <div className="input-group">
                <span className="input-icon"><FaMusic /></span>
                <input
                  type="text"
                  value={songIdea}
                  onChange={(e) => setSongIdea(e.target.value)}
                  className="song-input"
                  placeholder="A rock song about turtles flying"
                />
                <button
                  className="generate-btn primary"
                  onClick={handleGenerate}
                  disabled={isGenerating || !songIdea?.trim()}
                >
                  {isGenerating ? (
                    <>
                       <FaSpinner className="spinner" />
                      Tạo ra...
                    </>
                  ) : (
                    <>
                    <FaMagic className="icon" />
                      Tạo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Advanced */}
        {activeTab === 'Advanced' && (
          <div className="advanced-mode">
            {/* Sound Style */}
            <div className="section-card">
              <h3 className="section-title-txt">
                Phong cách âm thanh
              </h3>

              <div className="search-container">
                <input
                  type="text"
                  placeholder="Tìm kiếm phong cách..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-dropdown"
                >
                  {MUSIC_GENRES.categories.map(c => (
                    <option key={c.key} value={c.key}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="tags-container">
                <div className="tags">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag}
                      className={`tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                      onClick={() => toggleTag(tag)}
                      type="button"
                    >
                      {tag}
                      {selectedTags.includes(tag) && <FaCheck className="checkmark" />}
                    </button>
                  ))}
                </div>
              </div>

              {selectedTags.length > 0 && (
                <div className="selected-tags-container">
                  <h4>Selected Styles ({selectedTags.length}/10):</h4>
                  <div className="selected-tags">
                    {selectedTags.map(tag => (
                      <span key={tag} className="tag active">
                        {tag}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleTag(tag); }}
                          className="remove-tag"
                        >
                          <FaTimes />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Lyrics */}
            <div className="section-card">
              <h3 className="section-title-txt">
                Tùy chọn lời bài hát
              </h3>
              <div className="lyrics-options">
                {['Auto Lyrics', 'Custom Lyrics', 'No Lyrics'].map((mode) => (
                  <label key={mode} className="radio-option">
                    <input
                      type="radio"
                      name="lyrics"
                      value={mode}
                      checked={lyricsMode === mode}
                      onChange={(e) => setLyricsMode(e.target.value)}
                      className="radio-input"
                    />
                    <span className="radio-custom" />
                    <span className="radio-label">{mode}</span>
                  </label>
                ))}
              </div>
              {lyricsMode === 'Custom Lyrics' && (
                <textarea
                  value={lyricsContent}
                  onChange={(e) => setLyricsContent(e.target.value)}
                  className="lyrics-textarea"
                  placeholder="Write your lyrics here..."
                  rows={5}
                />
              )}
            </div>
            {/* Sliders */}
            <div className="section-card">
              <h3 className="section-title-txt">
                Tinh chỉnh
              </h3>
              <div className="sliders-grid">
                <Slider
                  value={lyricsStyleStrength}
                  onChange={setLyricsStyleStrength}
                  max={5}
                  label="Lời bài hát & Độ mạnh phong cách"
                  info="Giá trị cao hơn làm cho đầu ra tuân theo yêu cầu của bạn chặt chẽ hơn"
                />
                <Slider
                  value={balance}
                  onChange={setBalance}
                  max={1}
                  step={0.01}
                  label="Cân bằng sáng tạo"
                  info="Cân bằng giữa tính dự đoán và sự sáng tạo"
                />
                <Slider
                  value={styleStrength}
                  onChange={setStyleStrength}
                  max={2}
                  step={0.01}
                  label="Độ mạnh phong cách"
                  info="Áp dụng phong cách âm nhạc đã chọn mạnh mẽ như thế nào"
                />
              </div>
            </div>

            {/* Generate */}
            <div className="generate-section">
              <button
                className="generate-btn primary large"
                onClick={handleGenerate}
                disabled={isGenerating || !songIdea?.trim()}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner" />
                    Tạo Nhạc Của Bạn...
                  </>
                ) : (
                  <>
                    <span className="icon">🎵</span>
                    Tạo Nhạc
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Status Panel */}
        {(taskId || error) && (
          <StatusPanel
            taskId={taskId}
            status={genStatus}
            error={error}
            downloadUrl={downloadUrl}
            onRefresh={handleCheckStatus}
            onCancel={cancelPolling}
            isGenerating={isGenerating}
          />
        )}

        {/* History */}
        <HistoryList history={songHistory} onRefresh={fetchHistory} />
      </div>
    </div>
  );
};

export default MusicGenerator;
