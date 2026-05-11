import React, {useMemo} from 'react';

import ImageGallery from "../../components/sections/ImageGallery";
import View from "../../components/layout/View";

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

const GalleryPage = () => {
    const chosenLayout = useMemo(() => getRandomLayout(), []);
    return (
        <View >           
            <ImageGallery columnWidths={chosenLayout.ratios} columns={chosenLayout.colCount} className="scroll-container" style={{background: "transparent" }} />
        </View>
    );
};

export default GalleryPage;
