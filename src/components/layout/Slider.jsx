import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { APIService } from "../../services/ApiService";
import "./Slider.css";
import {
  FaMagic,
  FaVideo
} from "react-icons/fa";
const Slider = () => {
  const [sliderImages, setSliderImages] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? sliderImages.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === sliderImages.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    setLoading(true);
    APIService.checkouts
      .getAll(0, 9)
      .then((data) => {
        const sliderItems = data.slice(0, 3).map((item) => ({
          id: item.id,
          img: item.imageUrl || `${process.env.PUBLIC_URL}/bora-logo-with-text.png`,
          title: item.name,
        }));
        setSliderImages(sliderItems);

        const cardItems = data.slice(3, 9).map((item) => ({
          id: item.id,
          img: item.imageUrl || `${process.env.PUBLIC_URL}/bora-logo-with-text.png`,
          title: item.name,
          views: item.downloadCount?.toLocaleString() ?? "0",
        }));
        setCards(cardItems);
      })
      .catch((err) => {
        console.error("Error loading checkouts:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const features = [

    { icon: <FaMagic />, title: "Tạo hình ảnh", description: "Tạo ảnh ra nhanh chóng với đầy đủ quyền kiểm soát", path: "/generate/image" },
    { icon: <FaVideo />, title: "Tạo Video", description: "Tạo video ra nhanh chóng với đầy đủ quyền kiểm soát", path: "/generate/video" },
  ];

  return (
    <>
      <div className="feature-bar silder-art">
        {features.map((f, i) => (
          <div
            className="feature-item"
            key={i}
            onClick={() => navigate(f.path)}
            style={{ cursor: "pointer" }}
          >
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-texts">
              <div className="feature-title">{f.title}</div>
              <div className="feature-description">{f.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="slider-wrapper">
        {/* Slider */}
        <div className="slider-main">
          {sliderImages.length > 0 && (
            <>
              <button className="nav left" onClick={prevSlide}>❮</button>
              <img
                src={sliderImages[currentIndex].img}
                alt={sliderImages[currentIndex].title}
              />
              <button className="nav right" onClick={nextSlide}>❯</button>
            </>
          )}
        </div>

        {/* Grid */}
        <div className="slider-grid">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              {cards.slice(0, 6).map((card) => (
                <div className="card" key={card.id}>
                  <img src={card.img} alt={card.title} className="card-image" />
                  <div className="info">
                    <span>{card.title}</span>
                    <span>{card.views} views</span>
                  </div>
                </div>
              ))}


            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Slider;
