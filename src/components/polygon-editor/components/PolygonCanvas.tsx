'use client';

import { Point } from '@/hooks/usePolygon';
import { useFullscreen, useSize } from 'ahooks';
import { Maximize2, Minimize2 } from 'lucide-react';
import { MouseEvent, useCallback, useEffect, useRef } from 'react';
import { PolygonRenderer, PolygonVertex } from './render';

/**
 * 多边形画布组件属性
 */
export interface PolygonCanvasProps {
  points: Point[];
  activePointIndex: number | null;
  isDragging: boolean;
  backgroundImage?: string;
  previewSize?: { width: number; height: number };
  onPointDragStart: (index: number) => void;
  onPointDragEnd: () => void;
  onPointMove: (point: Point) => void;
  onPointAdd: (point: Point, insertIndex?: number) => void;
  onPointRemove: (index: number) => void;
  onPointRadiusChange?: (pointIndex: number, radius: number) => void;
}

/**
 * 多边形画布组件
 * 提供可视化编辑多边形顶点的功能
 */
export function PolygonCanvas({
  points,
  activePointIndex,
  isDragging,
  backgroundImage,
  previewSize,
  onPointDragStart,
  onPointDragEnd,
  onPointMove,
  onPointAdd,
  onPointRemove,
  onPointRadiusChange,
}: PolygonCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const size = useSize(canvasRef);
  // 使用ahooks的useFullscreen钩子
  const [isFullscreen, { toggleFullscreen }] = useFullscreen(canvasRef);

  // 处理画布点击事件 - 允许随时点击画布添加点
  const handleCanvasClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!canvasRef.current || isDragging) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // 检查是否点击在现有顶点附近，如果是则不添加新点
      const clickedNearPoint = points.some(point => {
        const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
        return distance < 5; // 5%的容差范围
      });

      if (!clickedNearPoint) {
        // 找到距离新点最近的边，便于在正确位置插入
        let insertIndex = points.length;
        let minDistance = Number.POSITIVE_INFINITY;

        points.forEach((point, index) => {
          const nextPoint = points[(index + 1) % points.length];

          const distance = pointToSegmentDistance({ x, y }, point, nextPoint);

          if (distance < minDistance) {
            minDistance = distance;
            insertIndex = index + 1;
          }
        });

        onPointAdd({ x, y, radius: 0 }, insertIndex);
      }
    },
    [canvasRef, isDragging, points, onPointAdd]
  );

  // 处理鼠标移动事件 - 拖拽顶点
  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!isDragging || activePointIndex === null || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // 确保坐标在0-100范围内
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));

      // 使用requestAnimationFrame优化拖拽性能
      requestAnimationFrame(() => {
        onPointMove({ x: clampedX, y: clampedY });
      });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        onPointDragEnd();
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true }); // 添加passive标志提高性能
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, activePointIndex, onPointMove, onPointDragEnd]);

  // 处理顶点右键点击 - 删除顶点
  const handlePointContextMenu = useCallback(
    (e: MouseEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      onPointRemove(index);
    },
    [onPointRemove]
  );

  // 计算编辑区域的尺寸，根据预览尺寸的宽高比
  const getCanvasStyle = () => {
    if (isFullscreen) {
      return { width: '100%', height: '100%' };
    }

    if (previewSize) {
      // 使用 CSS aspect-ratio 属性来保持宽高比
      return {
        width: '100%',
        aspectRatio: `${previewSize.width} / ${previewSize.height}`,
        maxHeight: '600px',
      };
    }

    return { width: '100%', height: '600px', aspectRatio: '1 / 1' };
  };

  return (
    <div className="w-full">
      <div
        ref={canvasRef}
        className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : 'w-full'} group cursor-crosshair rounded-lg border-2 border-gray-300 bg-white/10 transition-all duration-300 hover:border-blue-400 dark:border-gray-700 dark:bg-black/10 dark:hover:border-blue-600 overflow-hidden`}
        onClick={handleCanvasClick}
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'auto',
          ...getCanvasStyle(),
        }}
      >
        {/* 全屏切换按钮 */}
        <button
          onClick={e => {
            e.stopPropagation(); // 阻止事件冒泡，避免触发画布点击事件
            toggleFullscreen();
          }}
          className="absolute top-2 right-2 z-10 rounded-md bg-gray-800/70 p-1.5 text-white transition-colors hover:bg-gray-700"
          aria-label={isFullscreen ? '退出全屏' : '进入全屏'}
          title={isFullscreen ? '退出全屏' : '进入全屏'}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>

        {/* 使用div渲染多边形，替代SVG实现 */}
        <PolygonRenderer
          points={points}
          isActive={true}
          containerWidth={size?.width ?? 0}
          containerHeight={size?.height ?? 0}
        />

        {/* 绘制顶点 */}
        {points.map((point, index) => (
          <PolygonVertex
            key={`vertex-${index}`}
            point={point}
            index={index}
            isActive={activePointIndex === index}
            onDragStart={onPointDragStart}
            onContextMenu={handlePointContextMenu}
            onRadiusChange={onPointRadiusChange}
          />
        ))}
      </div>

      <div className="mt-4 space-y-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            点击画布添加顶点 | 拖拽顶点移动 | 右键点击顶点删除 | 选中顶点后使用滑块或滚轮调整圆角
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 计算点到线段的最短距离（基于百分比坐标）
 */
function pointToSegmentDistance(point: Point, start: Point, end: Point): number {
  const sx = start.x;
  const sy = start.y;
  const ex = end.x;
  const ey = end.y;

  const dx = ex - sx;
  const dy = ey - sy;

  if (dx === 0 && dy === 0) {
    return Math.hypot(point.x - sx, point.y - sy);
  }

  const t = ((point.x - sx) * dx + (point.y - sy) * dy) / (dx * dx + dy * dy);
  const clampedT = Math.max(0, Math.min(1, t));

  const closestX = sx + clampedT * dx;
  const closestY = sy + clampedT * dy;

  return Math.hypot(point.x - closestX, point.y - closestY);
}
