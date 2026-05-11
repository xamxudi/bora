import React, { useState, useEffect, useMemo, useCallback } from "react";
import { LoRAService } from "../../../services/ApiService";
import "./LoRAModal.css";

const CATEGORIES = [
  "ALL", "MEME", "EXCLUSIVE", "BEAUTY", "3D", "2.5D",
  "MALE", "ANIME", "REALISTIC", "STYLE", "GAME",
  "DESIGN", "SCENERY", "BUILDINGS", "MECHA", "PHOTOGRAPHY"
];

const LoRAModal = ({
  visible,
  onClose,
  selectedLoras = [],
  setSelectedLoras,
  maxSelections = 5,
  actionType
}) => {
  const [allLoras, setAllLoras] = useState([]);
  const [selected, setSelected] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedLora, setExpandedLora] = useState(null);
  const [showMaxSelectionWarning, setShowMaxSelectionWarning] = useState(false);

  useEffect(() => {
    setSelected(selectedLoras.map(l => l.id));
  }, [selectedLoras, visible]);


  const fetchLoras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await LoRAService.getAll(
        activeCategory === "ALL" ? null : activeCategory
      );
      setAllLoras(normalizeLoraData(data));
    } catch (err) {
      console.error("Failed to fetch LoRAs:", err);
      setError(err.message || "Failed to load LoRAs. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    if (visible) {
      fetchLoras();
    }
  }, [visible, fetchLoras]);

  const normalizeLoraData = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      id: item.id || crypto.randomUUID(),
      name: item.name || 'Unnamed LoRA',
      description: item.description || '',
      fileName: item.fileName || '',
      category: item.category || 'OTHER',
      action: item.action || "",
      isActive: item.isActive !== false,
      imageUrl: item.imageUrl || '',
      createdBy: item.createdBy || '',
    }));
  };

  const toggleSelection = useCallback((id) => {
    setSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        if (prev.length >= maxSelections) {
          setShowMaxSelectionWarning(true);
          setTimeout(() => setShowMaxSelectionWarning(false), 3000);
          return prev;
        }
        return [...prev, id];
      }
    });
  }, [maxSelections]);

  const handleDone = useCallback(() => {
    const selectedDetails = allLoras.filter(l => selected.includes(l.id));
    setSelectedLoras(selectedDetails);
    onClose();
  }, [allLoras, selected, setSelectedLoras, onClose]);

  const handleReset = useCallback(() => {
    setSelected([]);
    setSearchTerm("");
    setActiveCategory("ALL");
  }, []);

  const toggleExpand = useCallback((id) => {
    setExpandedLora(prev => prev === id ? null : id);
  }, []);

  const filteredLoras = useMemo(() => {
    return allLoras.filter(lora => {
      const actions = (lora.action || "").split(",").map(s => s.trim());
      const matchesAction = actions.includes(String(actionType));
      const matchesCategory = activeCategory === "ALL" ||
        lora.category.split(',').some(cat =>
          cat.trim().toUpperCase() === activeCategory
        );
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        lora.name.toLowerCase().includes(search) ||
        lora.fileName.toLowerCase().includes(search) ||
        lora.description.toLowerCase().includes(search);
      return matchesAction && matchesCategory && matchesSearch;
    });
  }, [allLoras, activeCategory, searchTerm, actionType]);
  if (!visible) return null;

  return (
    <div className="lora-modal-overlay">
      <div className="lora-modal-content">
        <ModalHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCount={selected.length}
          onClose={onClose}
          loading={loading}
        />
        <CategoryTabs
          categories={CATEGORIES}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          loading={loading}
        />
        {showMaxSelectionWarning && (
          <div className="max-selection-warning">
            Maximum {maxSelections} LoRAs can be selected at once
          </div>
        )}
        <ModalBody
          loading={loading}
          error={error}
          filteredLoras={filteredLoras}
          allLoras={allLoras}
          selected={selected}
          expandedLora={expandedLora}
          toggleSelection={toggleSelection}
          toggleExpand={toggleExpand}
          fetchLoras={fetchLoras}
        />
        <ModalFooter
          handleReset={handleReset}
          handleDone={handleDone}
          loading={loading}
          selectedCount={selected.length}
          canReset={selected.length > 0 || searchTerm !== "" || activeCategory !== "ALL"}
          maxSelections={maxSelections}
        />
      </div>
    </div>
  );
};
// ModalHeader
const ModalHeader = ({ searchTerm, setSearchTerm, selectedCount, onClose, loading }) => (
  <div className="lora-modal-header">
    <div className="header-left">
      <h2>LoRA Library</h2>
      <span className="selected-count">{selectedCount} selected</span>
    </div>
    <div className="header-right">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search LoRAs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          disabled={loading}
        />
      </div>
      <button onClick={onClose} className="close-btn" disabled={loading}>
        <svg viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    </div>
  </div>
);

