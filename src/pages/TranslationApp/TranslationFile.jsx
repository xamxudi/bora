import React, { useRef, useState, useMemo, useCallback } from "react";
import { TranslationService } from "../../services/TranslationService";
import { MdUpload, MdDownload, MdClose, MdCheckCircle } from "react-icons/md";
import { GrDocumentText } from "react-icons/gr";
import { FiAlertCircle } from "react-icons/fi";
import "./TranslationFile.css";

export default function TranslationFile() {
  // File translation states
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTargetLanguages, setFileTargetLanguages] = useState(["vi"]);
  const [fileSourceLang, setFileSourceLang] = useState(null);
  const [fileTone, setFileTone] = useState(null);
  const [fileStyle, setFileStyle] = useState(null);

  const [fileLoading, setFileLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [translationComplete, setTranslationComplete] = useState(false);

  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");
  const [detectedLang, setDetectedLang] = useState(null);

  const abortRef = useRef(null);
  const fileInputRef = useRef(null);

  const supportedTypes = useMemo(
    () => [".docx", ".pptx", ".xlsx", ".pdf"],
    []
  );
  const maxSizeMB = 200;

  const getLanguageName = (code) => {
    const languages = {
      en: "English",
      vi: "Tiếng Việt",
      ja: "Tiếng Nhật",
      ko: "Tiếng Hàn",
      fr: "Tiếng Pháp",
    };
    return languages[code] || code;
  };

  const isFileSupported = (file) => {
    if (!file) return false;
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    return supportedTypes.includes(ext);
  };

  const isFileSizeOk = (file) =>
    file && file.size <= maxSizeMB * 1024 * 1024;

  const handleFileSelect = (event) => {
    setErrorMsg("");
    setWarningMsg("");
    setTranslationComplete(false);
    
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isFileSupported(file)) {
      setErrorMsg(
        `Unsupported file format. Supported formats: ${supportedTypes.join(", ")}`
      );
      return;
    }
    if (!isFileSizeOk(file)) {
      setErrorMsg(`File too large (max ${maxSizeMB}MB)`);
      return;
    }
    setSelectedFile(file);
  };

  // DRAG & DROP
  const stopNativeDragBehavior = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (event) => {
    stopNativeDragBehavior(event);
    setDragActive(false);
    setErrorMsg("");
    setWarningMsg("");
    setTranslationComplete(false);

    const file = event.dataTransfer?.files?.[0];
    if (!file) return;

    if (!isFileSupported(file)) {
      setErrorMsg(
        `Unsupported file format. Supported formats: ${supportedTypes.join(", ")}`
      );
      return;
    }
    if (!isFileSizeOk(file)) {
      setErrorMsg(`File too large (max ${maxSizeMB}MB)`);
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (event) => {
    stopNativeDragBehavior(event);
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    stopNativeDragBehavior(event);
    setDragActive(false);
  };

  const removeFile = (e) => {
    e?.stopPropagation();
    setSelectedFile(null);
    setErrorMsg("");
    setWarningMsg("");
    setDetectedLang(null);
    setUploadProgress(0);
    setDownloadProgress(0);
    setTranslationComplete(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleTargetLanguage = (lang) => {
    setFileTargetLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const onProgress = useCallback((percent, phase) => {
    if (phase === "upload") setUploadProgress(percent);
    else if (phase === "download") setDownloadProgress(percent);
  }, []);

  const handleCancel = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setFileLoading(false);
    setUploadProgress(0);
    setDownloadProgress(0);
  };

  const handleFileTranslation = async () => {
    setErrorMsg("");
    setWarningMsg("");
    setDetectedLang(null);
    setTranslationComplete(false);

    if (!selectedFile) {
      setErrorMsg("Please select a file.");
      return;
    }
    if (fileTargetLanguages.length === 0) {
      setErrorMsg("Select at least 1 target language.");
      return;
    }

    setFileLoading(true);
    setUploadProgress(0);
    setDownloadProgress(0);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await TranslationService.translateFile({
        file: selectedFile,
        targetLanguages: fileTargetLanguages,
        sourceLanguage: fileSourceLang || null,
        tone: fileTone || null,
        style: fileStyle || null,
        onProgress,
        signal: controller.signal,
        timeout: 5 * 60_000, // 5 minutes
        maxSizeMB,
      });

      if (!result) throw new Error("No response from server.");

      // Show warnings if any
      const warns = [];
      if (result.translateWarning) warns.push(result.translateWarning);
      if (result.partialWarning)
        warns.push(`Untranslated: ${result.partialWarning}`);
      if (warns.length) setWarningMsg(warns.join(" | "));

      if (result.detectedLanguage)
        setDetectedLang(result.detectedLanguage);

      // Download file
      TranslationService.downloadFile(result.downloadUrl, result.filename);
      setTranslationComplete(true);
    } catch (err) {
      if (err.name !== "AbortError") {
        setErrorMsg(err?.message || "An unknown error occurred");
      }
    } finally {
      setFileLoading(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="translation-container-file">
      <div className="file-upload-card">
        <div
          className={`file-drop-area ${dragActive ? "active" : ""} ${
            selectedFile ? "has-file" : ""
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              fileInputRef.current?.click();
            }
          }}
          aria-label="Upload or drop a file to translate"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={supportedTypes.join(",")}
            style={{ display: "none" }}
          />

          {!selectedFile ? (
            <div className="upload-prompt">
              <div className="upload-icon-wrapper">
                <MdUpload className="upload-icon" />
              </div>
              <h3>Kéo và thả tệp của bạn vào đây</h3>
              <p>hoặc nhấp để duyệt tệp</p>
              <div className="file-requirements">
                <span>Các định dạng được hỗ trợ: {supportedTypes.join(", ")}</span>
                <span>Kích thước tối đa: {maxSizeMB}MB</span>
              </div>
            </div>
          ) : (
            <div className="file-preview">
              <div className="file-icon-wrapper">
                <GrDocumentText className="file-icon" />
              </div>
              <div className="file-meta">
                <div className="file-name" title={selectedFile.name}>
                  {selectedFile.name}
                </div>
                <div className="file-size">
                  {formatFileSize(selectedFile.size)}
                </div>
              </div>
              <button
                className="remove-file"
                onClick={removeFile}
                aria-label="Remove file"
              >
                <MdClose />
              </button>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="error-message">
            <FiAlertCircle className="error-icon" />
            <span>{errorMsg}</span>
          </div>
        )}

        {warningMsg && !errorMsg && (
          <div className="warning-message">
            <FiAlertCircle className="warning-icon" />
            <span>{warningMsg}</span>
          </div>
        )}

        {detectedLang && !errorMsg && (
          <div className="info-message">
            <MdCheckCircle className="info-icon" />
            <span>
              Detected language: <strong>{detectedLang}</strong>
            </span>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="translation-settings">
          <div className="settings-grid">
            <div className="setting-group">
              <label className="setting-label">Ngôn ngữ nguồn</label>
              <div className="select-wrapper">
                <select
                  value={fileSourceLang || ""}
                  onChange={(e) => setFileSourceLang(e.target.value || null)}
                >
                  <option value="">Auto-detect</option>
                  <option value="en">English</option>
                  <option value="vi">Tiếng Việt</option>
                  <option value="ja">Tiếng Nhật</option>
                  <option value="ko">Tiếng Hàn</option>
                  <option value="fr">Tiếng Pháp</option>
                </select>
              </div>
            </div>

            <div className="setting-group">
              <label className="setting-label">Target Languages</label>
              <div className="language-options">
                {["en", "vi", "ja", "ko", "fr"].map((lang) => (
                  <div key={lang} className="language-option">
                    <input
                      type="checkbox"
                      id={`lang-${lang}`}
                      checked={fileTargetLanguages.includes(lang)}
                      onChange={() => toggleTargetLanguage(lang)}
                    />
                    <label htmlFor={`lang-${lang}`}>
                      {getLanguageName(lang)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="setting-group">
              <label className="setting-label">Giọng văn</label>
              <div className="select-wrapper">
                <select
                  value={fileTone || ""}
                  onChange={(e) => setFileTone(e.target.value || null)}
                >
                  <option value="">Mặc định</option>
            <option value="boss_to_employee">Sếp → Nhân viên</option>
            <option value="employee_to_boss">Nhân Viên →  Sếp</option>
            <option value="colleague_to_colleague">Đồng nghiệp ↔ Đồng nghiệp</option>
            <option value="friend_to_friend">Bạn Bè</option>
                </select>
              </div>
            </div>

            <div className="setting-group">
              <label className="setting-label">Phong cách</label>
              <div className="select-wrapper">
                <select
                  value={fileStyle || ""}
                  onChange={(e) => setFileStyle(e.target.value || null)}
                >
                    <option value="">Mặc định</option>
            <option value="formal">Trang trọng</option>
            <option value="informal">Informal</option>
            <option value="academic">Học thuật</option>
            <option value="business">Kinh doanh</option>
                </select>
              </div>
            </div>
          </div>

          <div className="action-area">
            <button
              className={`translate-button ${
                fileLoading ? "loading" : ""
              } ${translationComplete ? "completed" : ""}`}
              onClick={fileLoading ? handleCancel : handleFileTranslation}
              disabled={
                (!selectedFile || fileTargetLanguages.length === 0) && !fileLoading
              }
            >
              {fileLoading ? (
                "Cancel Translation"
              ) : translationComplete ? (
                <>
                  <MdCheckCircle /> Dịch đã hoàn tất
                </>
              ) : (
                <>
                  <MdDownload /> Dịch & Tải xuống
                </>
              )}
            </button>

            {fileLoading && (
              <div className="progress-container">
                <div className="progress-group">
                  <label>Uploading</label>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span>{uploadProgress}%</span>
                </div>

                <div className="progress-group">
                  <label>Processing</label>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <span>{downloadProgress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}