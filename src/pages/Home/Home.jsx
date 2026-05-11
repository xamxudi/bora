import React, { useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import "./Home.css";

import ImageGallery from "../../components/sections/ImageGallery";
import View from "../../components/layout/View";
import {
    FaMagic,
    FaVideo
} from "react-icons/fa";
import { HiOutlineTranslate } from "react-icons/hi";
import { RiChatAiFill } from "react-icons/ri";

const features = [
    {
        icon: <FaMagic />,
        title: "Tạo hình ảnh",
        description: "Tạo ảnh ra nhanh chóng với đầy đủ quyền kiểm soát",
        path: "/generate/image",
        gradient: "from-purple-500 to-pink-500"
    },
    {
        icon: <FaVideo />,
        title: "Tạo Video",
        description: "Tạo video ra nhanh chóng với đầy đủ quyền kiểm soát",
        path: "/generate/video",
        gradient: "from-blue-500 to-cyan-500"
    },
    {
        icon: <HiOutlineTranslate />,
        title: "Dịch thuật",
        description: "Dịch văn bản và file nhanh chóng với độ chính xác nhất",
        path: "/translation",
        gradient: "from-green-500 to-emerald-500"
    },
    {
        icon: <RiChatAiFill />,
        title: "Chat AI",
        description: "Trả lời ra nhanh và chính xác nhất",
        path: "/GenerativeAIChat",
        gradient: "from-orange-500 to-red-500"
    },
];

const columnLayouts = {
    "4": [
        { name: "equal", ratios: [1, 1, 1, 1] },
        { name: "center-focus", ratios: [1, 2, 2, 1] }
    ],
    "5": [
        { name: "equal", ratios: [1, 1, 1, 1, 1] },
        { name: "outside-small", ratios: [1, 2, 3, 2, 1] },
        { name: "alternate", ratios: [2, 1, 2, 1, 2] }
    ],
    "6": [
        { name: "equal", ratios: [1, 1, 1, 1, 1, 1] },
        { name: "outside-small", ratios: [1, 2, 2, 2, 2, 1] },
        { name: "center-strong", ratios: [1, 2, 3, 3, 2, 1] }
    ],
    "7": [
        { name: "equal", ratios: [1, 1, 1, 1, 1, 1, 1] },
        { name: "golden", ratios: [1, 1.6, 1, 1.6, 1, 1.6, 1] }
    ]
};

function getRandomLayout() {
    const colCounts = Object.keys(columnLayouts);
    const randomCol = colCounts[Math.floor(Math.random() * colCounts.length)];
    const layouts = columnLayouts[randomCol];
    const randomIndex = Math.floor(Math.random() * layouts.length);
    return { colCount: parseInt(randomCol, 10), ...layouts[0] };
}

const Home = () => {
    const navigate = useNavigate();

    const chosenLayout = useMemo(() => getRandomLayout(), []);

    return (
        <View>
            {/* Feature Cards */}
            <div className="feature-section">
                <div className="feature-grid">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`feature-card feature-card-${index + 1}`}
                            onClick={() => navigate(feature.path)}
                        >
                            <div className="feature-card-inner">
                                <div className="feature-icon-wrapper">
                                    <div className="feature-icon">
                                        {feature.icon}
                                    </div>
                                </div>
                                <div className="feature-content">
                                    <h3 className="feature-title">{feature.title}</h3>
                                    <p className="feature-description">{feature.description}</p>
                                </div>
                            </div>
                            <div className="feature-bg-gradient"></div>
                        </div>
                    ))}
                </div>
            </div>
            <div >
            <ImageGallery 
            columnWidths={chosenLayout.ratios} columns={chosenLayout.colCount}
             className="scroll-container" style={{ height: "calc(120vh - 200px)", 
             background: "transparent" }} />
            </div>
        </View>
    );
};

export default Home;