// CategoryTabs
const CategoryTabs = ({ categories, activeCategory, setActiveCategory, loading }) => (
  <div className="lora-categories-scroll">
    <div className="lora-categories">
      {categories.map(category => (
        <button
          key={category}
          className={`category-btn ${activeCategory === category ? 'active' : ''}`}
          onClick={() => setActiveCategory(category)}
          disabled={loading}
        >
          {category}
          {activeCategory === category && <span className="active-indicator"></span>}
        </button>
      ))}
    </div>
  </div>
);

// ModalBody
const ModalBody = ({
  loading,
  error,
  filteredLoras,
  allLoras,
  selected,
  expandedLora,
  toggleSelection,
  toggleExpand,
  fetchLoras
}) => {
  if (loading) {
    return (
      <div className="loading-indicator">
        <div className="spinner"></div>
        Loading LoRAs...
      </div>
    );
  }
  if (error) {
    return (
      <div className="error-message">
        <span className="error-icon">⚠️</span>
        {error}
        <button onClick={fetchLoras} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }
  if (filteredLoras.length === 0) {
    return (
      <div className="empty-results">
        <span className="empty-icon">🔍</span>
        No LoRAs found matching your criteria
      </div>
    );
  }
  return (
    <>
      <div className="lora-grid-container">
        <div className="lora-grid">
          {filteredLoras.map(lora => (
            <LoraCard
              key={lora.id}
              lora={lora}
              selected={selected.includes(lora.id)}
              expanded={expandedLora === lora.id}
              onToggle={toggleSelection}
              onExpand={toggleExpand}
            />
          ))}
        </div>
      </div>
      <SelectedLorasPanel
        selected={selected}
        allLoras={allLoras}
        onToggle={toggleSelection}
      />
    </>
  );
};

// ModalFooter
const ModalFooter = ({ handleReset, handleDone, loading, selectedCount, canReset, maxSelections }) => (
  <div className="lora-modal-footer">
    <button
      onClick={handleReset}
      className="footer-btn reset-btn"
      disabled={loading || !canReset}
    >
      Reset
    </button>
    <button
      onClick={handleDone}
      className="footer-btn done-btn"
      disabled={loading}
    >
      {selectedCount > 0 ? `Apply ${selectedCount}/${maxSelections} LoRAs` : 'Chọn'}
    </button>
  </div>
);

// SelectedLorasPanel
const SelectedLorasPanel = ({ selected, allLoras, onToggle }) => (
  <div className="selected-loras">
    <h3>Selected LoRAs ({selected.length})</h3>
    <div className="selected-list">
      {selected.length > 0 ? (
        selected.map(id => {
          const lora = allLoras.find(l => l.id === id);
          return lora ? (
            <div key={id} className="selected-item">
              <div className="selected-item-info">
                <span className="selected-item-name">{lora.name}</span>

              </div>
              <button
                onClick={() => onToggle(id)}
                className="remove-btn"
                title="Remove from selection"
              >
                ×
              </button>
            </div>
          ) : null;
        })
      ) : (
        <div className="empty-state">No LoRAs selected</div>
      )}
    </div>
  </div>
);

// LoraCard
const LoraCard = ({ lora, selected, expanded, onToggle, onExpand }) => {
  const [imgSrc, setImgSrc] = useState(
    lora.imageUrl || `${process.env.PUBLIC_URL}/logo512.png`
  );
  return (
    <div className={`lora-card ${selected ? "selected" : ""} ${expanded ? "expanded" : ""}`}>
      <div
        className="card-thumbnail"
        onClick={() => onToggle(lora.id)}
      >
        <img
          src={imgSrc}
          alt={lora.name}
          onError={() => setImgSrc(`${process.env.PUBLIC_URL}/logo512.png`)}
        />
        <div className="selection-overlay">
          {selected ? (
            <div className="selected-check">
              <svg viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          ) : (
            <div className="select-indicator">+</div>
          )}
        </div>
      </div>
      <div className="card-info">
        <div className="card-header">
          <h3 onClick={() => onToggle(lora.id)}>
            {lora.name}
          </h3>
          <button
            className="expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              onExpand(lora.id);
            }}
            aria-label={expanded ? "Collapse details" : "Expand details"}
          >
            {expanded ? "▲" : "▼"}
          </button>
        </div>
        <div className="card-meta">

          <span className="lora-category">{lora.category}</span>

        </div>
        {expanded && (
          <div className="card-details">
            <div className="lora-description">
              <p>{lora.description || "No description available."}</p>
            </div>
            <div className="detail-row">
              <span className="detail-label">Filename:</span>
              <span className="detail-value">{lora.fileName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Resolution:</span>

            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default LoRAModal;
