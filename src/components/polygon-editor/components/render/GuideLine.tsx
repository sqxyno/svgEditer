'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface GuideLineProps {
  type: 'horizontal' | 'vertical';
  position: number; // 百分比位置 0-100
  onPositionChange: (position: number) => void;
  onRemove: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  disabled?: boolean; // 禁用交互（拖拽顶点时）
}

/**
 * 参考线组件
 * 可拖拽的水平或垂直参考线
 */
export function GuideLine({
  type,
  position,
  onPositionChange,
  onRemove,
  containerRef,
  disabled = false,
}: GuideLineProps) {
  const [isDragging, setIsDragging] = useState(false);
  const lineRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      let newPosition: number;

      if (type === 'horizontal') {
        newPosition = ((e.clientY - rect.top) / rect.height) * 100;
      } else {
        newPosition = ((e.clientX - rect.left) / rect.width) * 100;
      }

      // 限制在 0-100 范围内
      newPosition = Math.max(0, Math.min(100, newPosition));
      onPositionChange(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, type, containerRef, onPositionChange]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onRemove();
    },
    [onRemove]
  );

  const isHorizontal = type === 'horizontal';

  // 阻止点击事件冒泡到画布
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // 处理鼠标抬起，结束拖拽并阻止冒泡
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={lineRef}
      className={`absolute z-10 group select-none ${isDragging ? 'opacity-100' : 'opacity-70 hover:opacity-100'} transition-opacity ${disabled ? 'pointer-events-none' : ''}`}
      style={
        isHorizontal
          ? {
              left: 0,
              right: 0,
              top: `${position}%`,
              height: '12px',
              cursor: 'ns-resize',
              transform: 'translateY(-50%)',
            }
          : {
              top: 0,
              bottom: 0,
              left: `${position}%`,
              width: '12px',
              cursor: 'ew-resize',
              transform: 'translateX(-50%)',
            }
      }
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* 参考线本体 */}
      <div
        className={`absolute ${isHorizontal ? 'left-0 right-0 top-1/2 h-0.5 -translate-y-1/2' : 'top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2'} bg-pink-500`}
        style={{
          boxShadow: '0 0 4px rgba(236, 72, 153, 0.5)',
        }}
      />
      {/* 拖拽手柄 */}
      <div
        className={`absolute bg-pink-500 rounded-full ${isHorizontal ? '-left-1 top-1/2 -translate-y-1/2 w-3 h-3' : 'left-1/2 -top-1 -translate-x-1/2 w-3 h-3'}`}
      />
      {/* 删除按钮 */}
      <button
        onClick={e => {
          e.stopPropagation();
          onRemove();
        }}
        className={`absolute opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none ${isHorizontal ? 'right-6 top-1/2 -translate-y-1/2' : 'left-1/2 top-6 -translate-x-1/2'}`}
        title="删除参考线"
      >
        ×
      </button>
      {/* 位置标签 */}
      <div
        className={`absolute text-xs bg-pink-500 text-white px-1 rounded select-none ${isHorizontal ? 'right-0 top-1/2 -translate-y-1/2 -mt-4' : 'left-1/2 -translate-x-1/2 top-0 -mt-5'}`}
      >
        {position.toFixed(1)}%
      </div>
    </div>
  );
}
