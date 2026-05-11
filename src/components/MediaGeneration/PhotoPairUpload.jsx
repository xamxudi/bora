import React, { useEffect, useRef, useState } from "react";
import "./PhotoPairUpload.css";
import { useMessage } from '../../contexts/MessageContext';

export default function PhotoPairUpload({
    mode = "double",
    initial = [null, null],
    onChange = () => { },
    allowSwap = true,
    labels = ["Ảnh 1", "Ảnh 2"],
    className = "",
}) {
    const [images, setImages] = useState(initial);
    const fileInputs = useRef([]);
    const message = useMessage();

    useEffect(() => {
        if (images.length < 2) {
            const newImages = [...images, null];
            setImages(newImages)
        }
    }, [mode])
    
    useEffect(() => {
       setImages(initial);
    }, [initial[0], initial[1]])

    const handleFileChange = (file, index) => {
        if (!file) return;

        const newImages = [...images]; // copy mảng hiện tại

        const reader = new FileReader();
        reader.onloadend = () => {
            newImages[index] = { file, base64: reader.result }; // update đúng index
            setImages(newImages);
            onChange(newImages);
        };

        reader.readAsDataURL(file);
    };

    const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tiff'];
    const handleFileInput = (e, index) => {
        const file = e.target.files[0];
        // 1️⃣ Kiểm tra extension
        const ext = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            message.warning('Chỉ cho phép các file hình: ' + allowedExtensions.join(', '));
            e.target.value = ''; // reset input
            return;
        }

        // 2️⃣ Kiểm tra MIME type (nếu muốn)
        if (!file.type.startsWith('image/')) {
            alert('File không hợp lệ');
            message.warning('File không hợp lệ');
            e.target.value = '';
            return;
        }
        handleFileChange(file, index);
    };

    const handleDrop = (e, index) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleFileChange(file, index);
    };

    const handleFileClick = (index) => {
        fileInputs.current[index]?.click();
    };

    const handleSwap = () => {
        if (mode !== "double") return;
        const swapped = [images[1], images[0]];
        setImages(swapped);
        onChange(swapped);
    };

    const handleRemove = (index) => {
        const newImages = [...images];
        newImages[index] = null;
        setImages(newImages);
        onChange(newImages);
    };

    return (
        <div className={`photo-pair-upload ${className}`}>
            <div className="photo-slots">
                {images.map((img, idx) => {
                    if (mode === "single" && idx === 1) return null;
                    return (
                        <div
                            key={idx}
                            className="photo-slot"
                            onClick={() => handleFileClick(idx)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, idx)}
                        >
                            <input
                                type="file"
                                accept=".png,.jpg,.jpeg,.gif,.webp,.bmp,.tiff"
                                ref={(el) => (fileInputs.current[idx] = el)}
                                style={{ display: "none" }}
                                onChange={(e) => handleFileInput(e, idx)}
                            />
                            {img ? (
                                <>
                                    <img src={img.base64} alt={`preview-${idx}`} className="preview" />
                                    <button
                                        className="remove-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(idx);
                                        }}
                                    >
                                        ✕
                                    </button>
                                </>
                            ) : (
                                <div className="upload-placeholder">
                                    <p>{labels[idx] || "Chọn ảnh"}</p>
                                    <small>Kéo thả hoặc click để chọn file</small>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {allowSwap && mode === "double" && (
                <button onClick={handleSwap} className="swap-btn">
                    <svg fill="#000000" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M371.28,244.753v95.598H202.578V264.3L39.617,388.15L202.578,512v-76.051h264.3V244.753H371.28z M450.008,419.079h-264.3v58.911l-118.21-89.84l118.21-89.84v58.911H388.15v-95.598h61.857V419.079z" />
                        <rect x="126.689" y="375.79" transform="matrix(0.6139 -0.7894 0.7894 0.6139 -269.78 264.1392)" width="16.87" height="64.119" />
                        <path d="M472.383,123.85L309.422,0v76.051h-264.3v191.196h95.598v-95.598h168.702V247.7L472.383,123.85z M123.85,154.779v95.598H61.992V92.921h264.3V34.01l118.21,89.84l-118.21,89.84v-58.911H123.85z" />
                        <rect x="368.5" y="72.106" transform="matrix(0.6139 -0.7894 0.7894 0.6139 63.3109 337.7681)" width="16.87" height="64.119" />
                    </svg>
                </button>
            )}
        </div>
    );
}
