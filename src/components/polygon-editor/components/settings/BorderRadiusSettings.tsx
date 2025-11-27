'use client';

import { Point } from '@/hooks/usePolygon';

export interface BorderRadiusSettingsProps {
  points: Point[];
  onPointRadiusChange: (pointIndex: number, radius: number) => void;
}

export function BorderRadiusSettings({ points, onPointRadiusChange }: BorderRadiusSettingsProps) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-medium">顶点圆角</h4>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {points.map((point, index) => (
          <div
            key={`point-${index}`}
            className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
              顶点 {index + 1}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="50"
                step="1"
                value={point.radius ?? 0}
                onChange={event => onPointRadiusChange(index, Number(event.target.value) || 0)}
                className="w-24 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">px</span>
              <button
                type="button"
                onClick={() => onPointRadiusChange(index, 0)}
                className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                重置
              </button>
            </div>
          </div>
        ))}
        
        {points.length === 0 && (
          <p className="text-xs text-gray-500 italic">请先添加一些顶点</p>
        )}
      </div>
    </div>
  );
}