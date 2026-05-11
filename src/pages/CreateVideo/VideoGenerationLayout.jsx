import React from "react";
import { useGenerationState } from "../../hooks/useGenerationState";
import View from "../../components/layout/View";

const SidebarSettingVideo = React.lazy(() => import("./SidebarSettingVideo"));
const AdvancedOptionVideo = React.lazy(() => import("./AdvancedOptionVideo"));
const GenerationPanel = React.lazy(() => import("../../components/MediaGeneration/GenerationPanel"));

export default function VideoGenerationLayout() {
  // Sử dụng custom hook để quản lý tất cả states
  const {
    // Image generation states (cũng dùng cho video)
    steps, setSteps,
    cfg, setCfg,
    seed, setSeed,
    inputImages, setInputImages,
    actionType, setActionType,
    promtyStyle, setPromtyStyle,

    // Model states
    baseModel, setBaseModel,

    // LoRA and ControlNet states
    loras, setLoras,
    // Video-specific states
    resolution, setResolution,
    duration, setDuration,
    fps, setFps,
    quality, setQuality,

    // Helper functions
    handleTransferToActionType,
    applyStyleParams
  } = useGenerationState();

  return (
    <View>
      <div className="generate-layout">
        <div className="generate-sidebar" style={{width: "35%"}}>
          <SidebarSettingVideo
            model={baseModel}
            setModel={setBaseModel}
            loraName={loras}
            setLoraName={setLoras}
            inputImages={inputImages}
            setInputImages={setInputImages}
            setActionType={setActionType}
            setPromtyStyle={setPromtyStyle}
            applyStyleParams={applyStyleParams}
            uiMode=""
          />
          <AdvancedOptionVideo
            steps={steps}
            setSteps={setSteps}
            cfg={cfg}
            setCfg={setCfg}
            seed={seed}
            setSeed={setSeed}
            resolution={resolution}
            setResolution={setResolution}
            duration={duration}
            setDuration={setDuration}
            fps={fps}
            setFps={setFps}
            quality={quality}
            setQuality={setQuality}
            baseModel={baseModel}
            loras={loras}
            actionType={actionType}
            onTransferToActionType={handleTransferToActionType}
          />
        </div>
        <GenerationPanel
          steps={steps}
          cfg={cfg}
          seed={seed}
          resolution={resolution}
          duration={duration}
          fps={fps}
          quality={quality}
          baseModel={baseModel}
          loras={loras}
          imageFiles={inputImages}
          actionType={actionType}
          promtyStyle={promtyStyle}
          onTransferToActionType={handleTransferToActionType}
        />
      </div>
    </View>
  );
}
