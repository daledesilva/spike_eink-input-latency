import { Coord } from './types';

const subdividePoints = (points: Coord[]): Coord[] => {
    if (points.length < 2) return points;
    
    const newPoints: Coord[] = [];
    
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        
        // Create two new points at 1/4 and 3/4 along each line segment
        const q = {
            x: 0.75 * p0.x + 0.25 * p1.x,
            y: 0.75 * p0.y + 0.25 * p1.y
        };
        
        const r = {
            x: 0.25 * p0.x + 0.75 * p1.x,
            y: 0.25 * p0.y + 0.75 * p1.y
        };
        
        newPoints.push(q, r);
    }
    
    return newPoints;
};

export const DrawChaikinLine = (
    ctx: CanvasRenderingContext2D, 
    start: Coord, 
    end: Coord, 
    previous: Coord | null,
    iterations: number = 4
): Coord => {
    // Create initial points array
    const points: Coord[] = [];
    if (previous) points.push(previous);
    points.push(start, end);
    
    // Apply Chaikin's algorithm
    let currentPoints = points;
    for (let i = 0; i < iterations; i++) {
        currentPoints = subdividePoints(currentPoints);
    }
    
    // Save current context state
    ctx.save();
    
    // Draw the smoothed curve
    ctx.beginPath();
    ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
    for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
    }
    ctx.stroke();
    
    // Restore context state
    ctx.restore();
    
    // Return the end point for future reference
    return end;
}; 