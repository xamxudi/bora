import React, { useState } from "react";
import './TranslationApp.css';
import { HiOutlineTranslate } from "react-icons/hi";
import { GrDocumentText } from "react-icons/gr";
import TranslationText from "./TranslationText";
import TranslationFile from "./TranslationFile";
export default function TranslationApp() {
  const [activeTab, setActiveTab] = useState("text");
  return (
    <div className="translation-container">
      {/* Header with tabs */}
      <div className="translation-header">
        <div className="translation-tabs">
          <button
            className={`tab-item ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTab('text')}
          >
            <span className="tab-icon"><HiOutlineTranslate /></span>
            <span>Dịch văn bản</span>
          </button>
          <button
            className={`tab-item-file ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => setActiveTab('file')}
          >
            <span className="tab-icon"><GrDocumentText /></span>
            <span>Dịch file</span>
          </button>
        </div>
      </div>

      {activeTab === 'text' ? <TranslationText /> : <TranslationFile />}
    </div>
  );
}
