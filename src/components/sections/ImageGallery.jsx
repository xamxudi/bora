import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ImageGallery.css";
import Loadding from "../ui/PageLoading";
import api from "../../services/PicshareClient";
import ImageActions from "../sections/ImageActions";
import { useAuth } from "../../contexts/AuthContext";

export default function ImageGallery({ columns = 4, columnWidths, ...rest }) {
  const containerRef = useRef();
  const sentinelRef = useRef(); 
  const [images, setImages] = useState([]);
  const [visibleRows, setVisibleRows] = useState(10);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [randomSeed, setRandomSeed] = useState(() => Math.floor(Math.random() * 100000));
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [responsiveColumns, setResponsiveColumns] = useState(columns);
  const [loadedImages, setLoadedImages] = useState({});
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setResponsiveColumns(mobile ? 2 : columns);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [columns]);
  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      try {
        const res = await api.get(`/api/v1/media?page=${page}&pageSize=15&randomSeed=${randomSeed}&orderType=random`);
        const data = await res.data;

        if (data.items.length === 0) {
          setPage(1);
          setRandomSeed(Math.floor(Math.random() * 100000));
          return;
        }

        const newImages = data.items.map((img) => ({
          id: img.id,
          fileName: img.metadata.fileName,
          url: img.url,
          likes: img.likeCount
        }));

        setImages((prev) => [...prev, ...newImages]);
      } catch (err) {
        console.error("Lỗi fetch ảnh:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, [page]);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loading) {
            setVisibleRows((prev) => prev + 10);

            if (visibleRows * responsiveColumns >= images.length) {
              setPage((p) => p + 1);
            }
          }
        });
      },
      { root: containerRef.current, rootMargin: "5000px" }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [images, visibleRows, responsiveColumns, loading]);

  const handleLike = async (id) => {
    try {
      await api.post(`/api/media/${id}/like/toggle`);
      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? { ...img, likes: (img.likes ?? 0) + 1 }
            : img
        )
      );
    } catch (err) {
      console.error("Lỗi like ảnh:", err);
    }
  };

  const handleSave = async (url, fileName) => {
    try {
      const resp = await fetch(url, { mode: "cors" });
      if (!resp.ok) throw new Error("Download failed");

      const blob = await resp.blob();
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `bora_ai_vn_${fileName}`; // tên file bạn muốn
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      alert("Không thể tải file");
    }
  };

  if (images.length <= 0) return <Loadding message="Đang tải ảnh..." />;

  return (
    <div className="image-gallery" ref={containerRef} {...rest}>
      <div className="image-gallery-columns">
        {Array.from({ length: responsiveColumns }).map((_, colIdx) => (
          <div
            key={colIdx}
            className="image-gallery-column"
            style={{ flex: columnWidths?.[colIdx] || 1 }}
          >
            {images
              .filter((_, idx) => idx % responsiveColumns === colIdx)
              .slice(0, visibleRows)
              .map((img, rowIdx) => (
                <div className="image-gallery-item" key={img.id + "-" + rowIdx}>
                  <img
                    src={img.url + "?w=720"}
                    alt={`Img ${img.id}`}
                    className="image-gallery-img"
                    onClick={() => navigate(`/gallery/detail/${img.id}`)}
                    onError={() => {
                      setImages((prev) => prev.filter((i) => i.id !== img.id));
                    }}
                    onLoad={() =>
                      setLoadedImages((prev) => ({ ...prev, [img.id]: true }))
                    }
                  />
                  {loadedImages[img.id] && !isMobile && (
                    <ImageActions
                      className={"image-gallery-actions"}
                      disabled={!currentUser}
                      likes={img.likes}
                      onLike={() => {
                        handleLike(img.id);
                      }}
                      onSave={() => {
                        handleSave(img.url, img.fileName);
                      }}
                    />
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
      <div ref={sentinelRef} style={{ height: "1px", opacity: loading ? 1 : 0 }} />
    </div>
  );
}