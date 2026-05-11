import React, { useState, useEffect, useMemo, useCallback } from "react";
import { CheckoutService } from "../../services/ApiService";
import "./ModelModal.css";

const CATEGORIES = [
  "ALL", "MEME", "EXCLUSIVE", "BEAUTY", "3D", "2.5D",
  "MALE", "ANIME", "REALISTIC", "STYLE", "GAME",
  "DESIGN", "SCENERY", "BUILD"
];

export default function ModelModal({
  visible,
  onClose,
  selectedModel,
  setSelectedModel,
  maxSelections = 1,
  actionType
}) {
  const [allModels, setAllModels] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedModel, setExpandedModel] = useState(null);

  const defaultModels = useMemo(() => [
    {
      id: "",
      name: "",
      fileName: "",
      description: "",
      category: "",
      isActive: true,
      createdBy: "",
      createdAt: ""
    }
  ], []);

  const normalizeModelData = useCallback((data) => {
    if (!Array.isArray(data)) return defaultModels;
    return data.map(item => ({
      id: item.id || crypto.randomUUID(),
      name: item.name || "Unknown Model",
      fileName: item.fileName || "",
      workflowId: item.workflowId || 0,
      description: item.description || "",
      category: item.category || "UNCATEGORIZED",
      actions: String(item.actions || ""),
      imageUrl: item.imageUrl || '',
      tags: Array.isArray(item.tags) ? item.tags : [],
      isActive: item.isActive !== undefined ? item.isActive : true,
      createdBy: item.createdBy || "system",
      createdAt: item.createdAt || new Date().toISOString().split("T")[0]
    }));
  }, [defaultModels]);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CheckoutService.getAll();
      setAllModels(normalizeModelData(data.length ? data : defaultModels));
    } catch (err) {
      console.error("Failed to fetch models:", err);
      setError("Using demo data - API unavailable");
      setAllModels(normalizeModelData(defaultModels));
    } finally {
      setLoading(false);
    }
  }, [defaultModels, normalizeModelData]);

  useEffect(() => {
    if (visible) {
      fetchModels();
    }
  }, [visible, fetchModels]);

  const handleSelectModel = useCallback((model) => {
    setSelectedModel(model);
    onClose();
  }, [setSelectedModel, onClose]);

  const handleReset = useCallback(() => {
    setSearchTerm("");
    setActiveCategory("ALL");
  }, []);

  const toggleExpand = useCallback((id) => {
    setExpandedModel(prev => prev === id ? null : id);
  }, []);

  const filteredModels = useMemo(() => {
    return allModels.filter(model => {
      const actions = (model.actions || "").split(",").map(s => s.trim());
      const matchesAction = actions.includes(String(actionType));

      const matchesCategory = activeCategory === "ALL" ||
        model.category === activeCategory;

      const search = searchTerm.toLowerCase();
      const matchesSearch =
        model.name.toLowerCase().includes(search) ||
        model.fileName.toLowerCase().includes(search) ||
        model.description.toLowerCase().includes(search);

      return matchesAction && matchesCategory && matchesSearch;
    });
  }, [allModels, activeCategory, searchTerm, actionType]);


  if (!visible) return null;

  return (
    <div className="model-modal-overlay">
      <div className="model-modal-content">
        <ModalHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedModel={selectedModel}
          onClose={onClose}
          loading={loading}
        />
        <CategoryTabs
          categories={CATEGORIES}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          loading={loading}
        />
        <ModalBody
          loading={loading}
          error={error}
          filteredModels={filteredModels}
          selectedModel={selectedModel}
          expandedModel={expandedModel}
          onSelect={handleSelectModel}
          onExpand={toggleExpand}
          fetchModels={fetchModels}
        />
        <ModalFooter
          handleReset={handleReset}
          onClose={onClose}
          loading={loading}
          canReset={searchTerm !== "" || activeCategory !== "ALL"}
        />
      </div>
    </div>
  );
}

