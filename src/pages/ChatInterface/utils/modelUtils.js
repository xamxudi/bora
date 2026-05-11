export const findModelById = (providers, modelId) => 
  providers?.flatMap(p => p.aiModels || []).find(m => m.id === modelId);

export const findModelByName = (providers, modelName) =>
  providers?.flatMap(p => p.aiModels || [])
    .find(m => m.name.toLowerCase() === modelName?.toLowerCase());

export const getModelDisplayName = (providers, selectedModel) => {
  const matched = findModelByName(providers, selectedModel);
  return matched?.displayName || selectedModel || 'Vui lòng chọn đoạn chat hoặc tạo mới';
};

export const getActiveProvider = (providers, providerId) =>
  providers?.find(p => p.id === providerId);

export const getActiveModelList = (providers, providerId) =>
  getActiveProvider(providers, providerId)?.aiModels || [];