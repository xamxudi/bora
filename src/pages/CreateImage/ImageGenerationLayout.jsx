import React from "react";
import { useGenerationState } from "../../hooks/useGenerationState";
import View from "../../components/layout/View";

const SidebarSettings = React.lazy(() => import("./SidebarSettings"));
const AdvancedOptions = React.lazy(() => import("./AdvancedOptions"));
const GenerationPanel = React.lazy(() => import("../../components/MediaGeneration/GenerationPanel"));

export default function ImageGenerationLayout() {
    // Sử dụng custom hook để quản lý tất cả states
    const {
        // Image generation states
        steps, setSteps,
        cfg, setCfg,
        seed, setSeed,
        width, setWidth,
        height, setHeight,
        samplingMethod, setSamplingMethod,
        clipEncoder, setClipEncoder,
        inputImages, setInputImages,
        actionType, setActionType,
        promtyStyle, setPromtyStyle,
        // Model states
        baseModel, setBaseModel,

        // LoRA and ControlNet states
        loras, setLoras,
        selectedControlNets, setSelectedControlNets,
        controlNetStrengths, setControlNetStrengths,
        vae, setVae,

        // Helper functions
        handleTransferToActionType,
        applyStyleParams
    } = useGenerationState();
    return (
        <View>
            <div className="generate-layout">
                <div className="generate-sidebar" style={{ width: "35%" }}>
                    <SidebarSettings
                        model={baseModel}
                        setModel={setBaseModel}
                        loraName={loras}
                        setLoraName={setLoras}
                        selectedControlNets={selectedControlNets}
                        setSelectedControlNets={setSelectedControlNets}
                        controlNetStrengths={controlNetStrengths}
                        setControlNetStrengths={setControlNetStrengths}
                        vae={vae}
                        setVae={setVae}
                        inputImages={inputImages}
                        setInputImages={setInputImages}
                        setActionType={setActionType}
                        setPromtyStyle={setPromtyStyle}
                        applyStyleParams={applyStyleParams}
                    />
                    <AdvancedOptions
                        steps={steps}
                        setSteps={setSteps}
                        cfg={cfg}
                        setCfg={setCfg}
                        seed={seed}
                        setSeed={setSeed}
                        width={width}
                        setWidth={setWidth}
                        height={height}
                        setHeight={setHeight}
                        samplingMethod={samplingMethod}
                        setSamplingMethod={setSamplingMethod}
                        clipEncoder={clipEncoder}
                        setClipEncoder={setClipEncoder}
                        baseModel={baseModel}
                        loras={loras}
                        controlNets={selectedControlNets.map((cn) => ({
                            id: cn.id,
                            fileName: cn.fileName,
                            strength: controlNetStrengths[cn.id] ?? 1.0
                        }))}
                        vae={vae}
                        actionType={actionType}
                        onTransferToActionType={handleTransferToActionType}
                    />
                </div>
                <GenerationPanel
                    steps={steps}
                    cfg={cfg}
                    seed={seed}
                    width={width}
                    height={height}
                    samplingMethod={samplingMethod}
                    clipEncoder={clipEncoder}
                    baseModel={baseModel}
                    loras={loras}
                    controlNets={selectedControlNets.map((cn) => ({
                        id: cn.id,
                        fileName: cn.fileName,
                        strength: controlNetStrengths[cn.id] ?? 1.0
                    }))}
                    vae={vae}
                    imageFiles={inputImages}
                    actionType={actionType}
                    promtyStyle={promtyStyle}
                    onTransferToActionType={handleTransferToActionType}
                />
            </div>
        </View>
    );
}