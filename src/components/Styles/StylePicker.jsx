import React, { useEffect, useMemo, useState } from "react";
import StyleSelect from "./StyleSelect";
import {
  StyleService,
  CheckoutService,
  LoRAService,
  ControlNetService,
} from "../../services/ApiService";

const DEFAULT_THUMBNAIL = `${process.env.PUBLIC_URL}/bora-logo-with-text.png`;

export default function StylePicker({
  visible = true,
  value = "",
  actionType,
  model,
  onChange,
  onApply,
  placeholder = "Chọn Mẫu..."
}) {
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(value);

  useEffect(() => setSelectedId(value), [value]);
  useEffect(() => {
    (async () => {
      try {
        const data = await StyleService.getAll(0, 200);
        const items = Array.isArray(data) ? data : data?.items || [];
        setStyles(items);
      } catch (e) {
        console.error("[StylePicker] load styles failed:", e);
        setStyles([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // lọc styles theo actions + model
  const filteredStyles = useMemo(() => {
    return styles.filter((s) => {
      const actions = (s.actions || "").toString().split(",").map(a => a.trim());
      const matchesAction = actions.includes(String(actionType));

      const matchesModel = !model?.id || !s.modelId || String(s.modelId) === String(model.id);

      return matchesAction && matchesModel;
    });
  }, [styles, actionType, model]);

  const handleChange = async (id) => {
    setSelectedId(id);
    onChange?.(id);

    if (!id) {
      onApply?.({ style: null });
      return;
    }

    const style = styles.find((s) => String(s.id) === String(id));
    if (!style) return;

    try {
      const payload = { style };

      // -------- MODEL --------
      if (style.checkoutId) {
        try {
          const ck = await CheckoutService.getById(style.checkoutId);
          if (ck) {
            payload.model = {
              id: ck.id,
              name: ck.name || ck.fileName || `Model #${ck.id}`,
              fileName: ck.fileName || "",
              imageUrl: ck.imageUrl || DEFAULT_THUMBNAIL,
              workflowId: ck.workflowId ?? 0,

            };
          }
        } catch { }
      } else if (style.modelId || style.modelName) {
        payload.model = {
          id: style.modelId ?? "",
          name: style.modelName ?? style.modelFileName ?? "Model",
          fileName: style.modelFileName ?? "",
          imageUrl: style.modelImageUrl || DEFAULT_THUMBNAIL,
        };
      }

      // -------- LORAS --------
      if (style.loraId) {
        try {
          const l = await LoRAService.getById(style.loraId);
          if (l) {
            payload.loras = [
              {
                id: l.id,
                name: l.name || l.fileName || `LoRA #${l.id}`,
                fileName: l.fileName || "",
                strength: style.loraStrength ?? 0.8,
                imageUrl: l.imageUrl || DEFAULT_THUMBNAIL,
              },
            ];
          }
        } catch { }
      }

      // -------- CONTROLNET --------
      if (style.controlnetId) {
        try {
          const cn = await ControlNetService.getById(style.controlnetId);
          if (cn) {
            payload.controlNets = [
              {
                id: cn.id,
                name: cn.name || cn.fileName || `ControlNet #${cn.id}`,
                fileName: cn.fileName || "",
                imageUrl: cn.imageUrl || DEFAULT_THUMBNAIL,
              },
            ];
            payload.controlNetStrengths = {
              [cn.id]: style.controlnetStrength ?? 1.0,
            };
          }
        } catch { }
      }

      // -------- PARAMS OVERRIDE --------
      if (style.steps != null) payload.steps = style.steps;
      if (style.cfg != null) payload.cfg = style.cfg;
      if (style.sampler) payload.sampler = style.sampler;
      if (style.width) payload.width = style.width;
      if (style.height) payload.height = style.height;

      // -------- GỌI onApply --------
      onApply?.(payload);
    } catch (err) {
      console.error("[StylePicker] apply style failed:", err);
    }
  };


  if (!visible) 
    return;

  if (loading) 
    return <div className="loading-state">Đang tải mẫu...</div>;

  return (
    <div className="styles-section" style={{ marginTop: 12 }}>
      <h3>Các mẫu</h3>
      {loading ? (
        <div className="loading-state">Đang tải mẫu...</div>
      ) : (
        <StyleSelect
          items={filteredStyles}
          value={selectedId}
          onChange={handleChange}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
