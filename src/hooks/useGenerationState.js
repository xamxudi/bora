import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BuildParamService } from "../services/ApiService";

export const useGenerationState = () => {
  const navigate = useNavigate();

  // Image generation states
  const [steps, setSteps] = useState(20);
  const [cfg, setCfg] = useState(5);
  const [seed, setSeed] = useState("");
  const [width, setWidth] = useState(768);
  const [height, setHeight] = useState(1024);
  const [samplingMethod, setSamplingMethod] = useState("euler");
  const [clipEncoder, setClipEncoder] = useState("None");
  const [inputImages, setInputImages] = useState([null]);
  const [actionType, setActionType] = useState(1);
  const [promtyStyle, setPromtyStyle] = useState("");

  // Model states
  const [baseModel, setBaseModel] = useState({
    id: 7,
    name: "Flux Pro 1.1",
    imageUrl: `${process.env.PUBLIC_URL}/bora-logo-with-text.png`,
  });

  const [baseModelVideo, setBaseModelVideo] = useState({
    id: 2,
    name: "Kling v2.1",
    imageUrl: `${process.env.PUBLIC_URL}/bora-logo-with-text.png`,
  });

  const [loras, setLoras] = useState([]);
  const [selectedControlNets, setSelectedControlNets] = useState([]);
  const [controlNetStrengths, setControlNetStrengths] = useState({});
  const [vae, setVae] = useState({ id: "", fileName: "" });

  const [resolution, setResolution] = useState("480x832");
  const [duration, setDuration] = useState("5");
  const [fps, setFps] = useState("16");
  const [quality, setQuality] = useState("Standard");

  // Effect to update video model based on action type
  useEffect(() => {
    if (actionType === 4) {
      setBaseModelVideo((prev) => ({
        ...prev,
        name: "Kling v2.1",
        id: 2,
      }));
    } else if (actionType === 3) {
      setBaseModelVideo((prev) => ({
        ...prev,
        name: "Kling v1.6",
        id: 9,
      }));
    }
  }, [actionType]);

  // Effect to fetch params when base model changes
  useEffect(() => {
    const fetchData = async () => {
      if (baseModel?.workflowId > 0) {
        try {
          const params = await BuildParamService.getByWorkflowId(
            baseModel.workflowId
          );
          if (params) {
            if (params.steps != null) setSteps(Number(params.steps));
            if (params.sampler != null) setSamplingMethod(params.sampler);
            if (params.cfg != null) setCfg(Number(params.cfg));
            if (params.width != null) setWidth(Number(params.width));
            if (params.height != null) setHeight(Number(params.height));
            if (params.seed != null && params.seed !== "")
              setSeed(String(params.seed));
            if (params.clipEncoder != null) setClipEncoder(params.clipEncoder);
            
            if (params.images != null)  setInputImages(Array.from({ length: Number(params.images) }, () => null));
          }
        } catch (error) {
          console.error("Failed to fetch params:", error);
        }
      }
    };
    fetchData();
  }, [baseModel?.workflowId, baseModel?.id, baseModel?._updatedAt]);

  const applyStyleParams = (params = {}) => {
    // Image params
    if (params.steps != null) setSteps(Number(params.steps));
    if (params.cfg != null) setCfg(Number(params.cfg));
    if (params.sampler != null) setSamplingMethod(params.sampler);
    if (params.width != null) setWidth(Number(params.width));
    if (params.height != null) setHeight(Number(params.height));
    if (params.seed != null && params.seed !== "") setSeed(String(params.seed));
    if (params.clipEncoder != null) setClipEncoder(params.clipEncoder);

    // Video params
    if (params.resolution != null) setResolution(params.resolution);
    if (params.duration != null) setDuration(String(params.duration));
    if (params.fps != null) setFps(String(params.fps));
    if (params.quality != null) setQuality(params.quality);
    if (params.height != null) setHeight(params.height);
    if (params.width != null) setWidth(params.width);
    // Model
    if (params.model != null) {
      if (actionType === 1 || actionType === 2) {
        setBaseModel(params.model);
      } else {
        setBaseModelVideo(params.model);
      }
    }
  };

  // Helper function to handle input image setting
  const handleSetInputImage = async (source) => {
    if (source === null) {
      setInputImages(null);
      return;
    }
    const newImages = [...inputImages];
    let index = newImages[0] == null ? 0: 1;
    if (source instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages[index]  = {
          file: null,
          base64: reader.result,
        };
        setInputImages(newImages);
      };
      reader.readAsDataURL(source);
    } else if (
      typeof source === "string" &&
      (source.startsWith("http") || source.startsWith("data:"))
    ) {
      try {
        const response = await fetch(source);
        if (!response.ok)
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages[index]  = {
            file: null,
            base64: reader.result,
          };
          setInputImages(newImages);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error setting input image from URL:", error);
      }
    } else {
      console.warn("Invalid source for input image:", source);
    }
  };

  // Helper function to handle action type transfer
  const handleTransferToActionType = (imageUrl, type) => {
    handleSetInputImage(imageUrl);
    setActionType(type);
    if (Number(type) === 2) {
      navigate(`/generate/image?type=img2img`);
    } else {
      navigate(`/generate/video?type=img2video`);
    }
  };
  // Return all states and functions
  return {
    // Image generation states
    steps,
    setSteps,
    cfg,
    setCfg,
    seed,
    setSeed,
    width,
    setWidth,
    height,
    setHeight,
    samplingMethod,
    setSamplingMethod,
    clipEncoder,
    setClipEncoder,
    actionType,
    setActionType,
    promtyStyle,
    setPromtyStyle,
    inputImages,
    setInputImages,

    // Model states
    baseModel,
    setBaseModel,
    baseModelVideo,
    setBaseModelVideo,

    // LoRA and ControlNet states
    loras,
    setLoras,
    selectedControlNets,
    setSelectedControlNets,
    controlNetStrengths,
    setControlNetStrengths,
    vae,
    setVae,

    // Video-specific states (now flexible)
    resolution,
    setResolution,
    duration,
    setDuration,
    fps,
    setFps,
    quality,
    setQuality,

    // Helper functions
    handleSetInputImage,
    handleTransferToActionType,
    applyStyleParams,
  };
};
