import geminiAI from '../../../assets/images/chatai/gemini-ai.png';
import chatGPT from '../../../assets/images/chatai/chatgpt.png';
import defaultLogo from '../../../assets/images/style/logo192.png';

export const MODEL_ICONS = {
  google: geminiAI,
  openai: chatGPT,
  jasper: chatGPT,
  default: defaultLogo
};

export const getModelIcon = (providerName) => {
  const lower = providerName.toLowerCase();
  if (lower.includes('google')) return MODEL_ICONS.google;
  if (lower.includes('openai')) return MODEL_ICONS.openai;
  if (lower.includes('jasper')) return MODEL_ICONS.jasper;
  return MODEL_ICONS.default;
};