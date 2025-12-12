'use client';

import { Point } from '@/hooks/usePolygon';
import { useFullscreen, useSize } from 'ahooks';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Crosshair,
  ImageIcon,
  Magnet,
  Maximize2,
  Minimize2,
  Mouse,
  Plus,
  Redo2,
  RefreshCw,
  Ruler,
  Undo2,
  ZoomIn,
} from 'lucide-react';
import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { GuideLine, PolygonRenderer, PolygonVertex } from './render';

interface GuideLineData {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
}

export interface BackgroundImageConfig {
  url: string;
  x: number; // 百分比位置
  y: number;
  width: number; // 百分比大小
  height: number;
}

export interface PolygonCanvasProps {
  points: Point[];
  activePointIndex: number | null;
  isDragging: boolean;
  backgroundImage?: string;
  backgroundConfig?: BackgroundImageConfig;
  previewSize?: { width: number; height: number };
  canUndo?: boolean;
  canRedo?: boolean;
  canvasScale?: number;
  imageEditMode?: boolean;
  externalSelectedIndex?: number | null;
  onPointDragStart: (index: number) => void;
  onPointDragEnd: () => void;
  onPointMove: (point: Point) => void;
  onPointAdd: (point: Point, insertIndex?: number) => void;
  onPointRemove: (index: number) => void;
  onPointRadiusChange?: (pointIndex: number, radius: number) => void;
  onPointUpdate?: (index: number, point: Point) => void;
  onForceSync?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onScaleChange?: (scale: number) => void;
  onBackgroundConfigChange?: (config: BackgroundImageConfig) => void;
  onImageEditModeChange?: (mode: boolean) => void;
  onExternalSelectPoint?: (index: number | null) => void;
}

