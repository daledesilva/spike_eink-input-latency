import { Coord } from './types';

export const DrawLinearLine = (ctx: CanvasRenderingContext2D, start: Coord, end: Coord) => {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
}; 