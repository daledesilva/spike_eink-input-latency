import { Point } from './types';

const subdividePoints = (points: Point[]): Point[] => {
    if (points.length < 2) return points;
    
    const newPoints: Point[] = [];
    
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
    start: Point, 
    end: Point, 
    previous: Point | null,
    iterations: number = 4
): Point => {
    // Create initial points array
    const points: Point[] = [];
    if (previous) points.push(previous);
    points.push(start, end);
    
    // Apply Chaikin's algorithm
    let currentPoints = points;
    for (let i = 0; i < iterations; i++) {
        currentPoints = subdividePoints(currentPoints);
    }
    
    // Draw the smoothed curve
    ctx.beginPath();
    ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
    for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
    }
    ctx.stroke();
    
    // Draw control points visualization (in blue)
    ctx.save();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 1;
    
    // Draw original polyline
    ctx.beginPath();
    ctx.setLineDash([5, 5]); // Make the original line dashed
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    
    // Draw points
    ctx.setLineDash([]); // Reset dash
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.stroke();
    });
    
    ctx.restore();
    
    // Return the last control point for future reference
    return points[points.length - 2] || start;
}; 