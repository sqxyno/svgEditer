'use client';

import { Point } from '@/hooks/usePolygon';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import { useCallback } from 'react';

export interface VertexSettingsProps {
  points: Point[];
  onUpdatePoint: (index: number, point: Point) => void;
  onResetPolygon: () => void;
  selectedIndex?: number | null;
  onSelectPoint?: (index: number | null) => void;
}

export function VertexSettings({
  points,
  onUpdatePoint,
  onResetPolygon,
  selectedIndex,
  onSelectPoint,
}: VertexSettingsProps) {
  const STEP = 0.5;
  const FINE_STEP = 0.1;

  const movePoint = useCallback(
    (index: number, direction: 'up' | 'down' | 'left' | 'right', fine = false) => {
      const point = points[index];
      const step = fine ? FINE_STEP : STEP;
      let newX = point.x;
      let newY = point.y;

      switch (direction) {
        case 'up':
          newY = Math.max(0, point.y - step);
          break;
        case 'down':
          newY = Math.min(100, point.y + step);
          break;
        case 'left':
          newX = Math.max(0, point.x - step);
          break;
        case 'right':
          newX = Math.min(100, point.x + step);
          break;
      }

      onUpdatePoint(index, { ...point, x: newX, y: newY });
    },
    [points, onUpdatePoint, STEP, FINE_STEP]
  );

  return (
    <div className="space-y-5">
      {points.map((point, index) => (
        <div
          key={`point-${index}`}
          onClick={() => onSelectPoint?.(selectedIndex === index ? null : index)}
          className={`p-2 rounded-lg cursor-pointer transition-colors ${selectedIndex === index ? 'bg-blue-50 ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}
        >
          <div className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
            顶点 {index + 1}
            {selectedIndex === index && <span className="text-xs text-blue-500">已选中</span>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">X</label>
                <input
                  type="number"
                  className="w-16 rounded border border-[#EAEDF2] px-2 py-1.5 text-sm"
                  value={point.x.toFixed(1)}
                  min={0}
                  max={100}
                  step={0.1}
                  onChange={e => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) onUpdatePoint(index, { ...point, x: value });
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Y</label>
                <input
                  type="number"
                  className="w-16 rounded border border-[#EAEDF2] px-2 py-1.5 text-sm"
                  value={point.y.toFixed(1)}
                  min={0}
                  max={100}
                  step={0.1}
                  onChange={e => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) onUpdatePoint(index, { ...point, y: value });
                  }}
                />
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => movePoint(index, 'up')}
                className="p-1.5 rounded hover:bg-[#EAEDF2] text-gray-600"
                title="上移"
              >
                <ArrowUp size={16} />
              </button>
              <button
                onClick={() => movePoint(index, 'down')}
                className="p-1.5 rounded hover:bg-[#EAEDF2] text-gray-600"
                title="下移"
              >
                <ArrowDown size={16} />
              </button>
              <button
                onClick={() => movePoint(index, 'left')}
                className="p-1.5 rounded hover:bg-[#EAEDF2] text-gray-600"
                title="左移"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={() => movePoint(index, 'right')}
                className="p-1.5 rounded hover:bg-[#EAEDF2] text-gray-600"
                title="右移"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={onResetPolygon}
        className="w-full rounded bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600"
      >
        重置
      </button>
    </div>
  );
}
