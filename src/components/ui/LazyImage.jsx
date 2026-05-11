import React, { useEffect, useRef, useState } from "react";
import imgDefault from "../../assets/images/400x600.svg";

export default function LazyImage({ 
  src, 
  alt, 
  className, 
  placeholder = imgDefault, 
  ...rest 
}) {
  const imgRef = useRef();
  const [visible, setVisible] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentSrc(src); // 👈 gán src thật khi vào viewport
            obs.disconnect();
          }
        });
      },
      {
        rootMargin: "1200px 0px",
        threshold: 0
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  if (!visible) return null; // Nếu ảnh lỗi thì ẩn luôn

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={`${className} ${!loaded ? "img-loading" : "img-loaded"}`}
      onError={() => setVisible(false)} // ảnh lỗi → ẩn
      onLoad={() => setLoaded(true)} // ảnh thật load xong
      {...rest}
    />
  );
}
