import React, { useEffect, useRef, useCallback, useState } from 'react';
import { DrawLinearLine } from '../lineInterpolation/linearLine';
import { DrawChaikinLine } from '../lineInterpolation/chaikinLine';
import { getLineWidth, getShowDots, getSmoothingType } from '../atoms';
import { DrawingControls } from './DrawingControls';

interface DrawingCanvasProps {
    width?: number;
    height?: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
    width = 800,
    height = 600,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width, height });

    // Smoothing functions have been moved to separate files

    const updateDimensions = useCallback(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const aspectRatio = width / height;
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
    }, [width, height]);

    useEffect(() => {
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [updateDimensions]);



    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        clearCanvas(canvas, dimensions.width, dimensions.height);

        const handlePointerDown = (e: PointerEvent) => {
            prevPoint = null;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            addToLine(canvas, { x, y });
        };
        const handlePointerMove = (e: PointerEvent) => {
            if (e.buttons !== 1) {
                prevPoint = null;
                return;
            }
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            addToLine(canvas, { x, y });
        };
        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointermove', handlePointerMove);
        
        return () => {
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointermove', handlePointerMove);
        };
    }, [dimensions]);

    return (
        <div>
            <DrawingControls
                onClearCanvas={() => {
                    clearCanvas(canvasRef.current, dimensions.width, dimensions.height)
                }}
            />
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





function clearCanvas(canvas: HTMLCanvasElement | null, width: number, height: number) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'black';

    prevPoint = null;
}



interface Point {
    x: number;
    y: number;
}
let prevPoint: Point | null = null;

const addToLine = (canvas: HTMLCanvasElement | null, newPoint: Point) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const showDots = getShowDots();

    if (prevPoint) {
        drawLine(ctx, prevPoint, newPoint);
    }
    if (showDots) {
        drawPoint(ctx, newPoint);
    }
    prevPoint = newPoint;
};


const drawLine = (ctx: CanvasRenderingContext2D, prevPoint: Point, newPoint: Point) => {

    const smoothingType = getSmoothingType();
    const lineWidth = getLineWidth();
    ctx.strokeStyle = 'black';
    ctx.lineCap = 'round';
    ctx.lineWidth = lineWidth;

    if (smoothingType === 'chaikin') {
        DrawChaikinLine(
            ctx,
            prevPoint,
            newPoint,
            prevPoint
        );
    } else {
        DrawLinearLine(ctx, prevPoint, newPoint);
    }

};


const drawPoint = (ctx: CanvasRenderingContext2D, point: Point) => {
    const dotRadius = getLineWidth() * 2;

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(point.x, point.y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
}