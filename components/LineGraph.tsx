
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
      if (!ticksX.find(t => t.date.getTime() === parseLocalDate(data[data.length-1].date).getTime())) {
         ticksX.push({ date: parseLocalDate(data[data.length-1].date), x: xScale(parseLocalDate(data[data.length-1].date)) });
      }
    }


    return { xScale, yScale, linePath, areaPath, ticksY, ticksX, maxValue };
  }, [data, innerWidth, innerHeight]);

  const handleMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
    if (!xScale || !yScale || !svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const svgX = event.clientX - svgRect.left;

    // Find the closest point in the data
    let closestPoint: GraphDataPoint | null = null;
    let minDistance = Infinity;

    data.forEach(d => {
      const pointX = xScale(parseLocalDate(d.date));
      const distance = Math.abs(svgX - pointX);
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
  
  const formatDateTick = (date: Date) => {
    // Show month and day
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };


  if (!xScale || !yScale) return null;

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0"/>
            </linearGradient>
        </defs>

        {/* Y-axis */}
        <g className="text-[10px] text-[var(--text-tertiary)]">
          {ticksY.map(tick => (
            <g key={tick.value} transform={`translate(0, ${tick.y})`}>
              <line x1={margin.left} y1="0" x2={width - margin.right} y2="0" stroke="var(--border-primary)" strokeWidth="0.5" strokeDasharray="2,2"/>
              <text x={margin.left - 8} dy="0.32em" textAnchor="end" fill="currentColor">
                ${Math.round(tick.value / 100)}
              </text>
            </g>
          ))}
        </g>

        {/* X-axis */}
        <g className="text-[10px] text-[var(--text-tertiary)]" transform={`translate(0, ${height - margin.bottom})`}>
            {ticksX.map(tick => (
                <g key={tick.date.toISOString()} transform={`translate(${tick.x}, 0)`}>
                    <text y="20" textAnchor="middle" fill="currentColor">
                        {formatDateTick(tick.date)}
                    </text>
                </g>
            ))}
        </g>

        {/* Area and Line */}
        <path d={areaPath} fill="url(#areaGradient)" />
        <path d={linePath} fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" className="animate-draw" />
        
        {/* Interaction layer */}
        <rect
            x={margin.left}
            y={margin.top}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        />

        {/* Tooltip */}
        {activePoint && tooltipPosition && (
            <g transform={`translate(${tooltipPosition.x}, ${tooltipPosition.y})`}>
                <circle r="5" fill="var(--accent-primary)" stroke="var(--bg-secondary)" strokeWidth="2" />
                <g transform="translate(0, -10)" className="pointer-events-none">
                    <rect x="-45" y="-30" width="90" height="25" rx="5" fill="var(--bg-secondary)" stroke="var(--border-secondary)" />
                    <text x="0" y="-17.5" textAnchor="middle" fill="var(--text-primary)" fontSize="12" fontWeight="bold">
                        ${(activePoint.total / 100).toFixed(2)}
                    </text>
                </g>
            </g>
        )}
      </svg>
      <style>{`
        @keyframes draw {
            from { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
            to { stroke-dasharray: 1000; stroke-dashoffset: 0; }
        }
        .animate-draw {
            animation: draw 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LineGraph;
