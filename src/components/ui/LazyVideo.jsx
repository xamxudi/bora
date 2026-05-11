import { useRef, useEffect, useState } from "react";

export default function LazyVideo({
  src,
  preview,
  className,
  autoPlay = true,
  loop = true,
  muted = true,
  children,
  ...rest
}) {
  const ref = useRef(null);
  const videoRef = useRef(null);

  const [inView, setInView] = useState(false);
  const [loadedEnough, setLoadedEnough] = useState(false);

  // Quan sát khi phần tử gần viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        console.log("Video isIntersecting")
        }
      },
      { rootMargin: "200px" } // preload trước 200px
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  // Check khi video load đủ 10%
  const handleProgress = (e) => {
    const video = e.target;
    if (video.buffered.length > 0 && video.duration > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const percent = (bufferedEnd / video.duration) * 100;
      if (percent >= 10) {
        setLoadedEnough(true);
        console.log("Video loaded enough to play", percent)
      }
    }
  };

  const shouldShowVideo = inView && loadedEnough;

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      {inView && (
        <video
          {...rest}
          ref={videoRef}
          className={className}
          src={src}
          preload="auto"
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          onProgress={handleProgress}
          onLoadedData={handleProgress} 
          style={{ display: loadedEnough ? "block" : "none",}}
        />
      )} 
      {!shouldShowVideo && (
        <img
          src={preview ?? "/placeholder.jpg"}
          alt="video preview"
          className={`w-full object-cover ${className ?? ""}`}
        />
      )}
      {children}
    </div>
  );
}
