import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "./ImageDetail.css";
import LazyImage from "../ui/LazyImage"
import Loadding from "../ui/PageLoading";
import api from "../../services/PicshareClient";
import { useAuth } from "../../contexts/AuthContext";
import CommentInput from "../ui/CommentInput/index";
import UserAvatar from "../ui/UserAvatar";
import ImageActions from "../sections/ImageActions";
import defaultUser from '../../assets/images/icon-user.png';
import {
    FaHeart,
    FaDownload,
    FaShare,
    FaComment,
    FaEye,
    FaClock,
    FaUser
} from "react-icons/fa";

export default function ImageDetail() {
    const { id } = useParams();
    const [image, setImage] = useState(null);
    const { currentUser } = useAuth();
    const [comments, setComments] = useState([]);
    const [pageInfo, setPageInfo] = useState({
        page: 1,
        pageSize: 5,
        randomSeed: Math.random(),
        orderKey: "CreatedAt",
        orderType: "desc"
    });

    async function fetchImage() {
        try {
            const res = await api.get(`/api/v1/media/${id}`);
            const data = await res.data;
            setImage({
                id: data.id,
                fileName: data.metadata.fileName,
                url: data.url,
                author: data.author,
                authorName: data.authorName || "Không rõ",
                title: data.title,
                description: data.description,
                likes: data.likeCount,
                comments: data.commentCount,
                views: data.viewCount || 0,
                createdAt: data.createdAt
            });
        } catch (err) {
            console.error("Lỗi load ảnh:", err);
        }
    };

    const handleLike = async () => {
        await api.post(`/api/media/${id}/like/toggle`);
        await fetchImage();
    };

    const handleComment = async (value) => {
        await api.post(`/api/media/${id}/comment`, value);
        await fetchImage();

        const newComment = {
            id: Date.now(),
            actorName: currentUser?.name || "Bạn",
            actorAvatar: currentUser?.avatarUrl,
            content: value,
            createdAt: new Date().toISOString()
        };

        setComments(prev => [...prev, newComment]);
    };

    const loadComments = async () => {
        var res = await api.get(`/api/v1/media/${id}/comments?page=${pageInfo.page}&pageSize=${pageInfo.pageSize}&orderType=${pageInfo.orderType}&orderKey=${pageInfo.orderKey}`);
        if (res.status == 200) {
            const data = await res.data;
            const cmts = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map(item => ({
                ...item,
                actorAvatar: item.actorAvatar ?? defaultUser
            }));
            setComments(cmts);
        }
    };

    function formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return "Vừa xong";
        if (diffMin < 60) return `${diffMin} phút trước`;
        if (diffHour < 24) return `${diffHour} giờ trước`;
        if (diffDay === 1) return "Hôm qua";
        if (diffDay < 7) return `${diffDay} ngày trước`;

        return date.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }

    const commentsRef = useRef(null);

    useEffect(() => {
        if (commentsRef.current) {
            commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
        }
    }, [comments]);

    useEffect(() => {
        fetchImage();
        loadComments();
    }, [id]);

    const handleSave = async () => {
        try {
            const resp = await fetch(image.url, { mode: "cors" });
            if (!resp.ok) throw new Error("Download failed");

            const blob = await resp.blob();
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `bora_ai_vn_${image.fileName}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Không thể tải file");
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: image.title || 'Hình ảnh từ Bora AI',
                    text: image.description || 'Xem hình ảnh tuyệt vời này!',
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Lỗi chia sẻ:', err);
            }
        } else {
            // Fallback: copy URL to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Đã copy link vào clipboard!');
        }
    };

    if (!image) return <Loadding message="Đang tải..." />;

    return (
        <div className="modern-image-detail">
            <div className="image-detail-container">
                {/* Main Image Section */}
                <div className="image-section">
                    <div className="image-wrapper">
                        <LazyImage
                            src={image.url + "?h=720"}
                            alt={image.title || `Hình ảnh ${image.id}`}
                            className="main-image"
                        />

                        {/* Floating Action Buttons */}
                        <div className="floating-actions">
                            <button
                                className="action-btn like-btn"
                                onClick={handleLike}
                                disabled={!currentUser}
                                title="Thích"
                            >
                                <FaHeart />
                                <span>{image.likes}</span>
                            </button>
                            <button
                                className="action-btn download-btn"
                                onClick={handleSave}
                                title="Tải xuống"
                            >
                                <FaDownload />
                            </button>
                            <button
                                className="action-btn share-btn"
                                onClick={handleShare}
                                title="Chia sẻ"
                            >
                                <FaShare />
                            </button>
                        </div>

                        {/* Image Stats Overlay */}
                        <div className="image-stats-overlay">
                            <div className="stat-item">
                                <FaEye />
                                <span>{image.views}</span>
                            </div>
                            <div className="stat-item">
                                <FaHeart />
                                <span>{image.likes}</span>
                            </div>
                            <div className="stat-item">
                                <FaComment />
                                <span>{image.comments}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info & Comments Section */}
                <div className="info-section">
                    <div className="image-info-card">
                        {/* Header */}
                        <div className="info-header">
                            <div className="author-info">
                                <UserAvatar
                                    className="author-avatar"
                                    name={image.authorName}
                                    imgUrl={image.author?.avatarUrl}
                                    size={48}
                                />
                                <div className="author-details">
                                    <h3 className="author-name">
                                        <FaUser size={14} />
                                        {image.authorName}
                                    </h3>
                                    <p className="upload-time">
                                        <FaClock size={12} />
                                        {image.createdAt ? formatRelativeTime(image.createdAt) : 'Không rõ thời gian'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Title & Description */}
                        <div className="content-info">
                        </div>

                        {/* Tags */}
                        <div className="image-tags">
                            <span className="tag">AI Art</span>
                            <span className="tag">Digital</span>
                            <span className="tag">High Quality</span>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="comments-section">
                        <div className="comments-header">
                            <h3 >
                                <FaComment />
                                Nhận xét
                                <span className="comment-count">({image.comments})</span>
                            </h3>
                        </div>

                        <div className="comments-container">
                            <div className="comments-list" ref={commentsRef}>
                                {comments.length > 0 ? (
                                    comments.map(comment => (
                                        <div key={comment.id} className="comment-item">
                                            <UserAvatar
                                                className="comment-avatar"
                                                name={comment.actorName}
                                                imgUrl={comment.actorAvatar}
                                                size={36}
                                            />
                                            <div className="comment-body">
                                                <div className="comment-header">
                                                    <span className="comment-author">{comment.actorName}</span>
                                                    <span className="comment-time">
                                                        {formatRelativeTime(comment.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="comment-content">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-comments">
                                        <FaComment size={48} />
                                        <p>Chưa có nhận xét nào</p>
                                        <h8>Hãy là người đầu tiên bình luận!</h8>
                                    </div>
                                )}
                            </div>

                            {/* Comment Input */}
                            <div className="comment-input-section">
                                <CommentInput
                                    disabled={!currentUser}
                                    className="modern-comment-input"
                                    onSend={handleComment}
                                    placeholder={currentUser ? "Viết nhận xét của bạn..." : "Đăng nhập để bình luận"}
                                />
                                {!currentUser && (
                                    <div className="login-prompt">
                                        <span>Bạn cần đăng nhập để bình luận</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}