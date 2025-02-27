import { Point } from './types';

export const DrawProjectBezierLine = (ctx: CanvasRenderingContext2D, start: Point, end: Point, previous: Point | null): Point => {
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