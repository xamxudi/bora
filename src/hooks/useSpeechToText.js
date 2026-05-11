// useSpeechToText.js
import { useEffect, useRef, useState } from "react";

export default function useSpeechToText({
  lang = "vi-VN",
  interim = true,
  continuous = false,
} = {}) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = interim;
    rec.continuous = continuous;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = (e) => console.error("SpeechRecognition error:", e.error);

    rec.onresult = (e) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognitionRef.current = rec;

    return () => {
      rec.abort();
    };
  }, [lang, interim, continuous]);

  const start = () => {
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.warn("Recognition start error:", e);
    }
  };

  const stop = () => {
    recognitionRef.current?.stop();
  };

  const reset = () => setTranscript("");

  return { supported, listening, transcript, start, stop, reset };
}
