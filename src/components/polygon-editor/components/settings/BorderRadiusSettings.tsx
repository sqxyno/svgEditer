'use client';

import { Point } from '@/hooks/usePolygon';

export interface BorderRadiusSettingsProps {
  points: Point[];
  onPointRadiusChange: (pointIndex: number, radius: number) => void;
  selectedIndex?: number | null;
  onSelectPoint?: (index: number | null) => void;
}

export function BorderRadiusSettings({
  points,
  onPointRadiusChange,
  selectedIndex,
  onSelectPoint,
}: BorderRadiusSettingsProps) {
  return (
    <div className="space-y-5">
      {points.map((point, index) => (
        <div
          key={`point-${index}`}
          onClick={() => onSelectPoint?.(selectedIndex === index ? null : index)}
          className={`p-2 rounded-lg cursor-pointer transition-colors ${selectedIndex === index ? 'bg-blue-50 ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}
        >
          <div className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
            顶点 {index + 1}
            {selectedIndex === index && <span className="text-xs text-blue-500">已选中</span>}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="50"
              value={point.radius ?? 0}
              onChange={e => onPointRadiusChange(index, Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                min="0"
                max="50"
                value={point.radius ?? 0}
                onChange={e => onPointRadiusChange(index, Number(e.target.value) || 0)}
                className="w-14 rounded border border-[#EAEDF2] px-2 py-1.5 text-sm text-center"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>
          </div>
        </div>
      ))}
      {points.length === 0 && <p className="text-sm text-gray-400">请先添加顶点</p>}
    </div>
  );
}
