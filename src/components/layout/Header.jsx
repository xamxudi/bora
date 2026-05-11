import React, { useState, useEffect, useRef } from "react";
import MenuProfile from "./MenuProfile";
import "./Header.css";
import UserAvatar from "../ui/UserAvatar";
import {
  FaBell, FaTimes, FaMagic, FaComment, FaInfoCircle,
  FaTools, FaRobot, FaPalette, FaEdit, FaVideo, FaFilm,
  FaCrown, FaGem, FaListUl, FaRocket, FaImage, FaChevronDown,
  FaBrush, FaWand, FaPlay, FaCog, FaStar, FaPhotoVideo
} from "react-icons/fa";

import { HiOutlineTranslate } from "react-icons/hi";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import BgHeader from "../../assets/images/header/bg-header.webp";
import LogoHeader from "../../assets/images/header/logo-header.png";
import Navbar from "./Navbar";

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const userMenuRef = useRef();
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useAuth();

  // Enhanced navigation function with event handling
  const handleNavClick = (path, event) => {
    console.log("Navigation clicked:", path);

    // Stop event bubbling to prevent dropdown close
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Close all dropdowns and menus
    setActiveDropdown(null);
    setShowUserMenu(false);
    setShowLanguageMenu(false);

    // Handle external links
    if (path.startsWith("http")) {
      window.open(path, '_blank', 'noopener,noreferrer');
      return;
    }

    // Navigate with small delay to ensure state is updated
    setTimeout(() => {
      try {
        navigate(path);
        console.log("Navigation successful to:", path);
      } catch (error) {
        console.error("Navigation error:", error);
      }
    }, 50);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(prev => !prev);
    setShowLanguageMenu(false);
    setActiveDropdown(null);
  };

  const toggleLanguageMenu = () => {
    setShowLanguageMenu(prev => !prev);
    setShowUserMenu(false);
    setActiveDropdown(null);
  };

  const handleAvatarClick = async () => {
    await refreshUser();
    toggleUserMenu();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = e => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
        setShowLanguageMenu(false);
        setActiveDropdown(null);
      }
    };

    const handleEscape = e => {
      if (e.key === "Escape") {
        setShowUserMenu(false);
        setShowLanguageMenu(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const languages = ["English", "Tiếng Việt"];

  // Enhanced menuData with beautiful icons and descriptions
  const menuData = [
    {
      title: "Giới thiệu",
      icon: <FaInfoCircle />,
      href: "https://bora.ai.vn",
      description: "Tìm hiểu về Bora AI"
    },
    {
      title: "Chức năng",
      icon: <FaMagic />,
      children: [
        {
          title: "Công Cụ",
          icon: <FaTools />,
          description: "Các công cụ AI thông minh",
          links: [
            {
              icon: <FaRobot />,
              label: "Chat AI",
              href: "/GenerativeAIChat",
              description: "Trò chuyện với AI thông minh",
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              icon: <HiOutlineTranslate />,
              label: "Dịch Thuật",
              href: "/translation",
              description: "Dịch thuật đa ngôn ngữ",
              gradient: "from-green-500 to-emerald-500"
            }
          ]
        },
        {
          title: "Hình Ảnh",
          icon: <FaImage />,
          description: "Tạo và chỉnh sửa hình ảnh AI",
          links: [
            {
              icon: <FaPalette />,
              label: "Tạo hình ảnh",
              href: "/generate/image",
              description: "Tạo hình ảnh từ văn bản",
              gradient: "from-purple-500 to-pink-500"
            },
            {
              icon: <FaBrush />,
              label: "Sửa hình ảnh",
              href: "/generate/image?type=img2img",
              description: "Chỉnh sửa hình ảnh thông minh",
              gradient: "from-orange-500 to-red-500"
            },
          ]
        },
        {
          title: "Video",
          icon: <FaVideo />,
          description: "Tạo video chuyên nghiệp",
          links: [
            {
              icon: <FaPlay />,
              label: "Tạo Video",
              href: "/generate/video",
              description: "Tạo video từ AI",
              gradient: "from-indigo-500 to-purple-500"
            },
            {
              icon: <FaPhotoVideo />,
              label: "Tạo video từ ảnh",
              href: "/generate/video?type=img2video",
              description: "Tạo video từ hình ảnh thật đơn giản",
              gradient: "from-orange-500 to-red-500"
            },
          ]
        }
      ]
    },
    {
      title: "Gói & Thanh Toán",
      icon: <FaCrown />,
      description: "Nâng cấp tài khoản của bạn",
      children: [
        {
          title: "Gói Dịch Vụ",
          icon: <FaGem />,
          description: "Chọn gói phù hợp với bạn",
          links: [
            {
              icon: <FaListUl />,
              label: "Các gói",
              href: "https://bora.ai.vn/pricing",
              description: "Xem tất cả gói dịch vụ",
              gradient: "from-yellow-500 to-orange-500"
            },
            {
              icon: <FaRocket />,
              label: "Nâng cấp gói",
              href: "/pricing/upgrade",
              description: "Nâng cấp ngay hôm nay",
              gradient: "from-pink-500 to-red-500"
            },
          ]
        }
      ]
    }
  ];

  // Thay đổi từ click sang hover với delay
  const handleMouseEnter = (index) => {
    // Clear timeout nếu có
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setActiveDropdown(index);
  };

  const handleMouseLeave = () => {
    // Thêm delay trước khi ẩn menu
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 150); // 150ms delay
    setHoverTimeout(timeout);
  };

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const renderMenuItem = (item, index) => {
    const isActive = activeDropdown === index;

    // External links
    if (item.href && item.href.startsWith("http")) {
      return (
        <a
          key={index}
          href={item.href}
          className="nav-item-link"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setActiveDropdown(null)}
        >
          <span className="nav-item-icon">{item.icon}</span>
          <span className="nav-item-text">{item.title}</span>
          {item.description && (
            <span className="nav-item-description">{item.description}</span>
          )}
        </a>
      );
    }

    // Internal links
    if (item.href) {
      return (
        <button
          key={index}
          className="nav-item-link nav-button"
          onClick={(e) => handleNavClick(item.href, e)}
          onMouseDown={(e) => e.stopPropagation()}
          type="button"
        >
          <span className="nav-item-icon">{item.icon}</span>
          <span className="nav-item-text">{item.title}</span>
          {item.description && (
            <span className="nav-item-description">{item.description}</span>
          )}
        </button>
      );
    }

    // Dropdown menus - Thay đổi từ onClick sang onMouseEnter/onMouseLeave với improved hover
    if (item.children) {
      return (
        <div
          key={index}
          className="nav-item-dropdown"
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className={`nav-item-button ${isActive ? 'active' : ''}`}
            type="button"
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span className="nav-item-text">{item.title}</span>
            <FaChevronDown className={`nav-item-chevron ${isActive ? 'rotated' : ''}`} />
          </button>

          {isActive && (
            <div
              className="mega-dropdown"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="mega-dropdown-content">
                {item.children.map((category, catIndex) => (
                  <div key={catIndex} className="mega-category">
                    <div className="mega-category-header">
                      <span className="mega-category-icon">{category.icon}</span>
                      <div>
                        <h3 className="mega-category-title">{category.title}</h3>
                        {category.description && (
                          <p className="mega-category-description">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="mega-category-links">
                      {category.links.map((link, linkIndex) => (
                        <button
                          key={linkIndex}
                          className="mega-link"
                          onClick={(e) => handleNavClick(link.href, e)}
                          onMouseDown={(e) => e.stopPropagation()}
                          type="button"
                        >
                          <div className={`mega-link-icon bg-gradient-to-r ${link.gradient}`}>
                            {link.icon}
                          </div>
                          <div className="mega-link-content">
                            <span className="mega-link-title">{link.label}</span>
                            <span className="mega-link-description">{link.description}</span>
                          </div>

                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mega-dropdown-footer">
                <div className="mega-footer-highlight">
                  <FaStar className="mega-footer-icon" />
                  <span>Khám phá tất cả tính năng AI mạnh mẽ của Bora</span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`} style={{ backgroundImage: `url(${BgHeader})` }}>
      {/* Logo */}
      <div className="header-logo">
        <img src={LogoHeader} className="logo-image" alt="logo" onClick={() => navigate("/")} />
      </div>
      <Navbar className="navbar" menuItems={menuData} />

      {/* Enhanced Navigation */}
      <nav className="header-nav">
        <div className="nav-items">
          {menuData.map((item, index) => renderMenuItem(item, index))}
        </div>
      </nav>

      {/* Actions */}
      <div className="header-actions">
        <button className="icon-button-bell" aria-label="Notifications" type="button">
          <FaBell />
          <span className="notification-badge"></span>
        </button>
        {!currentUser ? (
          <button
            className="login-button"
            onClick={(e) => handleNavClick("/login", e)}
            onMouseDown={(e) => e.stopPropagation()}
            type="button"
          >

            Sign In
          </button>
        ) : (
          <div ref={userMenuRef} className="user-menu-container">
            <UserAvatar
              className={'user-avatar-bg-back'}
              onClick={handleAvatarClick}
              name={currentUser?.name}
              imgUrl={currentUser?.avatarUrl}
              size={38}
            />
            {showUserMenu && (
              <MenuProfile />
            )}
          </div>
        )}
        {showLanguageMenu && (
          <div className="language-menu">
            <div className="language-header">
              <span>Language</span>
              <button onClick={toggleLanguageMenu} type="button"><FaTimes /></button>
            </div>
            <div className="language-list">
              {languages.map(lang => (
                <button key={lang} onClick={() => setShowLanguageMenu(false)} type="button">
                  {lang}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}