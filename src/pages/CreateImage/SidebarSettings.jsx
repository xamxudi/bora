import React, { useState, useEffect } from "react";
import LoRAModal from "./Modals/LoRAModal";
import ModelModal from "../../components/MediaGeneration/ModelModal";
import ControlNetModal from "./Modals/ControlNetModal";
import StylePicker from "../../components/Styles/StylePicker";
import "./SidebarSettings.css";
import { VAEsService, ControlNetService, LoRAService } from "../../services/ApiService";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useUIMode } from "../../contexts/UIModeContext";

import PhotoPairUpload from "../../components/MediaGeneration/PhotoPairUpload";

const DEFAULT_THUMBNAIL = `${process.env.PUBLIC_URL}/bora-logo-with-text.png`;

export default function SidebarSettings({
  model,
  setModel,
  loraName = [],
  setLoraName,
  selectedControlNets,
  setSelectedControlNets,
  controlNetStrengths,
  setControlNetStrengths,
  vae,
  setVae,
  setActionType,
  setPromtyStyle,
  applyStyleParams,
  inputImages = [null],
  setInputImages,
}) {
  const { uiMode } = useUIMode();
  const navigate = useNavigate();
  const location = useLocation();

  
  // Tab & actionType
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("type") || "text2img";
  });
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabType = params.get("type") || "text2img";
    setActiveTab(tabType);
    setActionType(tabType === "img2img" ? 2 : 1);
    
    setModel(tabType === "img2img" ? {
        "id": 10,
        "name": "Nano Banana",
        "fileName": "google/nano-banana",
        "workflowId": 5,
        "description": "ALL Style",
        "category": "Change Image",
        "actions": "2",
        "imageUrl": "https://resource.sendenvn.com/images/art/nano-banana.png"
    }: {
        "id": 7,
        "name": "Flux 1.1 Pro",
        "fileName": "black-forest-labs/flux-1.1-pro",
        "workflowId": 0,
        "description": "All style",
        "category": "Style",
        "actions": "1",
        "imageUrl": "https://resource.sendenvn.com/images/art/flux1-pro.png"
    })

  }, [location.search, setActionType]);

  const handleTabClick = (tabType) => {
    navigate(`/generate/image?type=${tabType}`);
  };

  // Style đã chọn (id) cho StylePicker
  const [selectedStyleId, setSelectedStyleId] = useState("");

  // Modals
  const [showLoraModal, setShowLoraModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showControlNetModal, setShowControlNetModal] = useState(false);

  // Datasets
  const [availableControlNets, setAvailableControlNets] = useState([]);
  const [loadingControlNets, setLoadingControlNets] = useState(true);

  const [availableVAEs, setAvailableVAEs] = useState([]);
  const [loadingVAEs, setLoadingVAEs] = useState(true);

  // Load ControlNets
  useEffect(() => {
    (async () => {
      try {
        const data = await ControlNetService.getAll(0, 100);
        const controlnets = Array.isArray(data) ? data : data?.items || [];
        setAvailableControlNets(
          controlnets.map((it) => ({
            ...it,
            imageUrl: it.imageUrl || DEFAULT_THUMBNAIL,
          }))
        );
      } catch (e) {
        console.error("Failed to load ControlNets:", e);
        setAvailableControlNets([]);
      } finally {
        setLoadingControlNets(false);
      }
    })();
  }, []);

  // Load VAEs
  useEffect(() => {
    (async () => {
      try {
        const data = await VAEsService.getAll(0, 100);
        const vaes = Array.isArray(data) ? data : data?.items || [];
        setAvailableVAEs(vaes);
      } catch (e) {
        console.error("Failed to load VAEs:", e);
        setAvailableVAEs([]);
      } finally {
        setLoadingVAEs(false);
      }
    })();
  }, []);

  // LoRA strength / remove
  const handleLoraStrengthChange = (id, value) => {
    setLoraName((prev) =>
      prev.map((l) => (l.id === id ? { ...l, strength: parseFloat(value) } : l))
    );
  };
  const handleRemoveLora = (id) =>
    setLoraName((prev) => prev.filter((l) => l.id !== id));

  // ControlNet strength / remove
  const handleControlNetStrengthChange = (id, value) =>
    setControlNetStrengths((prev) => ({ ...prev, [id]: parseFloat(value) }));
  const handleRemoveControlNet = (id) => {
    setSelectedControlNets((prev) => prev.filter((x) => x.id !== id));
    setControlNetStrengths((prev) => {
      const cp = { ...prev };
      delete cp[id];
      return cp;
    });
  };

  // Vá thiếu fileName cho LoRA
  useEffect(() => {
    const missing = loraName.filter((l) => l.id != null && !l.fileName);
    if (!missing.length) return;
    (async () => {
      try {
        const fulls = await Promise.all(
          missing.map((l) => LoRAService.getById(l.id).catch(() => null))
        );
        setLoraName((prev) =>
          prev.map((l) => {
            const f = fulls.find((x) => x && x.id === l.id);
            return f && !l.fileName
              ? {
                ...l,
                fileName: f.fileName || "",
                name: l.name || f.name || f.fileName || `LoRA #${l.id}`,
                imageUrl: l.imageUrl || f.imageUrl || DEFAULT_THUMBNAIL,
              }
              : l;
          })
        );
      } catch { }
    })();
  }, [loraName, setLoraName]);

  // Vá thiếu fileName cho ControlNet
  useEffect(() => {
    const missing = selectedControlNets.filter((c) => c.id != null && !c.fileName);
    if (!missing.length) return;
    (async () => {
      try {
        const fulls = await Promise.all(
          missing.map((c) => ControlNetService.getById(c.id).catch(() => null))
        );
        setSelectedControlNets((prev) =>
          prev.map((c) => {
            const f = fulls.find((x) => x && x.id === c.id);
            return f && !c.fileNamea
              ? {
                ...c,
                fileName: f.fileName || "",
                name: c.name || f.name || f.fileName || `ControlNet #${c.id}`,
                imageUrl: c.imageUrl || f.imageUrl || DEFAULT_THUMBNAIL,
              }
              : c;
          })
        );
      } catch { }
    })();
  }, [selectedControlNets, setSelectedControlNets]);

  return (
    <div className="settings-box">
      {/* Tabs */}
      <div className="mode-tabs">
        <button
          className={`tab generate-type ${activeTab === "text2img" ? "active" : ""}`}
          onClick={() => handleTabClick("text2img")}
        >
          Tạo hình ảnh
        </button>
        <button
          className={`tab generate-type ${activeTab === "img2img" ? "active" : ""}`}
          onClick={() => handleTabClick("img2img")}
        >
          Sửa hình ảnh
        </button>
      </div>

      {activeTab === "img2img" && (
        <PhotoPairUpload
          mode={inputImages.length > 1 ? "double" : "single"} // hoặc "single"
          initial={inputImages} // có thể truyền URL ảnh ban đầu
          allowSwap={true}
          labels={inputImages.length > 1 ? ["", "" ] : [""]}
          onChange={(imgs) => setInputImages(imgs)}
        />
      )}
      
      {/* Styles (Basic) */}
      <StylePicker
        visible={uiMode === "basic"}
        value={selectedStyleId}
        actionType={activeTab === "text2img" ? 1 : 2}
        model={model}
        onChange={(id) => setSelectedStyleId(String(id || ""))}
        onApply={({
          model: m,
          loras = [],
          controlNets = [],
          controlNetStrengths: strengths = {},
          style,
          ...params
        }) => {
          if (m && m.id) {
            setModel({
              ...m,
              workflowId: m.workflowId ?? 0,
            });
          }

          if (loras.length) {
            setLoraName(loras);
          }

          if (controlNets.length) {
            setSelectedControlNets(controlNets);
          }

          if (Object.keys(strengths).length > 0) {
            setControlNetStrengths(strengths);
          }
          // Prompt style
          setPromtyStyle(style?.description ? `, ${style.description}` : "");
          // Style id
          setSelectedStyleId(style?.id ? String(style.id) : "");
          if (Object.keys(params).length > 0) {
            applyStyleParams(params);
          }
        }}
        placeholder="Chọn mẫu..."
      />
      {/* Advanced Mode */}
      {uiMode === "advanced" && (
        <>
          {/* Models */}
          <div className="model-section" >
            <h3>Models</h3>
            <div className="model-selected-item">
              <img
                src={model?.imageUrl || DEFAULT_THUMBNAIL}
                alt={model?.name}
                onError={(e) => (e.currentTarget.src = DEFAULT_THUMBNAIL)}
              />
              <div className="model-info">
                <strong>{model?.name}</strong>
                <button className="change-model-btn" onClick={() => setShowModelModal(true)}>
                  Chọn Model
                </button>
              </div>
            </div>
            <div className="model-buttons-row hidden">
              <button className="add-btn" onClick={() => setShowLoraModal(true)}>Thêm LoRA</button>
              <button className="add-btn-controlnet" onClick={() => setShowControlNetModal(true)}>Thêm ControlNet</button>
            </div>
          </div>

          {/* LoRAs */}
          {loraName.length > 0 && (
            <div className="lora-section">
              <div className="section-header"><h3>LoRAs</h3></div>
              <div className="lora-selected-list">
                {loraName.map((lora) => (
                  <div key={lora.id} className="lora-item">
                    <img
                      src={lora.imageUrl || DEFAULT_THUMBNAIL}
                      alt={lora.name}
                      onError={(e) => (e.currentTarget.src = DEFAULT_THUMBNAIL)}
                    />
                    <div className="lora-info">
                      <div className="lora-title">
                        <strong>{lora.name}</strong>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveLora(lora.id)}
                          title="Remove LoRA"
                        >
                          ×
                        </button>
                      </div>
                      <div className="lora-controls">
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.05"
                          value={lora.strength ?? 0.8}
                          onChange={(e) => handleLoraStrengthChange(lora.id, e.target.value)}
                        />
                        <span className="strength-value">
                          {(lora.strength ?? 0.8).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ControlNets */}
          {!loadingControlNets && selectedControlNets.length > 0 && (
            <div className="controlnet-section">
              <div className="section-header"><h3>ControlNets</h3></div>
              <div className="controlnet-selected-list">
                {selectedControlNets.map((cn) => (
                  <div key={cn.id} className="controlnet-item">
                    <img
                      src={cn.imageUrl || DEFAULT_THUMBNAIL}
                      alt={cn.name}
                      onError={(e) => (e.currentTarget.src = DEFAULT_THUMBNAIL)}
                    />
                    <div className="controlnet-info">
                      <div className="controlnet-title">
                        <strong>{cn.name}</strong>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveControlNet(cn.id)}
                          title="Remove ControlNet"
                        >
                          ×
                        </button>
                      </div>
                      <div className="controlnet-controls">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={controlNetStrengths[cn.id] || 1.0}
                          onChange={(e) => handleControlNetStrengthChange(cn.id, e.target.value)}
                        />
                        <span className="strength-value">
                          {(controlNetStrengths[cn.id] || 1.0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VAE */}
          <div className="vae-section">
            <h3>VAE</h3>
            {loadingVAEs ? (
              <div className="loading-state">Loading VAEs...</div>
            ) : (
              <select
                className="vae-select"
                value={vae?.fileName || ""}
                onChange={(e) => {
                  const selectedFileName = e.target.value;
                  if (!selectedFileName) return setVae({ id: "", fileName: "" });
                  const sel = availableVAEs.find((v) => v.fileName === selectedFileName);
                  if (sel) setVae({ id: String(sel.id), fileName: sel.fileName });
                }}
              >
                <option value="">Không có</option>
                {availableVAEs.map((v) => (
                  <option key={v.id} value={v.fileName}>
                    {v.name || v.fileName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <LoRAModal
        visible={uiMode === "advanced" && showLoraModal}
        onClose={() => setShowLoraModal(false)}
        selectedLoras={loraName}
        setSelectedLoras={(newLoras) =>
          setLoraName(
            newLoras.map((l) => ({
              ...l,
              strength: l.strength ?? 0.8,
              imageUrl: l.imageUrl || DEFAULT_THUMBNAIL,
              fileName: l.fileName || l?.file_name || "",
            }))
          )
        }
        actionType={activeTab === "text2img" ? 1 : 2}
      />
      <ModelModal
        visible={uiMode === "advanced" && showModelModal}
        onClose={() => setShowModelModal(false)}
        selectedModel={model}
        setSelectedModel={setModel}
        actionType={activeTab === "text2img" ? 1 : 2}
      />
      <ControlNetModal
        visible={uiMode === "advanced" && showControlNetModal}
        onClose={() => setShowControlNetModal(false)}
        selectedControlNets={selectedControlNets}
        setSelectedControlNets={(nets) =>
          setSelectedControlNets(
            nets.map((n) => ({
              ...n,
              fileName: n.fileName || n?.file_name || "",
              imageUrl: n.imageUrl || DEFAULT_THUMBNAIL,
            }))
          )
        }
        availableControlNets={availableControlNets}
        setAvailableControlNets={setAvailableControlNets}
        actionType={activeTab === "text2img" ? 1 : 2}
      />
    </div>
  );
}
