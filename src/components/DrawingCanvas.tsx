import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Point } from '../lineInterpolation/types';
import { DrawLinearLine } from '../lineInterpolation/linearLine';
import { DrawProjectBezierLine } from '../lineInterpolation/projectedBezierLine';
import { DrawChaikinLine } from '../lineInterpolation/chaikinLine';

interface DrawingCanvasProps {
    width?: number;
    height?: number;
    dotRadius?: number;
    lineWidth?: number;
    showDots?: boolean;
    initSmoothingType?: 'linear' | 'projected' | 'chaikin';
    renderControls?: (clearFn: () => void, setSmoothingFn: (type: 'linear' | 'projected' | 'chaikin') => void) => React.ReactNode;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
    width = 800,
    height = 600,
    dotRadius = 4,
    lineWidth = 2,
    showDots = true,
    initSmoothingType = 'linear',
    renderControls
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPointRef = useRef<Point | null>(null);
    const previousControlPointRef = useRef<Point | null>(null);
    const smoothingTypeRef = useRef<'linear' | 'projected' | 'chaikin'>(initSmoothingType);
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

    const setSmoothingType = (type: 'linear' | 'projected' | 'chaikin') => {
        smoothingTypeRef.current = type;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        clearCanvas();

        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'black';
        ctx.lineCap = 'round';
        ctx.lineWidth = lineWidth;

        const drawPoint = (x: number, y: number) => {
            const newPoint = { x, y };
            
            if (lastPointRef.current) {
                // Draw the actual curve/line (in black)
                ctx.strokeStyle = 'black';
                ctx.lineWidth = lineWidth;

                if (smoothingTypeRef.current === 'projected') {
                    const controlPoint = DrawProjectBezierLine(
                        ctx,
                        lastPointRef.current,
                        newPoint,
                        previousControlPointRef.current
                    );
                    previousControlPointRef.current = controlPoint;
                } else if (smoothingTypeRef.current === 'chaikin') {
                    const controlPoint = DrawChaikinLine(
                        ctx,
                        lastPointRef.current,
                        newPoint,
                        previousControlPointRef.current
                    );
                    previousControlPointRef.current = controlPoint;
                } else {
                    DrawLinearLine(ctx, lastPointRef.current, newPoint);
                }
                
                // Draw the endpoint dot
                ctx.fillStyle = 'black';
                ctx.beginPath();
                if(showDots) {
                    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                lastPointRef.current = newPoint;
            } else {
                // First point of stroke
                ctx.beginPath();
                ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
                ctx.fill();
                lastPointRef.current = newPoint;
                previousControlPointRef.current = null;
            }
        };

        const handlePointerDown = (e: PointerEvent) => {
            lastPointRef.current = null;
            previousControlPointRef.current = null;  // Reset on new stroke
            
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
    }, [lineWidth, dotRadius, clearCanvas, dimensions]);

    return (
        <div>
            {renderControls && renderControls(clearCanvas, setSmoothingType)}
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