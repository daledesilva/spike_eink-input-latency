import React, { useEffect, useRef, useCallback, useState } from 'react';

interface Point {
    x: number;
    y: number;
}

interface DrawingCanvasProps {
    width?: number;
    height?: number;
    dotSize?: number;
    initSmoothingType?: 'linear' | 'projected';
    renderControls?: (clearFn: () => void, setSmoothingFn: (type: string) => void) => React.ReactNode;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
    width: defaultWidth = 800,
    height: defaultHeight = 600,
    dotSize = 4,
    initSmoothingType = 'linear',
    renderControls
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPointRef = useRef<Point | null>(null);
    const previousControlPointRef = useRef<Point | null>(null);
    const smoothingTypeRef = useRef<'linear' | 'projected'>(initSmoothingType);
    const [dimensions, setDimensions] = useState({ width: defaultWidth, height: defaultHeight });

    // Smoothing functions
    const linearDraw = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    };

    const bezierProjected = (ctx: CanvasRenderingContext2D, start: Point, end: Point, previous: Point | null): Point => {
        const controlPoint = previous ? {
            x: start.x + (start.x - previous.x) * 0.5,
            y: start.y + (start.y - previous.y) * 0.5
        } : {
            x: (start.x + end.x) / 2,
            y: (start.y + end.y) / 2
        };

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.quadraticCurveTo(
            controlPoint.x,
            controlPoint.y,
            end.x,
            end.y
        );
        ctx.stroke();

        // Draw control point visualization (in red)
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        
        // Draw lines from control point to endpoints
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(controlPoint.x, controlPoint.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        
        // Draw control point circle
        ctx.beginPath();
        ctx.arc(controlPoint.x, controlPoint.y, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        return controlPoint;
    };

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

    const setSmoothingType = (type: 'linear' | 'projected') => {
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
        ctx.lineWidth = dotSize / 2;

        const drawPoint = (x: number, y: number) => {
            const newPoint = { x, y };
            
            if (lastPointRef.current) {
                // Draw the actual curve/line (in black)
                ctx.strokeStyle = 'black';
                ctx.lineWidth = dotSize / 2;

                if (smoothingTypeRef.current === 'projected') {
                    const controlPoint = bezierProjected(
                        ctx,
                        lastPointRef.current,
                        newPoint,
                        previousControlPointRef.current
                    );
                    previousControlPointRef.current = controlPoint;
                } else {
                    linearDraw(ctx, lastPointRef.current, newPoint);
                }
                
                // Draw the endpoint dot
                ctx.fillStyle = 'black';
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
    }, [dotSize, clearCanvas, dimensions]);

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