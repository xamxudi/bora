import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import profileService from '../../services/ProfileService';
import { FaShieldAlt, FaMobileAlt, FaTrashAlt } from 'react-icons/fa';
import './AccountSettings.css';

function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browser = "Không rõ";
  let os = "Không rõ";

  // Lấy OS
  if (userAgent.indexOf("Win") !== -1) os = "Windows";
  else if (userAgent.indexOf("Mac") !== -1) os = "MacOS";
  else if (userAgent.indexOf("Linux") !== -1) os = "Linux";
  else if (/Android/.test(userAgent)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(userAgent)) os = "iOS";

  // Lấy Browser
  if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edg") === -1) {
    browser = "Chrome";
  } else if (userAgent.indexOf("Firefox") > -1) {
    browser = "Firefox";
  } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
    browser = "Safari";
  } else if (userAgent.indexOf("Edg") > -1) {
    browser = "Edge";
  } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1) {
    browser = "Internet Explorer";
  }

  return `${os} • ${browser}`;
}

export default function AccountSettings() {
	const { currentUser, logout } = useAuth();
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);
	const [twoFA, setTwoFA] = useState(false);
  	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage(null); setError(null);
		if (!password || password !== confirm) {
			setError('Mật khẩu xác nhận không khớp');
			return;
		}
		setLoading(true);
		try {
			const res = await profileService.changePassword(currentUser?.id || currentUser?.userId || currentUser?.Id, password);
			if (res.success) setMessage('Đổi mật khẩu thành công');
			else setError(res.message || 'Đổi mật khẩu thất bại');
		} catch (_) {
			setError('Đổi mật khẩu thất bại');
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = () => {
		logout();
		navigate("/login");
	};
	const info = getBrowserInfo();

	return (
		<div className="settings-page">
			<h1>Cài đặt tài khoản</h1>
			<div className="settings-main">
				{message && <div className="alert success">{message}</div>}
				{error && <div className="alert error">{error}</div>}

				{/* Thông tin nhanh */}
				<div className="settings-overview">
					<div className="settings-card">
						<h3>Tài khoản</h3>
						<div className="muted">Tên: <b>{currentUser?.name || currentUser?.fullName || 'User'}</b></div>
						<div className="muted">Email: <b>{currentUser?.email || '—'}</b></div>
					</div>
					<div className="settings-card">
						<h3>Bảo mật</h3>
						<div className="settings-security-row">
							<FaShieldAlt />
							<span>Two‑Factor Authentication</span>
							<label className="menu-profile-switch settings-switch">
								<input disabled type="checkbox" checked={twoFA} onChange={() => setTwoFA(v => !v)} />
								<span className="menu-profile-slider"></span>
							</label>
						</div>
					</div>
				</div>

				{/* Đổi mật khẩu */}
				<div className="settings-card settings-section">
					<h3>Đổi mật khẩu</h3>
					<form onSubmit={handleSubmit} className="settings-form" autoComplete="off">
						<label className="full">
							<span>Mật khẩu mới</span>
							<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu mới" />
						</label>
						<label className="full">
							<span>Xác nhận mật khẩu</span>
							<input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Nhập lại mật khẩu" />
						</label>
						<div className="settings-actions">
							<button type="submit" className="primary" disabled={loading}>
								{loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
							</button>
						</div>
					</form>
				</div>

				{/* Thiết bị & phiên đăng nhập */}
				<div className="settings-card settings-section">
					<h3>Thiết bị & phiên đăng nhập</h3>
					<div className="device-list">
						<div className="device-item">
							<FaMobileAlt /> <span className="muted">{info} • Hiện tại</span>
							<button style={{ marginLeft: 'auto' }} className="buy-btn" onClick={handleLogout}>Đăng xuất</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}


