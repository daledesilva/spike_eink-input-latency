import React from 'react';
import { Point } from './DrawingCanvas';
import { Coord } from '../lineInterpolation/types';

//////////////////////

interface DataTableProps {
  points: Array<Point>;
}

interface RowData {
  distance: number;
  latency: number;
}

const calculateDistance = (p1: Coord, p2: Coord): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const DataTable: React.FC<DataTableProps> = ({ points }) => {

  let prevPoint: Point | null = null;
  const rows: RowData[] = points.map((curPoint) => {
    const row: RowData = {
      distance: 0,
      latency: 0,
    };
    if(prevPoint !== null) {
      row.distance = calculateDistance(prevPoint.coord, curPoint.coord);
      row.latency = curPoint.timestamp - prevPoint.timestamp;
    }
    prevPoint = curPoint;
    return row;
  });

  const avgLatency = Math.round( rows.reduce((sum, row) => sum + row.latency, 0) / rows.length );


  return (
    <div>
      <table className="data-table">
        <tbody>
          <tr>
              <td>Average<br />Latency</td>
              <td>{avgLatency}</td>
          </tr>
        </tbody>
      </table>
      <table className="data-table">
        <thead>
          <tr>
            <th>Distance<br />(px)</th>
            <th>Latency<br />(ms)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{row.distance.toFixed(4)}</td>
              <td>{row.latency.toFixed(0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 