import React, { useEffect, useRef, useCallback, useState } from 'react';
import { DrawLinearLine } from '../lineInterpolation/linearLine';
import { DrawChaikinLine } from '../lineInterpolation/chaikinLine';
import { getLineWidth, getShowDots, getSmoothingType, getIsHighFreq, isHighFreqAtom } from '../atoms';
import { DrawingControls } from './DrawingControls';
import { DataTable } from './DataTable';
import { Coord } from '../lineInterpolation/types';

interface DrawingCanvasProps {
    width?: number;
    height?: number;
}

export interface Point {
    coord: Coord;
    timestamp: number;
}

let dataTableInterval: number | undefined;

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
    width = 800,
    height = 500,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width, height });
    const pointGroupsRef = useRef<Point[][]>([]);
    const [pointGroupsId, setPointGroupsId] = useState<number>(0); // Controls when the screen refreshes
    const groupIndexRef = useRef<number>(-1);
    

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
            groupIndexRef.current++;
            prevPoint = null;
            addToLine(canvas, e);
        };
        const handlePointerMove = (e: PointerEvent) => {
            if (e.buttons !== 1) {
                prevPoint = null;
                return;
            }
            const isHighFreq = getIsHighFreq();
            if(isHighFreq) {
                const coalescedEvents = e.getCoalescedEvents();
                for (let coalescedEvent of coalescedEvents) {
                    addToLine(canvas, coalescedEvent);
                }
            } else {
                addToLine(canvas, e);
            }

            scheduleDataTableRefresh();
        };
        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointermove', handlePointerMove);
        return () => {
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointermove', handlePointerMove);
        };
    }, [dimensions]);


    function scheduleDataTableRefresh() {
        if(dataTableInterval) clearInterval(dataTableInterval);
        dataTableInterval = setInterval(() => {
            // force a refresh to update the DataTable
            setPointGroupsId((prevId) => prevId + 1);
        }, 2000);
    };

    const addToLine = (canvas: HTMLCanvasElement | null, e: PointerEvent) => {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const coord: Coord = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        const newPoint: Point = {
            coord: coord,
            timestamp: e.timeStamp, //performance.now()
        };

        // If the current group index is greater than the number of groups, start a new group to cater for it
        if(groupIndexRef.current+1 > pointGroupsRef.current.length) {
            // Start a new group (a new stroke)
            pointGroupsRef.current.push([]);
        }
        // Add the point to the group
        pointGroupsRef.current[groupIndexRef.current].push(newPoint);

        const showDots = getShowDots();

        if (prevPoint) {
            drawLine(ctx, prevPoint.coord, coord);
        }
        if (showDots) {
            drawPoint(ctx, coord);
        }
        prevPoint = newPoint;
    };

    const clearCanvasAndPoints = useCallback(() => {
        clearCanvas(canvasRef.current, dimensions.width, dimensions.height);
        pointGroupsRef.current = [];
        groupIndexRef.current = -1;
        setPointGroupsId((prevId) => prevId + 1);
    }, [dimensions]);

    return (
        <div className="drawing-ui-container">
            <DrawingControls onClearCanvas={clearCanvasAndPoints} />
            <div ref={containerRef} className="canvas-container">
                <canvas
                    ref={canvasRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    style={{
                        width: dimensions.width,
                        height: dimensions.height,
                        // Without this, it cuts drawing short on Boox Go 10.3 tablet
                        touchAction: 'none',
                    }}
                />
            </div>
            <div className="data-table-container">
                {pointGroupsRef.current.map((points, index) => (
                    <DataTable
                        points={points}
                        key={pointGroupsId + index}
                    />
                ))}
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



let prevPoint: Point | null = null;

const drawLine = (ctx: CanvasRenderingContext2D, prevCoord: Coord, newCoord: Coord) => {

    const smoothingType = getSmoothingType();
    const lineWidth = getLineWidth();
    ctx.strokeStyle = 'black';
    ctx.lineCap = 'round';
    ctx.lineWidth = lineWidth;

    if (smoothingType === 'chaikin') {
        DrawChaikinLine(
            ctx,
            prevCoord,
            newCoord,
            prevCoord
        );
    } else {
        DrawLinearLine(ctx, prevCoord, newCoord);
    }

};


const drawPoint = (ctx: CanvasRenderingContext2D, coord: Coord) => {
    const dotRadius = getLineWidth();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(coord.x, coord.y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
}