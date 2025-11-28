'use client';

import { generateRoundedPath } from '@/components/polygon-editor/utils/roundedPath';
import { Point } from '@/hooks/usePolygon';
import { useId } from 'react';

/**
 * 多边形预览组件属性
 */
export interface PolygonPreviewProps {
  clipPath: string;
  points: Point[]; // 添加points参数
  width: number;
  height: number;
  fillColor?: string; // 填充颜色或渐变
  fillType?: 'solid' | 'gradient'; // 填充类型
}

/**
 * 多边形预览组件
 * 展示应用了clip-path的效果
 * 支持div和svg两种渲染模式
 */
export function PolygonPreview({
  clipPath,
  points,
  width,
  height,
  fillColor = '#6366f1',
  fillType = 'gradient',
}: PolygonPreviewProps) {
  const gradientId = useId();
  const hasRadius = points.some(p => (p.radius || 0) > 0);
  const roundedPath = hasRadius ? generateRoundedPath(points, width, height) : null;

  // 渲染SVG模式预览
  const renderSvgPreview = () => {
    // 从 clip-path 中提取点坐标
    const pointsMatch = clipPath.match(/polygon\(([^)]+)\)/);
    if (!pointsMatch && !roundedPath) return <div>Invalid clip-path format</div>;

    const pointsStr = pointsMatch ? pointsMatch[1] : '';
    const pointPairs = pointsStr ? pointsStr.split(',').map(p => p.trim()) : [];

    // 将百分比转换为实际的像素坐标
    const svgPoints = pointPairs
      .map(pair => {
        const [x, y] = pair.split(' ');
        // 将百分比转换为 0-100 范围内的数值
        const xVal = parseFloat(x);
        const yVal = parseFloat(y);
        return `${xVal} ${yVal}`;
      })
      .join(' ');

    // 解析填充颜色或渐变
    let fillValue = fillColor;
    let gradientDef = null;

    if (fillType === 'gradient') {
      // 如果是渐变，解析颜色数组
      try {
        const colors = JSON.parse(fillColor);
        if (Array.isArray(colors) && colors.length > 0) {
          gradientDef = (
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                {colors.map((color: string, index: number) => (
                  <stop
                    key={index}
                    offset={`${(index / (colors.length - 1)) * 100}%`}
                    stopColor={color}
                  />
                ))}
              </linearGradient>
            </defs>
          );
          fillValue = `url(#${gradientId})`;
        }
      } catch {
        // 如果不是有效的 JSON，使用默认渐变
        const defaultColors = ['#6366f1', '#8b5cf6', '#d946ef'];
        gradientDef = (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={defaultColors[0]} />
              <stop offset="50%" stopColor={defaultColors[1]} />
              <stop offset="100%" stopColor={defaultColors[2]} />
            </linearGradient>
          </defs>
        );
        fillValue = `url(#${gradientId})`;
      }
    }

    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {gradientDef}
        {roundedPath ? (
          <path d={roundedPath.svgPath} fill={fillValue} stroke="#3b82f6" strokeWidth="0.5" />
        ) : (
          <polygon points={svgPoints} fill={fillValue} stroke="#3b82f6" strokeWidth="0.5" />
        )}
      </svg>
    );
  };

  return (
    <div className="relative flex flex-col items-center space-y-4">
      <div className="flex w-full items-center justify-between">
        <h3 className="text-lg font-semibold">实时预览</h3>
      </div>

      {/* 预览容器 */}
      <div
        className="relative overflow-hidden rounded-lg bg-white/5 shadow-sm dark:bg-black/5"
        style={{ width, height }}
      >
        {renderSvgPreview()}
      </div>

      {/* 尺寸显示 */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        {width} × {height}px
      </div>
    </div>
  );
}
