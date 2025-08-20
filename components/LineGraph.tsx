

import React, { useState, useMemo, useRef } from 'react';
import { GraphDataPoint } from '../types';

interface LineGraphProps {
  data: GraphDataPoint[];
}

const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const LineGraph: React.FC<LineGraphProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activePoint, setActivePoint] = useState<GraphDataPoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  const width = 500;
  const height = 250;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const { xScale, yScale, linePath, areaPath, ticksY, ticksX, maxValue } = useMemo(() => {
    if (data.length < 2) return { xScale: null, yScale: null, linePath: '', areaPath: '', ticksY: [], ticksX: [], maxValue: 0 };
    
    const dates = data.map(d => parseLocalDate(d.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);

    const values = data.map(d => d.total);
    const maxValue = Math.max(...values, 0) * 1.1; // Add 10% padding

    const xScale = (date: Date) => 
      margin.left + ((date.getTime() - minDate) / (maxDate - minDate)) * innerWidth;

    const yScale = (value: number) => 
      margin.top + innerHeight - (value / maxValue) * innerHeight;

    const lineGenerator = (points: GraphDataPoint[]) => {
      let path = `M ${xScale(parseLocalDate(points[0].date))} ${yScale(points[0].total)}`;
      points.slice(1).forEach(p => {
        path += ` L ${xScale(parseLocalDate(p.date))} ${yScale(p.total)}`;
      });
      return path;
    };

    const areaGenerator = (points: GraphDataPoint[]) => {
        let path = lineGenerator(points);
        path += ` L ${xScale(parseLocalDate(points[points.length - 1].date))} ${yScale(0)}`;
        path += ` L ${xScale(parseLocalDate(points[0].date))} ${yScale(0)}`;
        path += ' Z';
        return path;
    };
    
    const linePath = lineGenerator(data);
    const areaPath = areaGenerator(data);

    // Generate Y-axis ticks
    const tickCountY = 5;
    const ticksY = Array.from({ length: tickCountY + 1 }, (_, i) => {
        const value = (maxValue / tickCountY) * i;
        return { value: value, y: yScale(value) };
    });

    // Generate X-axis ticks
    const tickCountX = Math.min(data.length, 5);
    const ticksX = [];
    if (data.length > 0) {
      const step = Math.floor((data.length -1) / (tickCountX -1)) || 1;
      for (let i = 0; i < data.length; i += step) {
        const d = data[i];
        if (d) ticksX.push({ date: parseLocalDate(d.date), x: xScale(parseLocalDate(d.date)) });
      }
      if (data.length > 1 && !ticksX.find(t => parseLocalDate(t.date).getTime() === parseLocalDate(data[data.length-1].date).getTime())) {
          const lastDataPoint = data[data.length - 1];
          ticksX.push({ date: parseLocalDate(lastDataPoint.date), x: xScale(parseLocalDate(lastDataPoint.date)) });
      }
    }
    return { xScale, yScale, linePath, areaPath, ticksY, ticksX, maxValue };
  }, [data, innerWidth, innerHeight]);

    const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current || !xScale) return;
        const svgPoint = svgRef.current.createSVGPoint();
        svgPoint.x = event.clientX;
        svgPoint.y = event.clientY;
        const inverted = svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
        
        let closestPoint: GraphDataPoint | null = null;
        let minDistance = Infinity;

        data.forEach(d => {
            const date = parseLocalDate(d.date);
            const pointX = xScale(date);
            const distance = Math.abs(pointX - inverted.x);
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = d;
            }
        });

        if (closestPoint) {
            setActivePoint(closestPoint);
            setTooltipPosition({
                x: xScale(parseLocalDate(closestPoint.date)),
                y: yScale(closestPoint.total)
            });
        }
    };

    const handleMouseLeave = () => {
        setActivePoint(null);
        setTooltipPosition(null);
    };
    
    if (!xScale || !yScale) {
        return <div className="w-full h-full flex items-center justify-center text-sm text-[var(--text-secondary)]">Not enough data.</div>;
    }

    return (
        <div className="relative w-full h-full">
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ overflow: 'visible' }}>
            {/* Axes and Grid lines */}
            {ticksY.map(({ value, y }) => (
            <g key={`y-tick-${value}`} className="text-[10px] text-[var(--text-tertiary)]">
                <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="var(--border-secondary)" strokeDasharray="2,2" />
                <text x={margin.left - 8} y={y + 3} textAnchor="end">
                ${(value / 100).toFixed(value > 0 ? 2 : 0)}
                </text>
            </g>
            ))}
            {ticksX.map(({ date, x }) => (
            <g key={`x-tick-${date.toISOString()}`} className="text-[10px] text-[var(--text-tertiary)]">
                <text x={x} y={height - margin.bottom + 15} textAnchor="middle">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
            </g>
            ))}
            <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="var(--border-primary)" />
            <line y1={margin.top} x1={margin.left} y2={height - margin.bottom} x2={margin.left} stroke="var(--border-primary)" />
            
            {/* Area Gradient */}
            <defs>
            <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0} />
            </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#area-gradient)" stroke="none" />
            
            {/* Line Path */}
            <path d={linePath} fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" />

            {/* Data Points for hover */}
            {data.map(d => (
            <circle key={d.date} cx={xScale(parseLocalDate(d.date))} cy={yScale(d.total)} r="4" fill="var(--accent-primary)" />
            ))}

            {/* Tooltip */}
            {activePoint && tooltipPosition && (
                <g transform={`translate(${tooltipPosition.x}, ${tooltipPosition.y})`}>
                    <circle r="6" fill="var(--accent-primary)" stroke="var(--bg-secondary)" strokeWidth="2" />
                </g>
            )}
        </svg>

        {activePoint && tooltipPosition && (
            <div 
                className="absolute bg-black/80 text-white p-2 rounded-md text-xs pointer-events-none shadow-lg"
                style={{
                    top: tooltipPosition.y - 50,
                    left: tooltipPosition.x,
                    transform: 'translateX(-50%)',
                }}
            >
                <div>{parseLocalDate(activePoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div className="font-bold">${(activePoint.total / 100).toFixed(2)}</div>
            </div>
        )}
        </div>
    );
};

export default LineGraph;
