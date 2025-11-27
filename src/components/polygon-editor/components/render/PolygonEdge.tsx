'use client';

import { Point } from '@/hooks/usePolygon';
import { MouseEvent } from 'react';

/**
 * 多边形边线组件属性
 */
export interface PolygonEdgeProps {
  start: Point;
  end: Point;
  index: number;
  curvature?: number; // 弧度值，范围 -100 到 100
  onEdgeClick?: (e: MouseEvent<SVGPathElement>, edgeIndex: number, point: Point) => void;
}

/**
 * 计算贝塞尔曲线的控制点
 */
function calculateControlPoint(start: Point, end: Point, curvature: number): Point {
  // 计算两点的中点
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  
  // 计算垂直于连线的方向向量
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) return { x: midX, y: midY };
  
  // 归一化并旋转90度
  const normalX = -dy / length;
  const normalY = dx / length;
  
  // 根据弧度值偏移控制点
  const offset = (curvature / 100) * (length * 0.3); // 弧度强度调节
  
  return {
    x: midX + normalX * offset,
    y: midY + normalY * offset
  };
}

/**
 * 多边形边线组件
 * 渲染多边形的边线，支持弧度调节
 */
export function PolygonEdge({ start, end, index, curvature = 0, onEdgeClick }: PolygonEdgeProps) {
  // 处理边线点击事件
  const handleEdgeClick = (e: MouseEvent<SVGPathElement>) => {
    if (!onEdgeClick) return;

    // 获取点击位置相对于SVG的坐标
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // 调用回调函数，传递边线索引和点击位置
    onEdgeClick(e, index, { x, y });
  };

  // 如果弧度为0，使用直线
  if (curvature === 0) {
    return (
      <path
        key={`edge-${index}`}
        d={`M ${start.x}% ${start.y}% L ${end.x}% ${end.y}%`}
        stroke="rgba(59, 130, 246, 0.3)"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        className="cursor-crosshair transition-all duration-200 hover:stroke-blue-300 hover:stroke-opacity-50"
        onClick={handleEdgeClick}
      />
    );
  }

  // 计算控制点并绘制二次贝塞尔曲线
  const controlPoint = calculateControlPoint(start, end, curvature);
  
  return (
    <path
      key={`edge-${index}`}
      d={`M ${start.x}% ${start.y}% Q ${controlPoint.x}% ${controlPoint.y}% ${end.x}% ${end.y}%`}
      stroke="rgba(59, 130, 246, 0.3)"
      strokeWidth="10"
      strokeLinecap="round"
      fill="none"
      className="cursor-crosshair transition-all duration-200 hover:stroke-blue-300 hover:stroke-opacity-50"
      onClick={handleEdgeClick}
    />
  );
}