export function PolygonCanvas({
  points,
  activePointIndex,
  isDragging,
  backgroundImage,
  backgroundConfig,
  previewSize,
  canUndo,
  canRedo,
  canvasScale = 100,
  imageEditMode = false,
  externalSelectedIndex,
  onPointDragStart,
  onPointDragEnd,
  onPointMove,
  onPointAdd,
  onPointRemove,
  onPointRadiusChange,
  onPointUpdate,
  onUndo,
  onRedo,
  onScaleChange,
  onBackgroundConfigChange,
  onImageEditModeChange,
  onExternalSelectPoint,
}: PolygonCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const size = useSize(canvasRef);
  const [isFullscreen, { toggleFullscreen }] = useFullscreen(canvasRef);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [guideLines, setGuideLines] = useState<GuideLineData[]>([]);
  const [showGuides, setShowGuides] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [showScaleMenu, setShowScaleMenu] = useState(false);
  const [isDraggingBg, setIsDraggingBg] = useState(false);
  const [bgDragStart, setBgDragStart] = useState({ x: 0, y: 0 });
  const [isNormalMouseMode, setIsNormalMouseMode] = useState(false);
  const [activeArrow, setActiveArrow] = useState<string | null>(null);
  const [renderKey, setRenderKey] = useState(0);
  const SNAP_THRESHOLD = 2;
  const scaleOptions = [50, 75, 100, 125, 150];
  const ARROW_STEP = 0.5;
  const ARROW_FINE_STEP = 0.1;

  const addGuideLine = useCallback((type: 'horizontal' | 'vertical') => {
    setGuideLines(prev => [...prev, { id: `guide-${Date.now()}`, type, position: 50 }]);
  }, []);

  const updateGuideLinePosition = useCallback((id: string, position: number) => {
    setGuideLines(prev => prev.map(g => (g.id === id ? { ...g, position } : g)));
  }, []);

  const removeGuideLine = useCallback((id: string) => {
    setGuideLines(prev => prev.filter(g => g.id !== id));
  }, []);

  const snapToGuides = useCallback(
    (x: number, y: number): { x: number; y: number } => {
      if (!snapEnabled) return { x, y };
      let snappedX = x,
        snappedY = y;
      guideLines.forEach(guide => {
        if (guide.type === 'horizontal' && Math.abs(y - guide.position) < SNAP_THRESHOLD)
          snappedY = guide.position;
        if (guide.type === 'vertical' && Math.abs(x - guide.position) < SNAP_THRESHOLD)
          snappedX = guide.position;
      });
      points.forEach((point, index) => {
        if (index === activePointIndex) return;
        if (Math.abs(x - point.x) < SNAP_THRESHOLD) snappedX = point.x;
        if (Math.abs(y - point.y) < SNAP_THRESHOLD) snappedY = point.y;
      });
      return { x: snappedX, y: snappedY };
    },
    [snapEnabled, guideLines, points, activePointIndex]
  );

  // 获取当前选中的顶点索引（优先使用外部选中状态）
  const currentActiveIndex = externalSelectedIndex ?? selectedPointIndex ?? activePointIndex;

  // 同步外部选中状态到内部
  useEffect(() => {
    if (externalSelectedIndex !== undefined && externalSelectedIndex !== null) {
      setSelectedPointIndex(externalSelectedIndex);
    }
  }, [externalSelectedIndex]);

  // 移动顶点的通用函数
  const movePoint = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right', fine = false) => {
      if (currentActiveIndex === null || !onPointUpdate) return;
      const point = points[currentActiveIndex];
      const step = fine ? ARROW_FINE_STEP : ARROW_STEP;
      let newX = point.x,
        newY = point.y;
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
      onPointUpdate(currentActiveIndex, { ...point, x: newX, y: newY });
    },
    [currentActiveIndex, points, onPointUpdate]
  );

  // 键盘快捷键控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 快捷键 A：切换添加顶点模式
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setIsNormalMouseMode(prev => !prev);
        onImageEditModeChange?.(false);
        return;
      }

      // 方向键控制顶点位置
      if (currentActiveIndex === null || !onPointUpdate) return;
      const isArrowKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);
      if (!isArrowKey) return;
      e.preventDefault();

      // 设置高亮
      const direction = e.key.replace('Arrow', '').toLowerCase();
      setActiveArrow(direction);

      movePoint(direction as 'up' | 'down' | 'left' | 'right', e.shiftKey);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setActiveArrow(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentActiveIndex, onPointUpdate, onImageEditModeChange, movePoint]);

  const handleCanvasClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      // 图片编辑模式或普通鼠标模式下不添加顶点
      if (imageEditMode || isNormalMouseMode) return;
      if (!canvasRef.current || isDragging) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const clickedNearPoint = points.some(
        point => Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)) < 5
      );
      if (!clickedNearPoint) {
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
    [isDragging, points, onPointAdd, imageEditMode, isNormalMouseMode]
  );

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      // 处理背景图片拖拽
      if (isDraggingBg && backgroundConfig && onBackgroundConfigChange && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const deltaX = ((e.clientX - bgDragStart.x) / rect.width) * 100;
        const deltaY = ((e.clientY - bgDragStart.y) / rect.height) * 100;
        setBgDragStart({ x: e.clientX, y: e.clientY });
        onBackgroundConfigChange({
          ...backgroundConfig,
          x: Math.max(10, Math.min(90, backgroundConfig.x + deltaX)),
          y: Math.max(10, Math.min(90, backgroundConfig.y + deltaY)),
        });
        return;
      }

      if (!isDragging || activePointIndex === null || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      const snapped = snapToGuides(x, y);
      requestAnimationFrame(() => onPointMove({ x: snapped.x, y: snapped.y }));
    };
    const handleMouseUp = () => {
      if (isDraggingBg) {
        setIsDraggingBg(false);
      }
      if (isDragging) {
        onPointDragEnd();
        // 不清除 selectedPointIndex，保持顶点选中状态以便使用方向键
        setIsNormalMouseMode(true); // 拖拽结束后切换到普通鼠标模式
      }
    };
    if (isDragging || isDraggingBg) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    isDraggingBg,
    activePointIndex,
    onPointMove,
    onPointDragEnd,
    snapToGuides,
    backgroundConfig,
    onBackgroundConfigChange,
    bgDragStart,
  ]);

  const handlePointContextMenu = useCallback(
    (e: MouseEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      onPointRemove(index);
    },
    [onPointRemove]
  );

  const getCanvasStyle = () => {
    if (isFullscreen) return { width: '100%', height: '100%' };
    if (previewSize)
      return {
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        aspectRatio: `${previewSize.width} / ${previewSize.height}`,
      };
    return { width: '100%', height: '100%', aspectRatio: '1 / 1' };
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* 左上角方向控制工具栏 - 仅在选中顶点时显示 */}
      {currentActiveIndex !== null && (
        <div className="absolute left-4 top-4 z-20 bg-[#FFFFFF] rounded-lg shadow-lg p-2 border border-[#EAEDF2]">
          <div className="text-xs text-gray-600 text-center mb-2 font-medium">
            顶点 {currentActiveIndex + 1}
          </div>
          <div className="flex flex-col items-center gap-1">
            {/* 上 */}
            <button
              onClick={e => {
                e.stopPropagation();
                movePoint('up');
              }}
              onMouseDown={() => setActiveArrow('up')}
              onMouseUp={() => setActiveArrow(null)}
              onMouseLeave={() => setActiveArrow(null)}
              className={`rounded-md p-1.5 transition-colors ${activeArrow === 'up' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-[#EAEDF2]'}`}
              title="上移 (↑)"
            >
              <ArrowUp size={16} />
            </button>
            {/* 左 中 右 */}
            <div className="flex items-center gap-1">
              <button
                onClick={e => {
                  e.stopPropagation();
                  movePoint('left');
                }}
                onMouseDown={() => setActiveArrow('left')}
                onMouseUp={() => setActiveArrow(null)}
                onMouseLeave={() => setActiveArrow(null)}
                className={`rounded-md p-1.5 transition-colors ${activeArrow === 'left' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-[#EAEDF2]'}`}
                title="左移 (←)"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="w-7 h-7 flex items-center justify-center text-xs text-gray-400">
                {currentActiveIndex + 1}
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  movePoint('right');
                }}
                onMouseDown={() => setActiveArrow('right')}
                onMouseUp={() => setActiveArrow(null)}
                onMouseLeave={() => setActiveArrow(null)}
                className={`rounded-md p-1.5 transition-colors ${activeArrow === 'right' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-[#EAEDF2]'}`}
                title="右移 (→)"
              >
                <ArrowRight size={16} />
              </button>
            </div>
            {/* 下 */}
            <button
              onClick={e => {
                e.stopPropagation();
                movePoint('down');
              }}
              onMouseDown={() => setActiveArrow('down')}
              onMouseUp={() => setActiveArrow(null)}
              onMouseLeave={() => setActiveArrow(null)}
              className={`rounded-md p-1.5 transition-colors ${activeArrow === 'down' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-[#EAEDF2]'}`}
              title="下移 (↓)"
            >
              <ArrowDown size={16} />
            </button>
          </div>
          <div className="text-[10px] text-gray-400 text-center mt-2">Shift + 方向键微调</div>
        </div>
      )}

      {/* 右下角横铺工具栏 */}
      <div className="absolute right-4 bottom-4 z-20 flex items-center gap-1 bg-[#FFFFFF] rounded-lg shadow-lg p-1.5 border border-[#EAEDF2]">
        <button
          onClick={e => {
            e.stopPropagation();
            setSelectedPointIndex(null);
            setIsNormalMouseMode(true);
            onImageEditModeChange?.(false);
          }}
          className={`rounded-md p-2 transition-colors ${isNormalMouseMode && !imageEditMode ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-[#EAEDF2]'}`}
          title="普通鼠标 (A)"
        >
          <Mouse size={18} />
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            setIsNormalMouseMode(false);
            onImageEditModeChange?.(false);
          }}
          className={`rounded-md p-2 transition-colors ${!isNormalMouseMode && !imageEditMode ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-[#EAEDF2]'}`}
          title="添加顶点 (A)"
        >
          <Crosshair size={18} />
        </button>
        {backgroundImage && (
          <button
            onClick={e => {
              e.stopPropagation();
              onImageEditModeChange?.(!imageEditMode);
            }}
            className={`rounded-md p-2 transition-colors ${imageEditMode ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-[#EAEDF2]'}`}
            title={imageEditMode ? '退出图片位置编辑' : '编辑图片位置'}
          >
            <ImageIcon size={18} />
          </button>
        )}
        <div className="w-px h-6 bg-[#EAEDF2] mx-1" />
        {onUndo && (
          <button
            onClick={e => {
              e.stopPropagation();
              onUndo();
            }}
            disabled={!canUndo}
            className={`rounded-md p-2 transition-colors ${canUndo ? 'text-gray-600 hover:bg-[#EAEDF2]' : 'text-gray-300 cursor-not-allowed'}`}
            title="撤回 (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>
        )}
        {onRedo && (
          <button
            onClick={e => {
              e.stopPropagation();
              onRedo();
            }}
            disabled={!canRedo}
            className={`rounded-md p-2 transition-colors ${canRedo ? 'text-gray-600 hover:bg-[#EAEDF2]' : 'text-gray-300 cursor-not-allowed'}`}
            title="重做 (Ctrl+Y)"
          >
            <Redo2 size={18} />
          </button>
        )}
        <div className="w-px h-6 bg-[#EAEDF2] mx-1" />
        <button
          onClick={e => {
            e.stopPropagation();
            setRenderKey(k => k + 1);
            toast.success('画布已同步', { duration: 1500 });
          }}
          className="rounded-md p-2 text-gray-600 hover:bg-[#EAEDF2] transition-colors"
          title="同步画布"
        >
          <RefreshCw size={18} />
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            addGuideLine('horizontal');
          }}
          className="rounded-md p-2 text-gray-600 hover:bg-[#EAEDF2] transition-colors"
          title="添加水平参考线"
        >
          <div className="flex items-center gap-0.5">
            <Plus size={10} />
            <Ruler size={14} />
          </div>
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            addGuideLine('vertical');
          }}
          className="rounded-md p-2 text-gray-600 hover:bg-[#EAEDF2] transition-colors"
          title="添加垂直参考线"
        >
          <div className="flex items-center gap-0.5">
            <Plus size={10} />
            <Ruler size={14} className="rotate-90" />
          </div>
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            setShowGuides(!showGuides);
          }}
          className={`rounded-md p-2 transition-colors ${showGuides ? 'bg-pink-100 text-pink-600' : 'text-gray-600 hover:bg-[#EAEDF2]'}`}
          title={showGuides ? '隐藏参考线' : '显示参考线'}
        >
          <Ruler size={18} />
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            setSnapEnabled(!snapEnabled);
          }}
          className={`rounded-md p-2 transition-colors ${snapEnabled ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-[#EAEDF2]'}`}
          title={snapEnabled ? '关闭吸附' : '开启吸附'}
        >
          <Magnet size={18} />
        </button>
        <div className="w-px h-6 bg-[#EAEDF2] mx-1" />
        {/* 缩放菜单 */}
        <div className="relative">
          <button
            onClick={e => {
              e.stopPropagation();
              setShowScaleMenu(!showScaleMenu);
            }}
            className="rounded-md p-2 text-gray-600 hover:bg-[#EAEDF2] transition-colors flex items-center gap-1"
            title="缩放"
          >
            <ZoomIn size={18} />
            <span className="text-xs">{canvasScale}%</span>
          </button>
          {showScaleMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-[#EAEDF2] py-1 min-w-[80px]">
              {scaleOptions.map(scale => (
                <button
                  key={scale}
                  onClick={e => {
                    e.stopPropagation();
                    onScaleChange?.(scale);
                    setShowScaleMenu(false);
                  }}
                  className={`w-full px-3 py-1.5 text-sm text-left hover:bg-[#EAEDF2] ${canvasScale === scale ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                >
                  {scale}%
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="w-px h-6 bg-[#EAEDF2] mx-1" />
        <button
          onClick={e => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          className="rounded-md p-2 text-gray-600 hover:bg-[#EAEDF2] transition-colors"
          title={isFullscreen ? '退出全屏' : '进入全屏'}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      <div
        ref={canvasRef}
        className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''} ${isNormalMouseMode || imageEditMode ? 'cursor-default' : 'cursor-crosshair'} rounded-lg bg-gray-100 shadow-sm overflow-hidden select-none`}
        onClick={handleCanvasClick}
        onDragStart={e => e.preventDefault()}
        style={{
          transform: `scale(${canvasScale / 100})`,
          transformOrigin: 'center center',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          ...getCanvasStyle(),
        }}
      >
        {/* 背景图片 - 层级最低 */}
        {backgroundImage && backgroundConfig && !imageEditMode && (
          <div
            className="absolute pointer-events-none select-none"
            style={{
              left: `${backgroundConfig.x}%`,
              top: `${backgroundConfig.y}%`,
              width: `${backgroundConfig.width}%`,
              height: `${backgroundConfig.height}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 0,
              WebkitUserSelect: 'none',
              userSelect: 'none',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backgroundImage}
              alt="背景"
              className="w-full h-full object-contain select-none"
              draggable={false}
              onDragStart={e => e.preventDefault()}
            />
          </div>
        )}

        {/* 图片编辑模式：可拖拽调整位置 - 层级最高 */}
        {backgroundImage && backgroundConfig && imageEditMode && (
          <div
            className="absolute cursor-move border-2 border-dashed border-orange-400 hover:border-orange-500 transition-colors bg-white/50 select-none"
            style={{
              left: `${backgroundConfig.x}%`,
              top: `${backgroundConfig.y}%`,
              width: `${backgroundConfig.width}%`,
              height: `${backgroundConfig.height}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 100,
              WebkitUserSelect: 'none',
              userSelect: 'none',
            }}
            onMouseDown={e => {
              e.stopPropagation();
              setIsDraggingBg(true);
              setBgDragStart({ x: e.clientX, y: e.clientY });
            }}
            onDragStart={e => e.preventDefault()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backgroundImage}
              alt="背景"
              className="w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
              onDragStart={e => e.preventDefault()}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
                拖拽调整位置
              </span>
            </div>
          </div>
        )}

        {showGuides &&
          guideLines.map(guide => (
            <GuideLine
              key={guide.id}
              type={guide.type}
              position={guide.position}
              onPositionChange={pos => updateGuideLinePosition(guide.id, pos)}
              onRemove={() => removeGuideLine(guide.id)}
              containerRef={canvasRef}
              disabled={isDragging}
            />
          ))}

        <PolygonRenderer
          key={`renderer-${renderKey}`}
          points={points}
          isActive={true}
          containerWidth={size?.width ?? 0}
          containerHeight={size?.height ?? 0}
        />

        {points.map((point, index) => (
          <PolygonVertex
            key={`vertex-${index}`}
            point={point}
            index={index}
            isActive={
              activePointIndex === index ||
              selectedPointIndex === index ||
              externalSelectedIndex === index
            }
            onDragStart={idx => {
              setSelectedPointIndex(idx);
              onExternalSelectPoint?.(idx);
              onPointDragStart(idx);
            }}
            onContextMenu={handlePointContextMenu}
            onRadiusChange={onPointRadiusChange}
          />
        ))}
      </div>
    </div>
  );
}

function pointToSegmentDistance(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x,
    dy = end.y - start.y;
  if (dx === 0 && dy === 0) return Math.hypot(point.x - start.x, point.y - start.y);
  const t = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy))
  );
  return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
}
