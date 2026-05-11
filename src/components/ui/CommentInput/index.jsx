import React, { useRef, useState, useEffect } from 'react';
import useSpeechToText from "../../../hooks/useSpeechToText";
import './index.css';

const CommentInput = ({ placeholder = "What do you think", className, onSend = () => { }, ...rest }) => {
  const textareaRef = useRef(null);
  const [hasValue, setHasValue] = useState(false);
  const { supported, listening, transcript, start, stop, reset } = useSpeechToText({
    lang: "vi-VN", // bạn có thể cho props vào để đổi ngôn ngữ
    interim: true,
    continuous: false,
  });

  const handleInput = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto"; // reset trước
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight, 10);
    const maxRows = 3;
    const maxHeight = lineHeight * maxRows;

    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";

    setHasValue(textarea.value.trim().length > 0);
  };

  const handleSend = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const value = textarea.value.trim();
    if (value.length === 0) return;

    onSend(value);
    textarea.value = "";
    textarea.style.height = "auto";
    setHasValue(false);
    reset();
  };

  const toggleVoice = () => {
    if (!supported) {
      alert("Trình duyệt không hỗ trợ SpeechRecognition (hãy dùng Chrome/Edge).");
      return;
    }
    if (listening) {
      stop();
    } else {
      reset();
      start();
    }
  };

  useEffect(() => {
    if (textareaRef.current && transcript) {
      textareaRef.current.value = transcript;
      handleInput();
    }
  }, [transcript]);

  return (
    <div className={`comment-input ${className}`} {...rest}>
      <div className="message-area">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={listening ? "listening..." : placeholder}
          onInput={handleInput}
        />
      </div>
      <div className="button-icons">
        <button className={`icon-button voice ${listening ? "active" : ""}`} onClick={toggleVoice}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.5312 9.82617C20.066 9.82617 20.5 10.2542 20.5 10.7832C20.4998 15.0868 17.2 18.6408 12.9688 19.1182V21.043C12.9688 21.571 12.5347 22 12 22C11.4645 21.9997 11.0322 21.5709 11.0322 21.043V19.1182C6.80002 18.6408 3.50017 15.0868 3.5 10.7832C3.5 10.2542 3.93402 9.82617 4.46875 9.82617C5.00347 9.82619 5.4375 10.2542 5.4375 10.7832C5.43769 14.3558 8.38121 17.2624 12 17.2627C15.618 17.2627 18.5623 14.356 18.5625 10.7832C18.5625 10.2542 18.9965 9.82619 19.5312 9.82617ZM12.1748 2C14.5781 2.00003 16.5272 3.92364 16.5273 6.29688V10.9199C16.5273 13.2923 14.5782 15.2177 12.1748 15.2178H11.8252C9.42181 15.2178 7.47363 13.2923 7.47363 10.9199V6.29688C7.47374 3.92363 9.42187 2 11.8252 2H12.1748Z" fill={listening ? "red" : "#9999A3"} />
          </svg>
        </button>
        <button className={`send-button ${!hasValue ? "unvisibility" : ""}`} onClick={handleSend}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.4354 2.58198C20.9352 2.0686 20.1949 1.87734 19.5046 2.07866L3.408 6.75952C2.6797 6.96186 2.16349 7.54269 2.02443 8.28055C1.88237 9.0315 2.37858 9.98479 3.02684 10.3834L8.0599 13.4768C8.57611 13.7939 9.24238 13.7144 9.66956 13.2835L15.4329 7.4843C15.723 7.18231 16.2032 7.18231 16.4934 7.4843C16.7835 7.77623 16.7835 8.24935 16.4934 8.55134L10.72 14.3516C10.2918 14.7814 10.2118 15.4508 10.5269 15.9702L13.6022 21.0538C13.9623 21.6577 14.5826 22 15.2628 22C15.3429 22 15.4329 22 15.513 21.9899C16.2933 21.8893 16.9135 21.3558 17.1436 20.6008L21.9156 4.52479C22.1257 3.84028 21.9356 3.09537 21.4354 2.58198Z" fill="#484848" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CommentInput;
