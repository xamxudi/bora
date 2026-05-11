import React, { useEffect, useState, useRef } from 'react';
import profileService from '../../services/ProfileService';
import { useAuth } from '../../contexts/AuthContext';
import './Profile.css';
import { FaUser } from 'react-icons/fa';
import CreationsGallery from '../../components/CreationsGallery';
import BoraCredit from "../../components/ui/BoraCredit";

const initialForm = {
	fullName: '',
	email: '',
	dateOfBirth: '',
	citizenId: '',
	address: '',
};

const Profile = () => {
	const { currentUser } = useAuth();
	const [form, setForm] = useState(initialForm);
	const [loading, setLoading] = useState(false);
	const [editing, setEditing] = useState(false);
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);
	const [avatarUrl, setAvatarUrl] = useState('');
	const [saved, setSaved] = useState({ fullName: '', email: '' });
	const [subscription, setSubscription] = useState(null);
	const [transactions, setTransactions] = useState([]);
	const [credits, setCredits] = useState(0);
	const [userStats, setUserStats] = useState({ imageCount: 0, videoCount: 0 });
	const [showGallery, setShowGallery] = useState(false);
	const [galleryType, setGalleryType] = useState('all');
	const fileInputRef = useRef(null);

	useEffect(() => {
		const fetchProfile = async () => {
			setLoading(true);
			try {
				const result = await profileService.getProfile();
				if (result.success && result.data) {
					const data = result.data;
					setForm({
						fullName: data.fullName || data.name || '',
						email: data.email || '',
						dateOfBirth: data.dateOfBirth ? String(data.dateOfBirth).substring(0, 10) : '',
						citizenId: data.citizenId || data.taxId || '',
						address: data.address || '',
					});
					setSaved({
						fullName: data.fullName || data.name || '',
						email: data.email || '',
					});
					if (data.avatarUrl) {
						setAvatarUrl(data.avatarUrl);
					}
				} else {
					// Prefill from currentUser if API returns nothing yet
					setForm((prev) => ({
						...prev,
						fullName: currentUser?.name || currentUser?.fullName || '',
						email: currentUser?.email || '',
					}));
					setSaved({
						fullName: currentUser?.name || currentUser?.fullName || '',
						email: currentUser?.email || '',
					});
				}
				// Load subscription plan
				try {
					const subscriptionRes = await profileService.getSubscriptionPlan();
					setSubscription(subscriptionRes.data ?? {});
				} catch (_) { }
				// Load transactions
				try {
					const txRes = await profileService.getTransactions(20);
					console.log('Transactions response:', txRes);
					if (txRes?.success && Array.isArray(txRes.data)) {
						setTransactions(txRes.data);
					} else if (Array.isArray(txRes)) {
						setTransactions(txRes);
					}
				} catch (error) {
					console.error('Error loading transactions:', error);
				}
				// Load user stats
				try {
					const statsRes = await profileService.getUserStats();
					if (statsRes?.success && statsRes.data) {
						setUserStats({
							imageCount: statsRes.data.imageCount || 0,
							videoCount: statsRes.data.videoCount || 0
						});
					}
				} catch (error) {
					console.error('Error loading user stats:', error);
				}

				// Load credit balance
				try {
					const balRes = await profileService.getCreditBalance();
					if (balRes?.success) {
						setCredits(balRes.data?.balance ?? 0);
					}
				} catch (error) {
					console.error('Error loading credit balance:', error);
				}
			} catch (_) {
				// ignore; show minimal UI
			} finally {
				setLoading(false);
			}
		};
		fetchProfile();
	}, [currentUser]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		setError(null);
		try {
			const payload = {
				fullName: form.fullName,
				email: form.email,
				dateOfBirth: form.dateOfBirth || null,
				citizenId: form.citizenId || null,
				address: form.address || null,
			};
			const result = await profileService.updateProfile(payload);
			if (result.success) {
				setMessage(result.message || 'Cập nhật hồ sơ thành công');
				setEditing(false);
				setSaved({ fullName: form.fullName, email: form.email });
			} else {
				setError(result.message || 'Cập nhật hồ sơ thất bại');
			}
		} catch (_) {
			setError('Cập nhật hồ sơ thất bại');
		} finally {
			setLoading(false);
		}
	};
	const formatDate = (dateInput) => {
		const date = new Date(dateInput);
		return date.toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	return (
		<div className="profile-page">
			<h1>Hồ sơ cá nhân</h1>
			<div className="profile-layout">
				{/* Sidebar: user card + plan */}
				<aside className="profile-aside">
					<div className="user-card">
						<div className="user-header">
							<div className="avatar" title={editing ? 'Đổi ảnh' : ''} onClick={() => { if (editing && fileInputRef.current) fileInputRef.current.click(); }}>
								{avatarUrl ? <img src={avatarUrl} alt="avatar" /> : <div className="fallback-icon"><FaUser /></div>}
								{editing && <div className="upload-overlay">Đổi ảnh</div>}
							</div>
							<input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
								const file = e.target.files?.[0];
								if (!file) return;
								setLoading(true); setMessage(null); setError(null);
								try {
									const res = await profileService.uploadAvatar(file);
									if (res.success) {
										const url = res.data?.url || res.url || res.avatarUrl;
										if (url) setAvatarUrl(url);
										setMessage(res.message || 'Cập nhật ảnh đại diện thành công');
									} else {
										setError(res.message || 'Không thể cập nhật ảnh đại diện');
									}
								} catch (_) { setError('Không thể cập nhật ảnh đại diện'); } finally { setLoading(false); }
							}} />
							<div className="identity">
								<h2>{saved.fullName || currentUser?.name || currentUser?.fullName || currentUser?.userName || 'Người dùng'}</h2>
								<p>{saved.email || currentUser?.email || currentUser?.userName || 'email@example.com'}</p>
							</div>
						</div>

						{/* Credit Balance */}
						<div className="credit-balance">
							<div className="credit-row">
								<div className="credit-item">
									<span className="credit-label">Hàng tháng</span>
									<div className="credit-value">
										<BoraCredit value={credits}/>
									</div>
								</div>
								<div className="credit-item">
									<span className="credit-label">Vĩnh viễn</span>
									<div className="credit-value">
										<BoraCredit value={0}/>
									</div>
								</div>
							</div>
							{subscription == 'basic' && (
								<>
									<div className="upgrade-link">
										<a id="pricing-link" href="https://bora.ai.vn/pricing">Nâng cấp lên nhận <BoraCredit value={2000}/>/Tháng</a>
									</div>
									<button className="buy-btn" onClick={() => {
										const href = document.getElementById('pricing-link')?.getAttribute('href') || 'https://bora.ai.vn/pricing';
										window.open(href, '_blank');
									}}>
										<span className="buy-icon">🛒</span>
										Mua
									</button>
								</>
							)}
						</div>

						{/* User Stats */}
						<div className="user-stats">
							<div
								className="stat-item stat-item-clickable"
								onClick={() => {
									setGalleryType('images');
									setShowGallery(true);
								}}
							>
								<span className="stat-icon">🎨</span>
								<div className="stat-info">
									<div className="stat-value">{userStats.imageCount}</div>
									<div className="stat-label">Hình ảnh</div>
								</div>
							</div>
							<div
								className="stat-item stat-item-clickable"
								onClick={() => {
									setGalleryType('videos');
									setShowGallery(true);
								}}
							>
								<span className="stat-icon">🎬</span>
								<div className="stat-info">
									<div className="stat-value">{userStats.videoCount}</div>
									<div className="stat-label">Video</div>
								</div>
							</div>
						</div>

					</div>

					<div className="subscription-card">
						<h3>Gói đang sử dụng</h3>
						<div className="plan-chip">{subscription ? subscription.packageName : '—'}</div>
						{/* Chỉ hiển thị ngày đăng ký và hết hạn khi không phải gói BASIC */}
						{subscription && subscription.package?.toLowerCase() !== 'basic' && (subscription.startDate || subscription.endDate) && (
							<div style={{ marginTop: 8, display: 'grid', gap: 4 }}>
								{subscription.startDate && (<div className="muted">Ngày đăng ký: {formatDate(subscription.startDate)}</div>)}
								{subscription.endDate && (<div className="muted">Hết hạn: {formatDate(subscription.endDate)}</div>)}
							</div>
						)}
					</div>
				</aside>

				{/* Main: form + transactions */}
				<main className="profile-main">
					{message && <div className="alert success">{message}</div>}
					{error && <div className="alert error">{error}</div>}

					<form onSubmit={handleSubmit} className="profile-form" autoComplete="off">
						<div className="grid">
							<label>
								<span>Họ và tên</span>
								<input name="fullName" type="text" placeholder="Nhập họ và tên" value={form.fullName} onChange={handleChange} disabled={!editing || loading} />
							</label>
							<label>
								<span>Email</span>
								<input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} disabled={!editing || loading} />
							</label>
							<label>
								<span>Ngày sinh</span>
								<input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} disabled={!editing || loading} />
							</label>
							<label>
								<span>Căn cước công dân</span>
								<input name="citizenId" type="text" placeholder="Số CCCD" value={form.citizenId} onChange={handleChange} disabled={!editing || loading} />
							</label>
							<label className="full">
								<span>Địa chỉ</span>
								<input name="address" type="text" placeholder="Địa chỉ" value={form.address} onChange={handleChange} disabled={!editing || loading} />
							</label>
						</div>
						<div className="actions">
							{editing ? (
								<>
									<button type="button" className="secondary" onClick={() => setEditing(false)} disabled={loading}>
										Hủy
									</button>
									<button type="submit" className="primary" disabled={loading}>
										{loading ? 'Đang lưu...' : 'Lưu thay đổi'}
									</button>
								</>
							) : (
								<button type="button" className="primary" onClick={() => setEditing(true)}>
									Sửa
								</button>
							)}
						</div>
					</form>

					<div className="transactions-card">
						<h3>Lịch sử giao dịch</h3>
						{transactions?.length ? (
							<ul className="tx-list">
								{transactions.map((t) => (
									<li key={t.id} className={t.changeAmount >= 0 ? 'tx plus' : 'tx minus'}>
										<div className="tx-main">
											<span className="tx-reason">{t.reason || 'Giao dịch'}</span>
											<span className="tx-amount">{t.changeAmount > 0 ? `${t.changeAmount.toLocaleString('vi-VN')} ₫` : `${t.changeAmount.toLocaleString('vi-VN')} ₫`}</span>
										</div>
										<div className="tx-time">{t.createdAt ? formatDate(t.createdAt) : ''}</div>
									</li>
								))}
							</ul>
						) : (
							<div className="empty">Chưa có giao dịch</div>
						)}
					</div>
				</main>
			</div>

			{/* Creations Gallery Modal */}
			{showGallery && (
				<CreationsGallery
					type={galleryType}
					onClose={() => setShowGallery(false)}
				/>
			)}
		</div>
	);
};

export default Profile;

