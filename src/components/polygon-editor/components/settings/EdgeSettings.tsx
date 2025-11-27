'use client';

import { Edge } from '@/hooks/usePolygon';

export interface EdgeSettingsProps {
  edges: Edge[];
  onEdgeCurvatureChange: (edgeIndex: number, curvature: number) => void;
}

export function EdgeSettings({ edges, onEdgeCurvatureChange }: EdgeSettingsProps) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-medium">边线弧度</h4>
      <div className="space-y-3">
        {edges.map((edge, index) => (
          <div key={`edge-${index}`} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-600 dark:text-gray-400">
                边线 {index + 1}
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {edge.curvature.toFixed(0)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">直</span>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={edge.curvature}
                onChange={(e) => onEdgeCurvatureChange(index, parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                style={{
                  background: `linear-gradient(to right, 
                    #ef4444 0%, 
                    #f59e0b 25%, 
                    #10b981 50%, 
                    #f59e0b 75%, 
                    #ef4444 100%)`
                }}
              />
              <span className="text-xs text-gray-400">弯</span>
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onEdgeCurvatureChange(index, 0)}
                className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                重置
              </button>
            </div>
          </div>
        ))}
        
        {edges.length === 0 && (
          <p className="text-xs text-gray-500 italic">请先添加一些顶点</p>
        )}
      </div>
    </div>
  );
}