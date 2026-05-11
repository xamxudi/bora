import { useState } from 'react';

export const useClipboard = () => {
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = async (text, codeId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(codeId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return { copiedCode, copyToClipboard };
};