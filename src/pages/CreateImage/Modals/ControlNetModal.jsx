import React, { useState, useEffect, useMemo, useCallback } from "react";
import { APIService } from "../../../services/ApiService";
import "./ControlNetModal.css";

const CATEGORIES = [
  "ALL", "Edge", "Depth", "Pose", "Segmentation", "Normal",
  "MLSD", "Scribble", "SoftEdge", "Lineart", "Shuffle"
];

export default function ControlNetModal({
  visible,
  onClose,
  selectedControlNets = [],
  setSelectedControlNets,
  maxSelections = 5,
  actionType
}) {
  const [allControlNets, setAllControlNets] = useState([]);
  const [selected, setSelected] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedControlNet, setExpandedControlNet] = useState(null);
  const [showMaxSelectionWarning, setShowMaxSelectionWarning] = useState(false);

  useEffect(() => {
    setSelected(selectedControlNets);
  }, [selectedControlNets, visible]);

  const fetchControlNets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await APIService.controlnets.getAll();
      setAllControlNets(normalizeControlNetData(data));
    } catch (err) {
      console.error("Failed to fetch ControlNets:", err);
      setError(err.message || "Failed to load ControlNets. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchControlNets();
    }
  }, [visible, activeCategory, searchTerm, fetchControlNets]);


  const normalizeControlNetData = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      id: item.id || crypto.randomUUID(),
      name: item.name || 'Unnamed ControlNet',
      description: item.description || '',
      fileName: item.fileName || '',
      category: item.category || 'OTHER',
      action: String(item.action || ""),
      isActive: item.isActive !== false,
      imageUrl: item.imageUrl || '',

      createdBy: item.createdBy || '',

    }));
  };

  // Lưu object thay vì id
  const toggleSelection = useCallback((controlNet) => {
    setSelected(prev => {
      const exists = prev.find(cn => cn.id === controlNet.id);
      if (exists) {
        return prev.filter(cn => cn.id !== controlNet.id);
      } else {
        if (prev.length >= maxSelections) {
          setShowMaxSelectionWarning(true);
          setTimeout(() => setShowMaxSelectionWarning(false), 3000);
          return prev;
        }
        return [...prev, controlNet];
      }
    });
  }, [maxSelections]);

  const handleDone = useCallback(() => {
    setSelectedControlNets(selected);
    onClose();
  }, [selected, setSelectedControlNets, onClose]);

  const handleReset = useCallback(() => {
    setSelected([]);
    setSearchTerm("");
    setActiveCategory("ALL");
  }, []);

  const toggleExpand = useCallback((id) => {
    setExpandedControlNet(prev => prev === id ? null : id);
  }, []);

  const filteredControlNets = useMemo(() => {
    return allControlNets.filter(cn => {
      const actions = (cn.action || "").split(",").map(s => s.trim());
      const matchesAction = actions.includes(String(actionType));
      const matchesCategory = activeCategory === "ALL" ||
        cn.category.split(',').some(cat =>
          cat.trim().toUpperCase() === activeCategory);
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        cn.name.toLowerCase().includes(search) ||
        cn.fileName.toLowerCase().includes(search) ||
        cn.description.toLowerCase().includes(search);
      return matchesAction && matchesCategory && matchesSearch;
    });
  }, [allControlNets, activeCategory, searchTerm, actionType]);


  if (!visible) return null;

  return (
    <div className="controlnet-modal-overlay">
      <div className="controlnet-modal-content">
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
            Maximum {maxSelections} ControlNets can be selected at once
          </div>
        )}

        <ModalBody
          loading={loading}
          error={error}
          filteredControlNets={filteredControlNets}
          allControlNets={allControlNets}
          selected={selected}
          expandedControlNet={expandedControlNet}
          toggleSelection={toggleSelection}
          toggleExpand={toggleExpand}
          fetchControlNets={fetchControlNets}
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
}

