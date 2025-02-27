import React, { useEffect, useRef, useCallback, useState } from 'react';

interface Point {
    x: number;
    y: number;
}

interface DrawingCanvasProps {
    width?: number;
    height?: number;
    dotSize?: number;
    renderControls?: (clearFn: () => void) => React.ReactNode;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
    width: defaultWidth = 800,
    height: defaultHeight = 600,
    dotSize = 4,
    renderControls
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPointRef = useRef<Point | null>(null);
    const [dimensions, setDimensions] = useState({ width: defaultWidth, height: defaultHeight });

    const updateDimensions = useCallback(() => {
        if (!containerRef.current) return;
        
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const aspectRatio = defaultWidth / defaultHeight;
        let newWidth = containerWidth;
        let newHeight = containerWidth / aspectRatio;
        
        if (newHeight > containerHeight) {
            newHeight = containerHeight;
            newWidth = containerHeight * aspectRatio;
        }
        
        setDimensions({
            width: Math.floor(newWidth),
            height: Math.floor(newHeight)
        });
    }, [defaultWidth, defaultHeight]);

    useEffect(() => {
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [updateDimensions]);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);
        ctx.fillStyle = 'black';
        
        lastPointRef.current = null;
    }, [dimensions]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        clearCanvas();

        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'black';
        ctx.lineCap = 'round';
        ctx.lineWidth = dotSize / 2;

        const drawPoint = (x: number, y: number) => {
            const newPoint = { x, y };
            
            // Draw connecting line if there's a previous point
            if (lastPointRef.current) {
                ctx.beginPath();
                ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
                ctx.lineTo(x, y);
                ctx.stroke();
                
                // Draw the dot
                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                ctx.fill();
                
                lastPointRef.current = newPoint;
            } else {
                // First point of stroke
                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                ctx.fill();
                lastPointRef.current = newPoint;
            }
        };

        const handlePointerDown = (e: PointerEvent) => {
            lastPointRef.current = null;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            drawPoint(x, y);
        };

        const handlePointerMove = (e: PointerEvent) => {
            if (e.buttons !== 1) {
                lastPointRef.current = null;
                return;
            }
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            drawPoint(x, y);
        };

        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointermove', handlePointerMove);

        return () => {
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointermove', handlePointerMove);
        };
    }, [dotSize, clearCanvas, dimensions]);

    return (
        <div>
            {renderControls && renderControls(clearCanvas)}
            <div ref={containerRef} className="canvas-container">
                <canvas
                    ref={canvasRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    style={{
                        border: '3px solid black',
                        borderRadius: '8px',
                        touchAction: 'none',
                    }}
                />
            </div>
        </div>
    );
}; 