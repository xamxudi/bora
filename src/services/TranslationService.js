import axios from "axios";
import cookie from "../utils/CookieUtils";

/** ========= Base config ========= **/
const COOKIE_AUTH = process.env.REACT_APP_COOKIE_AUTH || "SendEnv_AuthToken";
const BASE_URL =  process.env.REACT_APP_AIGEN_API_URL || "http://localhost:5009";
const API_URL = `${BASE_URL.replace(/\/+$/, "")}/api/translate`;

// axios instance cho JSON (text translation)
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${cookie.get(COOKIE_AUTH)}`
  },
  timeout: 60_000, // 60s
});

/** ========= Helpers ========= **/
const parseContentDispositionFilename = (cd) => {
  if (!cd) return null;

  // Ưu tiên filename* (RFC 5987)
  const starMatch = cd.match(/filename\*=(?:UTF-8'')?([^;]+)/i);
  if (starMatch && starMatch[1]) {
    try {
      return decodeURIComponent(starMatch[1].replace(/^"+|"+$/g, ""));
    } catch {
      return starMatch[1].replace(/^"+|"+$/g, "");
    }
  }

  // Fallback: filename=
  const normalMatch = cd.match(/filename="?([^"]+)"?/i);
  if (normalMatch && normalMatch[1]) {
    return normalMatch[1];
  }
  return null;
};

const isZipContentType = (ct) => {
  if (!ct) return false;
  const v = ct.toLowerCase();
  return (
    v.includes("application/zip") ||
    v.includes("application/x-zip-compressed") ||
    v.includes("multipart/x-zip") ||
    v.includes("application/octet-stream") // một số server trả kiểu này
  );
};

const blobToTextSafe = async (data) => {
  try {
    if (data && typeof data.text === "function") {
      return await data.text();
    }
    return null;
  } catch {
    return null;
  }
};

const toReadableErrorMessage = async (response) => {
  // Thử parse blob trước
  const blobText = await blobToTextSafe(response?.data);
  if (blobText != null) {
    try {
      const json = JSON.parse(blobText);
      return (
        json.error ||
        json.message ||
        json.Message ||
        json.title ||
        `HTTP ${response.status}`
      );
    } catch {
      return blobText || `HTTP ${response.status}`;
    }
  }

  // Nếu không phải blob, thử đọc JSON trực tiếp
  const data = response?.data;
  if (data && typeof data === "object") {
    return (
      data.error ||
      data.message ||
      data.Message ||
      data.title ||
      `HTTP ${response.status}`
    );
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return `HTTP ${response?.status ?? "unknown"}`;
};

const handleError = (error) => {
  // Canceled
  if (axios.isCancel?.(error) || error?.code === "ERR_CANCELED") {
    throw new Error("Yêu cầu đã bị huỷ.");
  }

  // Có response từ server
  if (error?.response) {debugger
    const data = error.response.data;
    const message =
      data?.error ||
      data?.message ||
      data?.Message ||
      data?.title ||
      (typeof data === "string" ? data : null) ||
      error.message ||
      "Unknown error";
    throw new Error(message);
  }

  // Lỗi mạng / timeout / khác
  throw new Error(error?.message || "Unknown error");
};

/** ===== Helpers bổ sung cho translateFile ===== **/
const normalizeTargets = (arr) =>
  (Array.isArray(arr) ? arr : [arr])
    .filter(Boolean)
    .map((s) => String(s).trim().toLowerCase())
    .filter((s) => s.length > 0);

const getHeader = (headers, key) => {
  if (!headers) return null;
  // axios chuẩn hóa header về lowercase keys
  return headers[key.toLowerCase()] ?? null;
};

/** ========= Lightweight TTS service (Web Speech API) ========= **/
// Works in Chromium/Edge/Safari (Firefox: limited). No backend needed.

const regionDefaults = {
  en: "en-US",
  vi: "vi-VN",
  ja: "ja-JP",
  ko: "ko-KR",
  fr: "fr-FR",
};
/** ========= STT (Speech-to-Text, Web Speech API) ========= **/
const guessLocale = (langTag) => {
  if (!langTag) return "en-US";
  const primary = String(langTag).toLowerCase().split("-")[0];
  return regionDefaults[primary] || langTag;
};

export const STTService = {
  isSupported() {
    return (
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  },

  /** Tạo instance recognition (bạn tự giữ reference để start/stop) */
  create({
    lang,
    continuous = true,
    interimResults = true,
    onResult,  // ({final, interim}) => void
    onEnd,     // () => void
    onError,   // (err) => void
  } = {}) {
    const Rec =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) {
      throw new Error("Trình duyệt không hỗ trợ nhận dạng giọng nói.");
    }

    const rec = new Rec();
    rec.lang = guessLocale(lang);
    rec.continuous = continuous;
    rec.interimResults = interimResults;

    rec.onresult = (e) => {
      let final = "";
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const seg = e.results[i][0]?.transcript || "";
        if (e.results[i].isFinal) final += seg;
        else interim += seg;
      }
      onResult && onResult({ final, interim });
    };

    rec.onend = () => onEnd && onEnd();
    rec.onerror = (ev) => onError && onError(ev?.error || "unknown");

    return rec;
  },
};


let cachedVoices = [];
let voicesReadyPromise = null;

function loadVoices() {
  // resolve when voices are available (Safari loads async)
  if (voicesReadyPromise) return voicesReadyPromise;

  voicesReadyPromise = new Promise((resolve) => {
    const tryLoad = () => {
      cachedVoices = window.speechSynthesis?.getVoices?.() || [];
      if (cachedVoices.length > 0) resolve(cachedVoices);
      else setTimeout(tryLoad, 150);
    };

    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve([]); // not supported
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices() || [];
      if (cachedVoices.length > 0) resolve(cachedVoices);
    };
    tryLoad();
  });

  return voicesReadyPromise;
}

function pickVoice(langTag) {
  if (!cachedVoices.length) return null;
  if (!langTag) return cachedVoices[0] || null;

  const wanted = (langTag || "").toLowerCase();
  const primary = wanted.split("-")[0];

  // 1) exact match
  let v = cachedVoices.find((x) => x.lang?.toLowerCase() === wanted);
  if (v) return v;
  // 2) startsWith "ja" -> "ja-JP"
  v = cachedVoices.find((x) => x.lang?.toLowerCase().startsWith(primary));
  if (v) return v;
  // 3) region default
  const fallback = regionDefaults[primary];
  if (fallback) {
    v = cachedVoices.find((x) => x.lang?.toLowerCase() === fallback.toLowerCase());
    if (v) return v;
  }
  // 4) any default voice
  return cachedVoices[0] || null;
}

export const TTSService = {
  async speak({ text, lang, rate = 1, pitch = 1, volume = 1, onend }) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      throw new Error("Trình duyệt không hỗ trợ Text-to-Speech.");
    }
    if (!text?.trim()) return;

    await loadVoices();
    const voice = pickVoice(lang);

    // Hủy đọc cũ trước khi đọc mới
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    utter.pitch = pitch;
    utter.volume = volume;
    if (voice) utter.voice = voice;
    if (lang) utter.lang = voice?.lang || lang;

    // reset icon khi kết thúc hoặc lỗi
    utter.onend = () => { try { onend && onend(); } catch { } };
    utter.onerror = () => { try { onend && onend(); } catch { } };

    window.speechSynthesis.speak(utter);
  },

  stop() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  },

  async getAvailableVoices() {
    await loadVoices();
    return cachedVoices.slice();
  },
};

/** ========= Public API ========= **/
export const TranslationService = {
  /**
   * Dịch văn bản (JSON).
   * @returns {Promise<string>} chỉ trả về bản dịch của ngôn ngữ đầu tiên
   */
  async translateText({
    text,
    sourceLanguage = null,
    targetLanguages = ["vi"],
    tone = null,
    style = null,
    signal, // AbortSignal (tuỳ chọn)
    onDetected, // callback (tuỳ chọn)
  }) {
    try {
      const payload = { text, targetLanguages };
      if (sourceLanguage) payload.sourceLanguage = sourceLanguage;
      if (tone) payload.tone = tone;
      if (style) payload.style = style;

      const res = await apiClient.post("", payload, {
        signal,
        validateStatus: () => true, // tự xử lý lỗi
      });

      if (res.status < 200 || res.status >= 300) {
        const msg = await toReadableErrorMessage(res);
        throw new Error(msg);
      }

      // Nếu backend gửi X-Detected-Language thì bắn callback
      const detected = res.headers?.["x-detected-language"];
      if (detected && typeof onDetected === "function") {
        onDetected(detected);
      }

      const translations = res.data?.translations;
      if (
        translations &&
        typeof translations === "object" &&
        Object.keys(translations).length > 0
      ) {
        const firstKey = Object.keys(translations)[0];
        return translations[firstKey] ?? "";
      }
      return "";
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * Dịch file và nhận ZIP các bản dịch.
   * Trả về { downloadUrl, filename, blob, partialWarning, translateWarning, detectedLanguage }
   */
  async translateFile({
    file,
    targetLanguages = ["vi"],
    sourceLanguage = null,
    tone = null,
    style = null,
    onProgress = null,      // (percent, phase: 'upload' | 'download') => void
    signal,                 // AbortSignal (tuỳ chọn)
    timeout = 5 * 60_000,   // 5 phút cho file lớn
    maxSizeMB = 200,        // khớp RequestSizeLimit bên server
    allowExts = [".docx", ".pptx", ".xlsx", ".pdf"],
  }) {
    try {
      // ===== Validate sớm để không tốn upload =====
      if (!file) throw new Error("Chưa chọn file.");
      if (!file.size) throw new Error("File rỗng.");
      const ext = (file.name.match(/\.[^.]+$/)?.[0] || "").toLowerCase();
      if (!allowExts.includes(ext)) {
        throw new Error(
          `Định dạng không hỗ trợ: ${ext}. Hỗ trợ: ${allowExts.join(", ")}`
        );
      }
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        throw new Error(`File quá lớn (>${maxSizeMB}MB).`);
      }

      const targets = normalizeTargets(targetLanguages);
      if (!targets.length) throw new Error("Cần ít nhất 1 ngôn ngữ đích.");

      // ===== Xây form-data =====
      const formData = new FormData();
      formData.append("file", file);
      targets.forEach((lang) => formData.append("targetLanguages", lang));
      if (sourceLanguage) formData.append("sourceLanguage", sourceLanguage);
      if (tone) formData.append("tone", tone);
      if (style) formData.append("style", style);

      // ===== Gọi API =====
      const response = await axios.post(`${API_URL}/file`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/zip", // server trả ZIP
          "X-Requested-With": "XMLHttpRequest",
        },
        responseType: "blob",       // quan trọng để lấy ZIP
        withCredentials: true,
        signal,
        timeout,
        // Tiến độ UPLOAD
        onUploadProgress: (e) => {
          if (onProgress && e?.total) {
            const p = Math.round((e.loaded * 100) / e.total);
            onProgress(p, "upload");
          }
        },
        // Tiến độ DOWNLOAD (Axios 1.x hỗ trợ trên Chromium)
        onDownloadProgress: (e) => {
          if (onProgress && e?.total) {
            const p = Math.round((e.loaded * 100) / e.total);
            onProgress(p, "download");
          }
        },
        validateStatus: () => true, // tự xử lý lỗi
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      // ===== Kiểm tra content-type để phân biệt ZIP vs lỗi =====
      const contentType = getHeader(response.headers, "content-type") || "";
      const isZip = isZipContentType(contentType);

      if (!isZip) {
        // Server có thể trả JSON lỗi trong blob
        const msg = await toReadableErrorMessage(response);
        throw new Error(msg || `Translation failed (status ${response.status})`);
      }

      // ===== ZIP hợp lệ -> tạo blob & URL tải xuống =====
      const blob = new Blob([response.data], { type: "application/zip" });
      const downloadUrl = window.URL.createObjectURL(blob);

      // Lấy filename từ Content-Disposition (có hỗ trợ filename*)
      const cd = getHeader(response.headers, "content-disposition");
      const filename =
        parseContentDispositionFilename(cd) || "translated_files.zip";

      // Cảnh báo dịch một phần (nếu có)
      const partialWarning = getHeader(response.headers, "x-translate-partial");
      const translateWarning = getHeader(response.headers, "x-translate-warning");

      // Ngôn ngữ phát hiện được (nếu server gửi)
      const detectedLanguage = getHeader(response.headers, "x-detected-language");

      return {
        downloadUrl,
        filename,
        blob,
        partialWarning,
        translateWarning,
        detectedLanguage,
      };
    } catch (error) {
      if (axios.isCancel?.(error) || error?.code === "ERR_CANCELED") {
        throw new Error("Yêu cầu đã bị huỷ.");
      }
      if (error?.response?.status === 499) {
        throw new Error("Yêu cầu đã bị huỷ (499).");
      }
      handleError(error);
    }
  },

  /**
   * Tải file từ blob URL.
   */
  downloadFile(downloadUrl, filename) {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Nếu không cần giữ URL để tải lại:
    window.URL.revokeObjectURL(downloadUrl);
  },
};