// Sub-pages
const ModalHeader = ({ searchTerm, setSearchTerm, selectedCount, onClose, loading }) => (
  <div className="controlnet-modal-header">
    <div className="header-left">
      <h2>ControlNet Library</h2>
      <span className="selected-count">{selectedCount} selected</span>
    </div>
    <div className="header-right">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search ControlNets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          disabled={loading}
        />
      </div>
    </div>
    <button onClick={onClose} className="close-btn" disabled={loading}>×</button>
  </div>
);

const CategoryTabs = ({ categories, activeCategory, setActiveCategory, loading }) => (
  <div className="controlnet-categories-scroll">
    <div className="controlnet-categories">
      {categories.map(category => (
        <button
          key={category}
          className={`category-btn ${activeCategory === category ? 'active' : ''}`}
          onClick={() => setActiveCategory(category)}
          disabled={loading}
        >
          {category}
        </button>
      ))}
    </div>
  </div>
);

const ModalBody = ({
  loading,
  error,
  filteredControlNets,
  selected,
  expandedControlNet,
  toggleSelection,
  toggleExpand,
  fetchControlNets
}) => {
  if (loading) {
    return (
      <div className="loading-indicator">
        Loading ControlNets...
      </div>
    );
  }
  if (error) {
    return (
      <div className="error-message">
        {error}
        <button onClick={fetchControlNets}>Retry</button>
      </div>
    );
  }
  if (filteredControlNets.length === 0) {
    return (
      <div className="empty-results">
        No ControlNets found.
      </div>
    );
  }
  return (
    <>
      <div className="controlnet-grid-container">
        <div className="controlnet-grid">
          {filteredControlNets.map(cn => (
            <ControlNetCard
              key={cn.id}
              controlNet={cn}
              selected={selected.some(s => s.id === cn.id)}
              expanded={expandedControlNet === cn.id}
              onToggle={toggleSelection}
              onExpand={toggleExpand}
            />
          ))}
        </div>
      </div>
      <SelectedControlNets
        selected={selected}
        onToggle={toggleSelection}
      />
    </>
  );
};

const SelectedControlNets = ({ selected, onToggle }) => (
  <div className="selected-controlnets">
    <h3>Selected ControlNets ({selected.length})</h3>
    <div className="selected-list">
      {selected.length > 0 ? (
        selected.map(cn => (
          <div key={cn.id} className="selected-item">
            <div className="selected-item-info">
              <span className="selected-item-name">{cn.name}</span>

            </div>
            <button
              onClick={() => onToggle(cn)}
              className="remove-btn"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))
      ) : (
        <div className="empty-state">No ControlNets selected</div>
      )}
    </div>
  </div>
);

const ModalFooter = ({ handleReset, handleDone, loading, selectedCount, canReset, maxSelections }) => (
  <div className="controlnet-modal-footer">
    <button
      onClick={handleReset}
      disabled={loading || !canReset}
    >
      Reset
    </button>
    <button
      onClick={handleDone}
      disabled={loading}
    >
      {selectedCount > 0 ? `Apply ${selectedCount}/${maxSelections}` : 'Chọn'}
    </button>
  </div>
);

const ControlNetCard = ({ controlNet, selected, expanded, onToggle, onExpand }) => {
  const [imgSrc, setImgSrc] = useState(
    controlNet.imageUrl || `${process.env.PUBLIC_URL}/logo512.png`
  );

  return (
    <div className={`controlnet-card ${selected ? "selected" : ""} ${expanded ? "expanded" : ""}`}>
      <div className="card-thumbnail" onClick={() => onToggle(controlNet)}>
        <img
          src={imgSrc}
          alt={controlNet.name}
          onError={() => setImgSrc(`${process.env.PUBLIC_URL}/logo512.png`)}
        />
      </div>
      <div className="card-info">
        <div className="card-header">
          <h3 onClick={() => onToggle(controlNet)}>{controlNet.name}</h3>
          <button
            className="expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              onExpand(controlNet.id);
            }}
          >
            {expanded ? "▲" : "▼"}
          </button>
        </div>
        <div className="card-meta">

          <span>{controlNet.category}</span>

        </div>
        {expanded && (
          <div className="card-details">
            <p>{controlNet.description || "No description available."}</p>
          </div>
        )}
      </div>
    </div>
  );
};
