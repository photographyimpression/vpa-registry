"use client";

import { useEffect, useRef } from "react";
// Dynamic import to prevent SSR document undefined error

interface DeepZoomViewerProps {
    imageUrl: string;
}

export default function DeepZoomViewer({ imageUrl }: DeepZoomViewerProps) {
    const viewerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!viewerRef.current) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let viewer: any;

        const initOSD = async () => {
            const OpenSeadragon = (await import('openseadragon')).default;
            viewer = OpenSeadragon({
                element: viewerRef.current!,
                prefixUrl: "/osd/",
                tileSources: imageUrl.endsWith(".dzi") || imageUrl.endsWith(".xml")
                    ? imageUrl
                    : {
                        type: "image",
                        url: imageUrl,
                    },
                showNavigator: true,
                animationTime: 0.5,
                blendTime: 0.1,
                constrainDuringPan: true,
                maxZoomPixelRatio: 2,
                minZoomImageRatio: 1,
                visibilityRatio: 1,
                zoomPerScroll: 2,
            });
        };

        initOSD();

        return () => {
            if (viewer) viewer.destroy();
        };
    }, [imageUrl]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div
                ref={viewerRef}
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#000",
                    border: '1px solid var(--border-color)',
                    cursor: 'crosshair'
                }}
            />
            <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '0.5rem 1rem',
                border: '1px solid var(--border-color)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                zIndex: 10,
                pointerEvents: 'none'
            }}>
                HIGH-RESOLUTION INSPECT MODE
            </div>
        </div>
    );
}
