import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MenuProfile.css";
import { useAuth } from "../../contexts/AuthContext";
import UserAvatar from "../ui/UserAvatar";
import BoraCredit from "../ui/BoraCredit";
import { 
  FaUser, 
  FaHeart, 
  FaCog, 
  FaLock, 
  FaQuestionCircle, 
  FaSignOutAlt, 
  FaSyncAlt, 
  FaShoppingCart,
  FaMoon,
  FaSun,
  FaBolt,
  FaSlidersH
} from "react-icons/fa";

import { useTheme } from "../../contexts/ThemeContext";
import { useUIMode } from "../../contexts/UIModeContext";
import profileService from "../../services/ProfileService";
function formatNumber(num) {
  if (num == null) return 0;
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(num % 1_000_000_000 === 0 ? 0 : 1) + "B";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + "M";
  }
  if (num >= 1_0000) {
    return (num / 1_000).toFixed(num % 1_0000 === 0 ? 0 : 1) + "K";
  }
  return num.toString();
}


function CreditCard({ user, onRefresh }) {
  return (
    <div className="credit-card">
      <div className="credit-header">
        <span className="credit-flag">🏳️</span>
        <span className="credit-title">Số Dư Tín Dụng</span>
      </div>
      <div className="credit-section-row">
        <div className="credit-section">
          <div className="credit-value-large">{formatNumber(user?.balance ?? 0)}</div>
          <div className="credit-label-with-icon">
            <span className="credit-label">Hàng tháng</span>
            <FaSyncAlt
              className="credit-refresh-icon"
              style={{ cursor: "pointer" }}
              onClick={onRefresh}
            />
          </div>
        </div>
        <div className="credit-section">
          <div className="credit-value-large">{user?.permanentCredit ?? 0}</div>
          <div className="credit-label-with-icon">
            <span className="credit-label">Vĩnh viễn</span>
            <span className="credit-bolt">⚡</span>
          </div>
        </div>
      </div>
      {user?.plan !== "pro" && (
        <div className="credit-upgrade-section">
          <div className="credit-upgrade-text">
            <a href="https://bora.ai.vn/pricing">Nâng cấp</a>{" "}
            <span className="credit-highlight"><BoraCredit value={2000}/>/Tháng</span>
          </div>
          <button className="credit-buy-btn">
            <FaShoppingCart className="credit-buy-icon" />
            Mua
          </button>
        </div>
      )}
    </div>
  );
}

export default function MenuProfile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { uiMode, toggleUIMode } = useUIMode();

  const [subscription, setSubscription] = useState(null);
  const [creditBalance, setCreditBalance] = useState(0);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await profileService.getSubscriptionPlan();
        if (!isMounted) return;
        const planValue = res?.data?.plan || res?.plan || null;
        setSubscription(planValue);
      } catch (_) { }

      try {
        const balRes = await profileService.getCreditBalance();
        if (isMounted && balRes?.success) {
          setCreditBalance(balRes.data?.balance ?? 0);
        }
      } catch (_) { }
    })();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAction = (e) => {
    const url = e.currentTarget.getAttribute("data-url");
    if (url) {
      window.location.href = url;
    }
  };

  return (
    <div className="menu-profile-container">
      <div className="menu-profile-section">
        <UserAvatar
          className="menu-profile-avatar user-avatar-bg-back"
          name={currentUser?.name}
          imgUrl={currentUser?.avatarUrl}
          size={40}
        />
        <div className="menu-profile-content">
          <div className="menu-profile-name">{currentUser?.name ?? "User"}</div>
          <div className="menu-profile-plan">{subscription ?? "Cơ bản"}</div>
        </div>
      </div>

      <CreditCard user={{ ...currentUser, balance: creditBalance }} onRefresh={async () => {
        try {
          const balRes = await profileService.getCreditBalance();
          if (balRes?.success) setCreditBalance(balRes.data?.balance ?? 0);
        } catch (_) {}
      }} />

      <div className="menu-profile-section-group">
        <div className="menu-profile-section-heading">Tài khoản</div>
        <div className="menu-profile-item" onClick={() => navigate("/profile")}>
          <span className="menu-profile-icon-wrapper"><FaUser /></span>
          Hồ sơ
        </div>
        <div className="menu-profile-item">
          <span className="menu-profile-icon-wrapper"><FaHeart /></span>
          Danh sách yêu thích
        </div>
      </div>

      <div className="menu-profile-section-group">
        <div className="menu-profile-section-heading">Settings</div>
        
        {/* Theme Toggle */}
        <div className="menu-profile-theme-row">
        <span className="menu-profile-theme-icon">{ theme === "light" ? <FaSun /> : <FaMoon />}</span>
        <span className="menu-profile-theme-label">{ theme === "light"  ? "Chế độ sáng" : "Chế độ tối" }</span>
        <label className="menu-profile-switch">
          <input
            type="checkbox"
            checked={theme === "light"}
            onChange={toggleTheme}
            aria-label="Toggle dark mode"
          />
          <span className="menu-profile-slider"></span>
        </label>
      </div>

        {/* UI Mode Toggle */}
        <div className="menu-profile-theme-row">
          <span className="menu-profile-theme-icon">
            {uiMode === "advanced" ? <FaSlidersH /> : <FaBolt />}
          </span>
          <span className="menu-profile-theme-label">
            {uiMode === "advanced" ? "Chế độ nâng cao" : "Chế độ cơ bản"}
          </span>
          <label className="menu-profile-switch">
            <input
              type="checkbox"
              checked={uiMode === "advanced"}
              onChange={toggleUIMode}
              aria-label="Toggle UI mode"
            />
            <span className="menu-profile-slider"></span>
          </label>
        </div>

        <div className="menu-profile-item" data-url="/user/settings" onClick={handleAction}>
          <span className="menu-profile-icon-wrapper"><FaCog /></span>
          Cài đặt tài khoản
        </div>
        <div className="menu-profile-item">
          <span className="menu-profile-icon-wrapper"><FaLock /></span>
          Bảo mật
        </div>
        <div className="menu-profile-item">
          <span className="menu-profile-icon-wrapper"><FaQuestionCircle /></span>
          Trung tâm trợ giúp
        </div>
      </div>

      <div className="menu-profile-item menu-profile-logout" onClick={handleLogout}>
        <span className="menu-profile-icon-wrapper"><FaSignOutAlt /></span>
        Đăng xuất
      </div>
    </div>
  );
}
