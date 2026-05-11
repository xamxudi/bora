import React from 'react';

import ImageDetail from "../../components/sections/ImageDetail";
import ImageGallery from "../../components/sections/ImageGallery";
import View from "../../components/layout/View";

const ImageDetailPage = () => {
    return (
        <View >           
            <ImageDetail />
            <div style={{ marginTop: "32px", textAlign:"center", fontWeight: "bold", fontSize: "24px" }}>
                <p style={{color: "var(--color-text)"}}>Khám phá thêm</p>
                <ImageGallery columnWidths={[1, 1, 1, 1, 1]} columns={5} className="scroll-container" style={{ height: "calc(100vh - 200px)", background: "transparent" }} />
            </div>
        </View>
    );
};

export default ImageDetailPage;
