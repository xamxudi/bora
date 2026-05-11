import React, { useState } from 'react';
import './ParameterSettings.css';

const THEMES = [
  { name: 'Fast', image: '/images/themes/fast.jpg' },
  { name: 'Anime', image: '/images/themes/anime.jpg' },
  { name: 'Realistic', image: '/images/themes/realistic.jpg' },
  { name: '2.5D', image: '/images/themes/2.5d.jpg' },
  { name: 'Standard', image: '/images/themes/standard.jpg' },
];

const ParameterSettings = () => {
  const [selectedTheme, setSelectedTheme] = useState('Fast');
  const [repeat, setRepeat] = useState(4);
  const [epoch, setEpoch] = useState(20);
  const [triggerWords, setTriggerWords] = useState('');
  const [previewPrompt, setPreviewPrompt] = useState('1girl');
  const [queueType, setQueueType] = useState('regular');

  return (
    <div className="parameter-settings">
      <div className="header">
        <h2>Parameter Settings</h2>
        <div className="header-buttons">
          <button className="restore-btn">Restore Default</button>
          <button className="pro-btn">Professional Mode</button>
        </div>
      </div>

      {/* Model Theme */}
      <div className="model-theme">
        {THEMES.map(theme => (
          <div
            key={theme.name}
            className={`theme-card ${selectedTheme === theme.name ? 'selected' : ''}`}
            onClick={() => setSelectedTheme(theme.name)}
          >
            <img src={"/bora-logo-with-text.png"} alt={theme.name} className="theme-image" />
            <div className="theme-name">{theme.name}</div>
            {selectedTheme === theme.name && <div className="theme-check">✔</div>}
          </div>
        ))}
      </div>

      {/* Base Model */}
      <div className="base-model-select">
        <label>Use Base Model</label>
        <select value="FLUX Fast" disabled>
          <option>FLUX Fast</option>
        </select>
      </div>

      {/* Repeat and Epoch Sliders */}
      <div className="sliders">
        <div className="slider-group">
          <label>Repeat</label>
          <input
            type="range"
            min="1"
            max="10"
            value={repeat}
            onChange={(e) => setRepeat(parseInt(e.target.value))}
          />
          <span>{repeat}</span>
        </div>
        <div className="slider-group">
          <label>Epoch</label>
          <input
            type="range"
            min="1"
            max="50"
            value={epoch}
            onChange={(e) => setEpoch(parseInt(e.target.value))}
          />
          <span>{epoch}</span>
        </div>
      </div>

      {/* Repetitions Info */}
      <div className="info-text">
        Total Repetitions Per Image: {repeat * epoch}; Total Steps: 0
      </div>

      {/* Trigger Words */}
      <div className="input-group">
        <label>Trigger words</label>
        <input
          type="text"
          value={triggerWords}
          placeholder="Enter trigger words..."
          onChange={(e) => setTriggerWords(e.target.value)}
        />
      </div>

      {/* Model Effect Preview Prompt */}
      <div className="input-group">
        <label>Model Effect Preview Prompt</label>
        <textarea
          value={previewPrompt}
          onChange={(e) => setPreviewPrompt(e.target.value)}
        />
      </div>

      {/* Queue Selection */}
      <div className="queue-selection">
        <button
          className={`queue-btn ${queueType === 'regular' ? 'active' : ''}`}
          onClick={() => setQueueType('regular')}
        >
          Regular Queue
        </button>
        <button
          className={`queue-btn ${queueType === 'priority' ? 'active' : ''}`}
          onClick={() => setQueueType('priority')}
        >
          Priority Queue
        </button>
      </div>

      {/* Start Training */}
      <div className="start-training">
        <button className="start-btn">Start Training Now</button>
        <div className="credits">
          <span>⚡ Remaining: 5.90 – </span>
          <a href='/coming-soon'>Get more credits</a>
        </div>
      </div>
    </div>
  );
};

export default ParameterSettings;
