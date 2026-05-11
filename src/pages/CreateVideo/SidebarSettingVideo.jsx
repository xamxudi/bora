import React, { useState, useEffect } from "react";
import "./SidebarSettingsVideo.css";
import StylePicker from "../../components/Styles/StylePicker";
import {
  LoRAService,
} from "../../services/ApiService";
import { useNavigate, useLocation } from "react-router-dom";
import { useUIMode } from "../../contexts/UIModeContext";
import PhotoPairUpload from "../../components/MediaGeneration/PhotoPairUpload";

const ModelModal = React.lazy(() => import("../../components/MediaGeneration/ModelModal"));
const DEFAULT_THUMBNAIL = `${process.env.PUBLIC_URL}/bora-logo-with-text.png`;

export default function SidebarSettings({
  model,
  setModel,
  loraName = [],
  setLoraName,
  inputImages = [null],
  setInputImages,
  setActionType,
  applyStyleParams,
  setPromtyStyle
}) {
  const { uiMode } = useUIMode();

  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedStyleId, setSelectedStyleId] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("type") || "text2video";
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabType = params.get("type") || "text2video";
    setActiveTab(tabType);

    switch (tabType) {
      case "img2video":
        setActionType(4);
        setModel({
            "id": 2,
            "name": "Kling v2.1",
            "fileName": "kwaivgi/kling-v2.1",
            "workflowId": 0,
            "description": "ALL Style",
            "category": "Video",
            "actions": "4",
            "imageUrl": "https://resource.sendenvn.com/images/art/kling.png"
        })
        break;
      default:
        setActionType(3);
        setModel({
            "id": 9,
            "name": "Kling v1.6 standard",
            "fileName": "kwaivgi/kling-v1.6-standard",
            "workflowId": 0,
            "description": "ALL Style",
            "category": "Video",
            "actions": "3",
            "imageUrl": "https://resource.sendenvn.com/images/art/kling.png"
        })
        break;
    }
  }, [location.search, setActionType]);

  const handleTabClick = (tabType) => {
    navigate(`/generate/video?type=${tabType}`);
  };

  const handleImageError = (e, fallback) => (e.target.src = fallback);

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
      } catch {
        /* noop */
      }
    })();
  }, [loraName, setLoraName]);

  return (
    <div className="settings-box">
      {/* Tabs */}
      <div className="mode-tabs">
        <button
          className={`tab generate-type ${activeTab === "text2video" ? "active" : ""}`}
          onClick={() => handleTabClick("text2video")}
        >
          Tạo video
        </button>
        <button
          className={`tab generate-type ${activeTab === "img2video" ? "active" : ""}`}
          onClick={() => handleTabClick("img2video")}
        >
          Tạo video từ ảnh
        </button>
      </div>

      {/* Image Upload (Img2Video) */}
      {activeTab === "img2video" && (
        <PhotoPairUpload
          mode={inputImages.length > 1 ? "double" : "single"} // hoặc "single"
          initial={inputImages} // có thể truyền URL ảnh ban đầu
          allowSwap={true}
          labels={inputImages.length > 1 ? ["Ảnh bắt đầu", "Ảnh kết thúc" ] : ["Ảnh"]}
          onChange={(imgs) => setInputImages(imgs)}
        />
        )}

      {/* Styles (Basic) */}
      {uiMode === "basic" && (
        <div className="styles-section" style={{ marginTop: 12 }}>
            <StylePicker
              visible={uiMode === "basic"}
              value={selectedStyleId}
              actionType={activeTab === "text2video" ? 3 : 4}
              model={model}
              onChange={(id) => setSelectedStyleId(String(id || ""))}
              onApply={({ model: m, loras = [], controlNets = [], controlNetStrengths: strengths = {}, style, ...params }) => {
                if (m && m.id) {
                  setModel({
                    ...m,
                    workflowId: m.workflowId ?? 0,
                  });
                }
                setPromtyStyle(style?.description ? `, ${style.description}` : "");
                setSelectedStyleId(style?.id ? String(style.id) : "");
                if (Object.keys(params).length > 0) {
                  applyStyleParams(params);
                }
              }}
              placeholder="Chọn mẫu..."
            />
          
        </div>
      )}

      {/* Models / LoRAs (Advanced) */}
      {uiMode === "advanced" && (
        <>
          <div className="model-section">
            <h3>Models</h3>
            <div className="model-selected-item">
              <img
                src={model?.imageUrl || DEFAULT_THUMBNAIL}
                alt={model?.name}
                onError={(e) => handleImageError(e, DEFAULT_THUMBNAIL)}
              />
              <div className="model-info">
                <strong>{model?.name}</strong>
                <button className="change-model-btn" onClick={() => setShowModelModal(true)}>
                  Chọn Model
                </button>
              </div>
            </div>
          </div>

        </>
      )}

      <ModelModal
        visible={uiMode === "advanced" && showModelModal}
        onClose={() => setShowModelModal(false)}
        selectedModel={model}
        setSelectedModel={setModel}
        actionType={String(activeTab === "text2video" ? "3" : "4")}
      />
    </div>
  );
}