// ModalHeader
const ModalHeader = ({ searchTerm, setSearchTerm, selectedModel, onClose, loading }) => (
  <div className="modal-header">
    <div className="header-left">
      <h2>Model Library</h2>
      {selectedModel && (
        <span className="selected-model">{selectedModel.name}</span>
      )}
    </div>
    <div className="header-right">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search models..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          disabled={loading}
        />
      </div>
    </div>
    <button onClick={onClose} className="close-btn" disabled={loading}>
      <svg viewBox="0 0 24 24">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </svg>
    </button>
  </div>
);

// CategoryTabs
const CategoryTabs = ({ categories, activeCategory, setActiveCategory, loading }) => (
  <div className="category-tabs-scroll">
    <div className="category-tabs">
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
  filteredModels,
  selectedModel,
  expandedModel,
  onSelect,
  onExpand,
  fetchModels
}) => {
  if (loading) {
    return (
      <div className="loading-indicator">
        <div className="spinner"></div>
        Loading models...
      </div>
    );
  }
  if (error) {
    return (
      <div className="error-message">
        <span className="error-icon">⚠️</span>
        {error}
        <button onClick={fetchModels} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }
  if (filteredModels.length === 0) {
    return (
      <div className="empty-results">
        <span className="empty-icon">🔍</span>
        No models found
      </div>
    );
  }
  return (
    <div className="model-grid-container">
      <div className="model-grid">
        {filteredModels.map(model => (
          <ModelCard
            key={model.id}
            model={model}
            selected={selectedModel?.id === model.id}
            expanded={expandedModel === model.id}
            onSelect={onSelect}
            onExpand={onExpand}
          />
        ))}
      </div>
    </div>
  );
};

// ModalFooter
const ModalFooter = ({ handleReset, onClose, loading, canReset }) => (
  <div className="modal-footer">
    <button
      onClick={handleReset}
      className="footer-btn reset-btn"
      disabled={loading || !canReset}
    >
      Reset Filters
    </button>
    <button
      onClick={onClose}
      className="footer-btn done-btn"
      disabled={loading}
    >
      Chọn
    </button>
  </div>
);

// ModelCard
const ModelCard = ({ model, selected, expanded, onSelect, onExpand }) => {
  const [imgSrc, setImgSrc] = useState(
    model.imageUrl || `${process.env.PUBLIC_URL}/bora-logo-with-text.png`
  );
  return (
    <div className={`model-card ${selected ? "selected" : ""} ${expanded ? "expanded" : ""}`}>
      <div className="card-thumbnail" onClick={() => onSelect(model)}>
        <img
          src={imgSrc}
          alt={model.name}
          onError={() => setImgSrc(`${process.env.PUBLIC_URL}/bora-logo-with-text.png`)}
        />
        {selected && (
          <div className="selection-overlay">
            <div className="selected-check">
              <svg viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="card-info">
        <div className="card-header">
          <h3 onClick={() => onSelect(model)}>{model.name}</h3>
          <button
            className="expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              onExpand(model.id);
            }}
            aria-label={expanded ? "Collapse details" : "Expand details"}
          >
            {expanded ? "▲" : "▼"}
          </button>
        </div>
        <div className="card-meta">
          <span className="model-version">v{model.version}</span>
          <span className="model-category">{model.category}</span>
          <span className="model-base">{model.baseModel}</span>
        </div>
        {expanded && (
          <div className="card-details">
            <p>{model.description || "No description available."}</p>
            <div className="detail-row">
              <span className="detail-label">Filename:</span>
              <span className="detail-value">{model.fileName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">File Size:</span>
              <span className="detail-value">{(model.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Created By:</span>
              <span className="detail-value">{model.createdBy}</span>
            </div>
            {model.tags.length > 0 && (
              <div className="model-tags">
                <span className="detail-label">Tags:</span>
                <div className="tags-container">
                  {model.tags.map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
