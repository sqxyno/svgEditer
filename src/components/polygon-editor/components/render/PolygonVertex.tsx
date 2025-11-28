'use client';

import { Point } from '@/hooks/usePolygon';
import { motion } from 'motion/react';
import { MouseEvent, useCallback, useEffect, useRef } from 'react';

/**
 * 多边形顶点组件属性
 */
export interface PolygonVertexProps {
  point: Point;
  index: number;
  isActive: boolean;
  onDragStart: (index: number) => void;
  onContextMenu: (e: MouseEvent<HTMLDivElement>, index: number) => void;
  onRadiusChange?: (index: number, radius: number) => void;
}

/**
 * 多边形顶点组件
 * 渲染可拖拽的多边形顶点，支持圆角调整
 */
export function PolygonVertex({
  point,
  index,
  isActive,
  onDragStart,
  onContextMenu,
  onRadiusChange,
}: PolygonVertexProps) {
  const currentRadius = point.radius ?? 0;
  const vertexRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);

  // 使用原生事件监听器处理滚轮，避免 passive listener 问题
  useEffect(() => {
    const element = vertexRef.current;
    if (!element || !isActive || !onRadiusChange) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY > 0 ? -1 : 1;
      const newRadius = Math.max(0, Math.min(50, currentRadius + delta));
      onRadiusChange(index, newRadius);
    };

    // 使用 { passive: false } 来允许 preventDefault
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [isActive, onRadiusChange, index, currentRadius]);

  // 为圆角调整控件也添加滚轮事件监听
  useEffect(() => {
    const element = controlRef.current;
    if (!element || !isActive || !onRadiusChange) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY > 0 ? -1 : 1;
      const newRadius = Math.max(0, Math.min(50, currentRadius + delta));
      onRadiusChange(index, newRadius);
    };

    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [isActive, onRadiusChange, index, currentRadius]);

  // 处理滑块变化
  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onRadiusChange) return;
      const newRadius = Number(e.target.value);
      onRadiusChange(index, newRadius);
    },
    [onRadiusChange, index]
  );

  return (
    <>
      <motion.div
        ref={vertexRef}
        className={`absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 transform cursor-move rounded-full ${isActive ? 'bg-red-500 ring-2 ring-red-200 dark:ring-red-800' : 'bg-blue-500 hover:bg-blue-600'}`}
        style={{
          left: `${point.x}%`,
          top: `${point.y}%`,
          boxShadow: isActive ? '0 0 0 2px white' : 'none',
        }}
        onMouseDown={() => onDragStart(index)}
        onContextMenu={e => onContextMenu(e, index)}
        animate={{
          scale: isActive ? 1.25 : 1,
        }}
        whileHover={{ scale: 1.25 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.div
          className="absolute -top-6 left-1/2 -translate-x-1/2 transform rounded-md bg-gray-800 px-1.5 py-0.5 text-xs text-white shadow-sm whitespace-nowrap"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          animate={{ opacity: isActive ? 1 : 0 }}
        >
          顶点 {index + 1}
        </motion.div>
      </motion.div>

      {/* 圆角调整控件 - 仅在选中时显示 */}
      {isActive && onRadiusChange && (
        <motion.div
          ref={controlRef}
          className="absolute z-20 transform"
          style={{
            left: point.x < 50 ? `${point.x}%` : 'auto',
            right: point.x >= 50 ? `${100 - point.x}%` : 'auto',
            top: point.y < 50 ? `${point.y}%` : 'auto',
            bottom: point.y >= 50 ? `${100 - point.y}%` : 'auto',
            marginTop: point.y < 50 ? '40px' : 'auto',
            marginBottom: point.y >= 50 ? '40px' : 'auto',
            transform: point.x < 50 ? 'translateX(0)' : 'translateX(-100%)',
          }}
          initial={{ opacity: 0, scale: 0.8, y: point.y < 50 ? -10 : 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: point.y < 50 ? -10 : 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="rounded-lg border border-gray-300 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm dark:border-gray-600 dark:bg-gray-800/95">
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">圆角</label>
              <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                {currentRadius}px
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative h-1.5 w-24">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={currentRadius}
                  onChange={handleSliderChange}
                  className="absolute h-1.5 w-24 cursor-pointer appearance-none rounded-lg bg-transparent"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentRadius / 50) * 100}%, transparent ${(currentRadius / 50) * 100}%, transparent 100%)`,
                  }}
                  onClick={e => e.stopPropagation()}
                />
                <div className="pointer-events-none absolute h-1.5 w-24 rounded-lg bg-gray-200 dark:bg-gray-700 -z-10" />
              </div>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onRadiusChange(index, 0);
                }}
                className="rounded px-1.5 py-0.5 text-xs text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                title="重置圆角"
              >
                重置
              </button>
            </div>
            <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-500">滚轮调整</div>
          </div>
        </motion.div>
      )}
    </>
  );
}
