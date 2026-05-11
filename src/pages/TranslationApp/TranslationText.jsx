import React, { useEffect, useRef, useState } from "react";
import { TranslationService, TTSService, STTService } from "../../services/TranslationService";
import {
  MdSwapHoriz,
  MdVolumeUp,
  MdStop,
  MdContentCopy,
  MdCheck,
  MdMic,
  MdClose,
  MdMenu,
  MdPhotoCamera,
  MdPeople,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { FaHourglassEnd } from "react-icons/fa";
import "./TranslationText.css";
import { useMessage } from '../../contexts/MessageContext';

export default function TranslationText() {
  const notiMessage = useMessage();
  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState(""); // "" => Auto
  const [targetLang, setTargetLang] = useState("vi");
  const [tone, setTone] = useState(null);
  const [style, setStyle] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const [isSpeakingSrc, setIsSpeakingSrc] = useState(false);
  const [isSpeakingDst, setIsSpeakingDst] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [copiedSrc, setCopiedSrc] = useState(false);
  const [copiedDst, setCopiedDst] = useState(false);

  // Mobile language selection
  const [showSourceLangModal, setShowSourceLangModal] = useState(false);
  const [showTargetLangModal, setShowTargetLangModal] = useState(false);

  const typingTimeoutRef = useRef(null);
  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  // STT (micro)
  const sttStableRef = useRef("");
  const recognitionRef = useRef(null);

  // Language options
  const languageOptions = [
    { code: "", name: "Phát hiện ngôn ngữ" },
    { code: "en", name: "Tiếng Anh" },
    { code: "vi", name: "Tiếng Việt" },
    { code: "ja", name: "Tiếng Nhật" },
    { code: "ko", name: "Tiếng Hàn" },
    { code: "fr", name: "Tiếng Pháp" },
  ];

  const targetLanguageOptions = [
    { code: "en", name: "Tiếng Anh" },
    { code: "vi", name: "Tiếng Việt" },
    { code: "ja", name: "Tiếng Nhật" },
    { code: "ko", name: "Tiếng Hàn" },
    { code: "fr", name: "Tiếng Pháp" },
  ];

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (abortRef.current) abortRef.current.abort();
      TTSService.stop();
      try {
        recognitionRef.current?.stop?.();
      } catch { }
    };
  }, []);

  useEffect(() => {
    if (!text.trim()) {
      setResult("");
      if (abortRef.current) abortRef.current.abort();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      return;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const translated = await TranslationService.translateText({
          text,
          sourceLanguage: sourceLang || null, // "" => Auto
          targetLanguages: [targetLang],
          tone,
          style,
          signal: controller.signal,
          onDetected: (lang) => {
            if (!sourceLang && mountedRef.current && lang) {
              setSourceLang(lang);
            }
          },
        });

        if (!mountedRef.current) return;
        setResult(translated);
      } catch (err) {
        if (!mountedRef.current) return;
        const msg = err?.message || "Unknown error";
        if(msg == "Forbidden")
        {
          notiMessage.error("Quý khách cần nâng cấp gói để sử dụng tính năng này");
          return;
        }
        if (msg !== "Yêu cầu đã bị huỷ.") {
          setResult("⚠ Lỗi dịch: " + msg);
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, sourceLang, targetLang, tone, style]);

  const swapLanguages = () => {
    setResult("");
    setSourceLang((prevSrc) => {
      const nextSrc = targetLang;
      setTargetLang(prevSrc || "en");
      return nextSrc;
    });
    setText((prev) => (result ? result : prev));
  };

  // ===== TTS =====
  const speakSource = async () => {
    if (!text?.trim()) return;
    try {
      setIsSpeakingSrc(true);
      setIsSpeakingDst(false);
      await TTSService.speak({
        text,
        lang: sourceLang || "en-US",
        onend: () => {
          if (!mountedRef.current) return;
          setIsSpeakingSrc(false);
        },
      });
    } catch (e) {
      console.error(e);
      alert(e.message || "Không phát âm được văn bản nguồn.");
      setIsSpeakingSrc(false);
    }
  };

  const speakTarget = async () => {
    if (!result?.trim()) return;
    try {
      setIsSpeakingDst(true);
      setIsSpeakingSrc(false);
      await TTSService.speak({
        text: result,
        lang: targetLang || "en-US",
        onend: () => {
          if (!mountedRef.current) return;
          setIsSpeakingDst(false);
        },
      });
    } catch (e) {
      console.error(e);
      alert(e.message || "Không phát âm được bản dịch.");
      setIsSpeakingDst(false);
    }
  };

  const stopSpeaking = () => {
    TTSService.stop();
    setIsSpeakingSrc(false);
    setIsSpeakingDst(false);
  };

  // ===== STT (micro) =====
  const startMic = () => {
    if (!STTService?.isSupported?.()) {
      alert("Trình duyệt không hỗ trợ nhận dạng giọng nói.");
      return;
    }
    try {
      sttStableRef.current = text || "";
      const rec = STTService.create({
        lang: sourceLang || "en-US",
        onResult: ({ final, interim }) => {
          let stable = sttStableRef.current;
          if (final && final.trim()) {
            stable = (stable ? stable + " " : "") + final.trim();
            sttStableRef.current = stable;
          }
          const display = interim?.trim()
            ? stable + (stable ? " " : "") + interim.trim()
            : stable;
          if (mountedRef.current) setText(display);
        },
        onEnd: () => {
          recognitionRef.current = null;
          if (mountedRef.current) setIsListening(false);
        },
        onError: (err) => {
          recognitionRef.current = null;
          if (mountedRef.current) setIsListening(false);
          if (err !== "no-speech") alert("Lỗi micro: " + err);
        },
      });
      recognitionRef.current = rec;
      rec.start();
      setIsListening(true);
    } catch (e) {
      console.error(e);
      alert(e.message || "Không thể bật micro.");
      setIsListening(false);
    }
  };

  const stopMic = () => {
    try {
      recognitionRef.current?.stop?.();
    } catch { }
  };

  // ===== Copy =====
  const writeClipboard = async (value) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      return true;
    } catch {
      return false;
    }
  };

  const copySource = async () => {
    if (!text?.trim()) return;
    const ok = await writeClipboard(text);
    if (ok) {
      setCopiedSrc(true);
      setTimeout(() => setCopiedSrc(false), 1200);
    }
  };

  const copyTarget = async () => {
    if (!result?.trim()) return;
    const ok = await writeClipboard(result);
    if (ok) {
      setCopiedDst(true);
      setTimeout(() => setCopiedDst(false), 1200);
    }
  };

  // Helper function để lấy tên ngôn ngữ
  const getLanguageName = (langCode) => {
    const langNames = {
      "en": "Anh",
      "vi": "Việt",
      "ja": "Nhật",
      "ko": "Hàn",
      "fr": "Pháp"
    };
    return langNames[langCode] || langCode;
  };

  const clearText = () => {
    setText("");
    setResult("");
  };

  // Mobile language selection handlers
  const selectSourceLanguage = (langCode) => {
    setSourceLang(langCode);
    setShowSourceLangModal(false);
  };

  const selectTargetLanguage = (langCode) => {
    setTargetLang(langCode);
    setShowTargetLangModal(false);
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="translation-main">
        {/* Source panel */}
        <div className="translation-panel">
          <div className="panel-header">
            <div className="language-selector">
              <select
                value={sourceLang || ""}
                onChange={(e) => setSourceLang(e.target.value || "")}
              >
                <option value="">Phát hiện ngôn ngữ</option>
                <option value="en">Tiếng Anh</option>
                <option value="vi">Tiếng Việt</option>
                <option value="ja">Tiếng Nhật</option>
                <option value="ko">Tiếng Hàn</option>
                <option value="fr">Tiếng Pháp</option>
              </select>
            </div>
          </div>

          <div className="panel-content" style={{ position: "relative" }}>
            <textarea
              className="translation-textarea"
              placeholder="Gõ để dịch hoặc bấm mic để nói…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={5000}
            />
            {text && <div className="character-count cc-shift">{text.length} / 5000</div>}

            <div className="source-fab">
              {isListening ? (
                <button className="icon-btn stop" onClick={stopMic} title="Dừng ghi âm">
                  <MdStop />
                </button>
              ) : (
                <button
                  className="icon-btn"
                  onClick={startMic}
                  title={STTService.isSupported() ? "Bật micro để nói" : "Trình duyệt không hỗ trợ micro"}
                  disabled={!STTService.isSupported()}
                >
                  <MdMic />
                </button>
              )}

              <button
                className="icon-btn"
                onClick={copySource}
                title={copiedSrc ? "Đã sao chép" : "Sao chép văn bản nguồn"}
                disabled={!text.trim()}
              >
                {copiedSrc ? <MdCheck /> : <MdContentCopy />}
              </button>

              {isSpeakingSrc ? (
                <button className="icon-btn stop" onClick={stopSpeaking} title="Dừng phát âm">
                  <MdStop />
                </button>
              ) : (
                <button className="icon-btn" onClick={speakSource} title="Nghe văn bản nguồn" disabled={!text.trim()}>
                  <MdVolumeUp />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="translation-controls">
          <button className="swap-button" onClick={swapLanguages} title="Hoán đổi">
            <MdSwapHoriz />
          </button>

          <div className="tone-selector">
            <label className="tone-label">Giọng văn</label>
            <select
              className="tone-select"
              value={tone || ""}
              onChange={(e) => setTone(e.target.value || null)}
            >
              <option value="">Mặc định</option>
              <option value="boss_to_employee">Sếp → Nhân viên</option>
              <option value="employee_to_boss">Nhân Viên →  Sếp</option>
              <option value="colleague_to_colleague">Đồng nghiệp ↔ Đồng nghiệp</option>
              <option value="friend_to_friend">Bạn Bè</option>
            </select>
          </div>

          <div className="tone-selector">
            <label className="tone-label">Phong cách</label>
            <select
              className="tone-select"
              value={style || ""}
              onChange={(e) => setStyle(e.target.value || null)}
            >
              <option value="">Mặc định</option>
              <option value="formal">Trang trọng</option>
              <option value="informal">Informal</option>
              <option value="academic">Học thuật</option>
              <option value="business">Kinh doanh</option>
            </select>
          </div>
        </div>

        {/* Target panel - desktop only */}
        <div className="translation-panel">
          <div className="panel-header">
            <div className="language-selector">
              <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                <option value="en">Tiếng Anh</option>
                <option value="vi">Tiếng Việt</option>
                <option value="ja">Tiếng Nhật</option>
                <option value="ko">Tiếng Hàn</option>
                <option value="fr">Tiếng Pháp</option>
              </select>
            </div>
            <div style={{ width: 36 }} />
          </div>

          <div className="panel-content" style={{ position: "relative" }}>
            <div className="translation-result">
              {typeof result === "string" && result.startsWith("⚠") ? (
                <div className="error-message">{result}</div>
              ) : (
                result
              )}
            </div>

            <div className="speak-fab">
              {isSpeakingDst ? (
                <button className="icon-btn stop" onClick={stopSpeaking} title="Dừng">
                  <MdStop />
                </button>
              ) : (
                <button
                  className="icon-btn"
                  onClick={speakTarget}
                  title="Nghe bản dịch"
                  disabled={!result.trim()}
                >
                  <MdVolumeUp />
                </button>
              )}
              <button
                className="icon-btn"
                onClick={copyTarget}
                title={copiedDst ? "Đã sao chép" : "Sao chép bản dịch"}
                disabled={!result.trim()}
              >
                {copiedDst ? <MdCheck /> : <MdContentCopy />}
              </button>
            </div>

            {loading && (
              <div className="loading-indicator">
                <FaHourglassEnd />
                <span>Translating</span>
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="mobile-container">
        <div className="mobile-main-content">
          <div className="mobile-input-container" style={{ position: "relative" }}>
            <textarea
              className="mobile-textarea"
              placeholder="Nhập văn bản"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={5000}
            />

            {text && (
              <button className="mobile-clear-btn" onClick={clearText}>
                <MdClose />
              </button>
            )}

            {/* Mobile Tone & Style Controls */}
            <div className="mobile-tone-controls">
              <div className="mobile-tone-item">
                <select
                  className="mobile-tone-select"
                  value={tone || ""}
                  onChange={(e) => setTone(e.target.value || null)}
                >
                  <option value="">Giọng văn</option>
                  <option value="boss_to_employee">Sếp → NV</option>
                  <option value="employee_to_boss">NV → Sếp</option>
                  <option value="colleague_to_colleague">Đồng nghiệp</option>
                  <option value="friend_to_friend">Bạn bè</option>
                </select>
              </div>

              <div className="mobile-tone-item">
                <select
                  className="mobile-tone-select"
                  value={style || ""}
                  onChange={(e) => setStyle(e.target.value || null)}
                >
                  <option value="">Phong cách</option>
                  <option value="formal">Trang trọng</option>
                  <option value="informal">Thân mật</option>
                  <option value="academic">Học thuật</option>
                  <option value="business">Kinh doanh</option>
                </select>
              </div>
            </div>
          </div>

          {/* Result Area */}
          {(result || loading) && (
            <div className="mobile-result-area show">
              <div className="mobile-result-text">
                {loading ? (
                  <div className="mobile-loading">
                    <FaHourglassEnd />
                    <span>Đang dịch...</span>
                    <div className="loading-dots">
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                    </div>
                  </div>
                ) : typeof result === "string" && result.startsWith("⚠") ? (
                  <div className="error-message">{result}</div>
                ) : (
                  result
                )}
              </div>

              {result && !loading && (
                <div className="mobile-result-actions">
                  {isSpeakingDst ? (
                    <button className="mobile-result-btn" onClick={stopSpeaking}>
                      <MdStop />
                    </button>
                  ) : (
                    <button
                      className="mobile-result-btn"
                      onClick={speakTarget}
                      disabled={!result.trim()}
                    >
                      <MdVolumeUp />
                    </button>
                  )}

                  <button
                    className="mobile-result-btn"
                    onClick={copyTarget}
                    disabled={!result.trim()}
                  >
                    {copiedDst ? <MdCheck /> : <MdContentCopy />}
                  </button>
                </div>
              )}
            </div>
          )}
          {/* Language Bar - Now clickable */}
          <div className="mobile-language-bar">
            <div className="mobile-language-selector">
              <button
                className="mobile-lang-button"
                onClick={() => setShowSourceLangModal(true)}
              >
                <span className="mobile-lang-text">
                  {sourceLang ? getLanguageName(sourceLang) : "Phát hiện"}
                </span>
                <MdKeyboardArrowDown className="mobile-lang-arrow" />
              </button>

              <button className="mobile-swap-icon" onClick={swapLanguages}>
                <MdSwapHoriz />
              </button>

              <button
                className="mobile-lang-button"
                onClick={() => setShowTargetLangModal(true)}
              >
                <span className="mobile-lang-text">
                  {getLanguageName(targetLang)}
                </span>
                <MdKeyboardArrowDown className="mobile-lang-arrow" />
              </button>
            </div>
          </div>
          {/* Bottom Action Bar */}
          <div className="mobile-bottom-actions">
            <div className="mobile-action-wrapper">
              <button className="mobile-action-button">
                <MdPeople />
              </button>
              <span className="mobile-action-label">Cuộc trò chuyện</span>
            </div>

            <div className="mobile-action-wrapper">
              {isListening ? (
                <button
                  className="mobile-action-button mobile-mic-button active"
                  onClick={stopMic}
                >
                  <MdStop />
                </button>
              ) : (
                <button
                  className="mobile-action-button mobile-mic-button"
                  onClick={startMic}
                  disabled={!STTService.isSupported()}
                >
                  <MdMic />
                </button>
              )}
            </div>

            <div className="mobile-action-wrapper">
              <button className="mobile-action-button">
                <MdPhotoCamera />
              </button>
              <span className="mobile-action-label">Máy ảnh</span>
            </div>
          </div>
        </div>

        {/* Source Language Modal */}
        {showSourceLangModal && (
          <div className="mobile-language-modal" onClick={() => setShowSourceLangModal(false)}>
            <div className="mobile-language-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-language-modal-header">
                <h3>Chọn ngôn ngữ nguồn</h3>
                <button
                  className="mobile-modal-close"
                  onClick={() => setShowSourceLangModal(false)}
                >
                  <MdClose />
                </button>
              </div>
              <div className="mobile-language-list">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    className={`mobile-language-option ${sourceLang === lang.code ? 'active' : ''}`}
                    onClick={() => selectSourceLanguage(lang.code)}
                  >
                    {lang.name}
                    {sourceLang === lang.code && <MdCheck />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Target Language Modal */}
        {showTargetLangModal && (
          <div className="mobile-language-modal" onClick={() => setShowTargetLangModal(false)}>
            <div className="mobile-language-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-language-modal-header">
                <h3>Chọn ngôn ngữ đích</h3>
                <button
                  className="mobile-modal-close"
                  onClick={() => setShowTargetLangModal(false)}
                >
                  <MdClose />
                </button>
              </div>
              <div className="mobile-language-list">
                {targetLanguageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    className={`mobile-language-option ${targetLang === lang.code ? 'active' : ''}`}
                    onClick={() => selectTargetLanguage(lang.code)}
                  >
                    {lang.name}
                    {targetLang === lang.code && <MdCheck />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}