'use client';

import { Check, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ImageCropModalProps {
  imageUrl: string;
  onCrop: (croppedImageUrl: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // 宽高比，undefined 表示自由裁剪
  onAspectRatioChange?: (width: number, height: number) => void; // 比例变化回调
}

export function ImageCropModal({
  imageUrl,
  onCrop,
  onCancel,
  aspectRatio: initialAspectRatio,
  onAspectRatioChange,
}: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null); // 'nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(initialAspectRatio);

  // 预设比例选项
  const aspectRatioPresets = [
    { name: '自由', value: undefined },
    { name: '16:9', value: 16 / 9 },
    { name: '4:3', value: 4 / 3 },
    { name: '1:1', value: 1 },
    { name: '3:4', value: 3 / 4 },
    { name: '9:16', value: 9 / 16 },
    { name: '21:9', value: 21 / 9 },
  ];

  // 加载图片
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight - 100; // 留出控制区域空间

      // 计算缩放比例以适应容器
      const scaleX = containerWidth / img.width;
      const scaleY = containerHeight / img.height;
      const minScale = Math.min(scaleX, scaleY, 1); // 不超过原始大小

      setImageSize({
        width: img.width * minScale,
        height: img.height * minScale,
      });

      // 初始化裁剪区域 - 如果有宽高比，按照宽高比裁剪
      let initialWidth: number;
      let initialHeight: number;

      if (aspectRatio) {
        // 根据宽高比计算初始裁剪区域
        const imgAspectRatio = img.width / img.height;
        if (imgAspectRatio > aspectRatio) {
          // 图片更宽，以高度为准
          initialHeight = img.height * minScale * 0.8;
          initialWidth = initialHeight * aspectRatio;
        } else {
          // 图片更高，以宽度为准
          initialWidth = img.width * minScale * 0.8;
          initialHeight = initialWidth / aspectRatio;
        }
      } else {
        initialWidth = img.width * minScale * 0.8;
        initialHeight = img.height * minScale * 0.8;
      }

      setCropArea({
        x: (img.width * minScale - initialWidth) / 2,
        y: (img.height * minScale - initialHeight) / 2,
        width: initialWidth,
        height: initialHeight,
      });
    };
    img.src = imageUrl;

    // 不要在这里 revoke URL，因为图片可能还在使用
    // URL 的清理应该在父组件中处理
    return () => {
      // 清理函数，但不 revoke URL
    };
  }, [imageUrl, aspectRatio]);

  // 当 aspectRatio 状态变化时，更新裁剪区域（只在有固定比例时强制更新）
  useEffect(() => {
    if (!imageRef.current || imageSize.width === 0) return;

    // 如果是自由裁剪（aspectRatio 为 undefined），不强制更新裁剪区域
    // 让用户可以自由调整
    if (aspectRatio === undefined) {
      console.log('[ImageCropModal] Free crop mode, not updating crop area');
      return;
    }

    console.log('[ImageCropModal] Aspect ratio changed, updating crop area:', aspectRatio);

    const img = imageRef.current;
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight - 100;
    const scaleX = containerWidth / img.width;
    const scaleY = containerHeight / img.height;
    const minScale = Math.min(scaleX, scaleY, 1);

    let initialWidth: number;
    let initialHeight: number;

    const imgAspectRatio = img.width / img.height;
    if (imgAspectRatio > aspectRatio) {
      initialHeight = img.height * minScale * 0.8;
      initialWidth = initialHeight * aspectRatio;
    } else {
      initialWidth = img.width * minScale * 0.8;
      initialHeight = initialWidth / aspectRatio;
    }

    // 保持裁剪区域在图片范围内，居中显示
    const maxX = imageSize.width - initialWidth;
    const maxY = imageSize.height - initialHeight;
    const newX = Math.max(0, Math.min((imageSize.width - initialWidth) / 2, maxX));
    const newY = Math.max(0, Math.min((imageSize.height - initialHeight) / 2, maxY));

    setCropArea({
      x: newX,
      y: newY,
      width: initialWidth,
      height: initialHeight,
    });
  }, [aspectRatio, imageSize.width, imageSize.height]);

  // 处理比例变化（不立即更新预览尺寸，只在确认裁剪时更新）
  const handleAspectRatioChange = useCallback((ratio: number | undefined) => {
    console.log('[ImageCropModal] handleAspectRatioChange called with ratio:', ratio);
    setAspectRatio(ratio);
    // 不在这里调用 onAspectRatioChange，只在确认裁剪时调用
  }, []);

  // 绘制画布
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    // 使用设备像素比提高画质
    const dpr = window.devicePixelRatio || 1;
    canvas.width = imageSize.width * dpr;
    canvas.height = imageSize.height * dpr;
    canvas.style.width = `${imageSize.width}px`;
    canvas.style.height = `${imageSize.height}px`;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // 缩放上下文以匹配设备像素比
    ctx.scale(dpr, dpr);

    // 使用高质量图像渲染
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 绘制图片
    ctx.drawImage(img, 0, 0, imageSize.width, imageSize.height);

    // 绘制遮罩层（降低不透明度，让图片更清晰）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, imageSize.width, imageSize.height);

    // 清除裁剪区域
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    ctx.restore();

    // 绘制裁剪框
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // 绘制控制点
    const handleSize = 8;
    const handles = [
      { x: cropArea.x, y: cropArea.y }, // 左上
      { x: cropArea.x + cropArea.width, y: cropArea.y }, // 右上
      { x: cropArea.x, y: cropArea.y + cropArea.height }, // 左下
      { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height }, // 右下
    ];

    ctx.fillStyle = '#3b82f6';
    ctx.setLineDash([]);
    handles.forEach(handle => {
      ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
    });
  }, [imageSize, cropArea]);

  // 检测鼠标位置是否在调整手柄上
  const getResizeHandle = useCallback(
    (x: number, y: number): string | null => {
      const handleSize = 10;
      const { x: cx, y: cy, width, height } = cropArea;

      // 检查四个角
      if (Math.abs(x - cx) < handleSize && Math.abs(y - cy) < handleSize) return 'nw';
      if (Math.abs(x - (cx + width)) < handleSize && Math.abs(y - cy) < handleSize) return 'ne';
      if (Math.abs(x - cx) < handleSize && Math.abs(y - (cy + height)) < handleSize) return 'sw';
      if (Math.abs(x - (cx + width)) < handleSize && Math.abs(y - (cy + height)) < handleSize)
        return 'se';

      // 检查四条边（仅在自由模式下）
      if (aspectRatio === undefined) {
        if (Math.abs(x - cx) < handleSize && y >= cy && y <= cy + height) return 'w';
        if (Math.abs(x - (cx + width)) < handleSize && y >= cy && y <= cy + height) return 'e';
        if (Math.abs(y - cy) < handleSize && x >= cx && x <= cx + width) return 'n';
        if (Math.abs(y - (cy + height)) < handleSize && x >= cx && x <= cx + width) return 's';
      }

      return null;
    },
    [cropArea, aspectRatio]
  );

  // 处理鼠标按下
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 检查是否点击在调整手柄上
      const handle = getResizeHandle(x, y);
      if (handle) {
        setResizeHandle(handle);
        setDragStart({ x, y });
        return;
      }

      // 检查是否点击在裁剪区域内
      if (
        x >= cropArea.x &&
        x <= cropArea.x + cropArea.width &&
        y >= cropArea.y &&
        y <= cropArea.y + cropArea.height
      ) {
        setIsDragging(true);
        setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
      }
    },
    [cropArea, getResizeHandle]
  );

  // 处理鼠标移动
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      // 处理调整大小
      if (resizeHandle) {
        const deltaX = currentX - dragStart.x;
        const deltaY = currentY - dragStart.y;
        const newCropArea = { ...cropArea };

        switch (resizeHandle) {
          case 'nw':
            newCropArea.x = Math.max(0, cropArea.x + deltaX);
            newCropArea.y = Math.max(0, cropArea.y + deltaY);
            newCropArea.width = Math.max(20, cropArea.width - deltaX);
            newCropArea.height = Math.max(20, cropArea.height - deltaY);
            break;
          case 'ne':
            newCropArea.y = Math.max(0, cropArea.y + deltaY);
            newCropArea.width = Math.max(20, cropArea.width + deltaX);
            newCropArea.height = Math.max(20, cropArea.height - deltaY);
            break;
          case 'sw':
            newCropArea.x = Math.max(0, cropArea.x + deltaX);
            newCropArea.width = Math.max(20, cropArea.width - deltaX);
            newCropArea.height = Math.max(20, cropArea.height + deltaY);
            break;
          case 'se':
            newCropArea.width = Math.max(20, cropArea.width + deltaX);
            newCropArea.height = Math.max(20, cropArea.height + deltaY);
            break;
          case 'n':
            newCropArea.y = Math.max(0, cropArea.y + deltaY);
            newCropArea.height = Math.max(20, cropArea.height - deltaY);
            break;
          case 's':
            newCropArea.height = Math.max(20, cropArea.height + deltaY);
            break;
          case 'w':
            newCropArea.x = Math.max(0, cropArea.x + deltaX);
            newCropArea.width = Math.max(20, cropArea.width - deltaX);
            break;
          case 'e':
            newCropArea.width = Math.max(20, cropArea.width + deltaX);
            break;
        }

        // 如果有固定比例，调整尺寸以保持比例
        if (aspectRatio !== undefined && resizeHandle) {
          const currentRatio = newCropArea.width / newCropArea.height;
          if (Math.abs(currentRatio - aspectRatio) > 0.01) {
            // 根据调整的手柄，保持比例
            if (resizeHandle.includes('e') || resizeHandle.includes('w')) {
              newCropArea.height = newCropArea.width / aspectRatio;
            } else {
              newCropArea.width = newCropArea.height * aspectRatio;
            }
          }
        }

        // 限制在画布范围内
        if (newCropArea.x + newCropArea.width > imageSize.width) {
          newCropArea.width = imageSize.width - newCropArea.x;
          if (aspectRatio !== undefined) {
            newCropArea.height = newCropArea.width / aspectRatio;
          }
        }
        if (newCropArea.y + newCropArea.height > imageSize.height) {
          newCropArea.height = imageSize.height - newCropArea.y;
          if (aspectRatio !== undefined) {
            newCropArea.width = newCropArea.height * aspectRatio;
          }
        }

        setCropArea(newCropArea);
        setDragStart({ x: currentX, y: currentY });
        return;
      }

      // 处理拖拽移动
      if (isDragging) {
        const x = currentX - dragStart.x;
        const y = currentY - dragStart.y;

        // 限制在画布范围内
        const newX = Math.max(0, Math.min(x, imageSize.width - cropArea.width));
        const newY = Math.max(0, Math.min(y, imageSize.height - cropArea.height));

        setCropArea(prev => ({ ...prev, x: newX, y: newY }));
      }
    },
    [isDragging, resizeHandle, dragStart, imageSize, cropArea, aspectRatio]
  );

  // 处理鼠标抬起
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setResizeHandle(null);
  }, []);

  // 处理裁剪
  const handleCrop = useCallback(() => {
    console.log('[ImageCropModal] handleCrop called');
    console.log('[ImageCropModal] current aspectRatio:', aspectRatio);
    console.log('[ImageCropModal] onAspectRatioChange exists:', !!onAspectRatioChange);

    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    // 计算原始图片中的裁剪区域
    const scaleRatio = img.width / imageSize.width;
    const sourceX = (cropArea.x * scaleRatio) | 0;
    const sourceY = (cropArea.y * scaleRatio) | 0;
    const sourceWidth = (cropArea.width * scaleRatio) | 0;
    const sourceHeight = (cropArea.height * scaleRatio) | 0;

    console.log('[ImageCropModal] crop dimensions:', { sourceWidth, sourceHeight });
    console.log('[ImageCropModal] calculated aspect ratio from crop:', sourceWidth / sourceHeight);

    // 创建新的 canvas 用于裁剪
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = sourceWidth;
    cropCanvas.height = sourceHeight;
    const ctx = cropCanvas.getContext('2d');

    if (!ctx) return;

    // 绘制裁剪后的图片
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth,
      sourceHeight
    );

    // 转换为 blob URL
    cropCanvas.toBlob(blob => {
      if (blob) {
        const croppedUrl = URL.createObjectURL(blob);
        console.log('[ImageCropModal] calling onCrop with croppedUrl');
        onCrop(croppedUrl);

        // 确认裁剪时，根据当前比例更新预览尺寸
        if (onAspectRatioChange) {
          if (aspectRatio !== undefined) {
            const baseWidth = 450;
            const newHeight = Math.round(baseWidth / aspectRatio);
            console.log('[ImageCropModal] calling onAspectRatioChange with:', {
              baseWidth,
              newHeight,
            });
            onAspectRatioChange(baseWidth, newHeight);
          } else {
            // 自由裁剪，根据实际裁剪的尺寸计算比例
            const actualAspectRatio = sourceWidth / sourceHeight;
            const baseWidth = 450;
            const newHeight = Math.round(baseWidth / actualAspectRatio);
            console.log('[ImageCropModal] free crop, calculated aspect ratio:', actualAspectRatio);
            console.log('[ImageCropModal] calling onAspectRatioChange with:', {
              baseWidth,
              newHeight,
            });
            onAspectRatioChange(baseWidth, newHeight);
          }
        } else {
          console.log('[ImageCropModal] onAspectRatioChange is not provided');
        }
      }
    }, 'image/png');
  }, [cropArea, imageSize, onCrop, aspectRatio, onAspectRatioChange]);

  // 使用 Portal 渲染到 body，确保弹窗是全局的
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-auto w-[95vw] max-w-7xl rounded-lg bg-white p-8 shadow-2xl dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">裁剪图片</h3>
          <button
            onClick={onCancel}
            className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 比例选择 */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            裁剪比例
          </label>
          <div className="flex flex-wrap gap-2">
            {aspectRatioPresets.map(preset => (
              <button
                key={preset.name}
                onClick={() => handleAspectRatioChange(preset.value)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  (aspectRatio === undefined && preset.value === undefined) ||
                  (aspectRatio !== undefined &&
                    preset.value !== undefined &&
                    Math.abs(aspectRatio - preset.value) < 0.001)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={containerRef}
          className="mb-6 flex min-h-[65vh] max-h-[75vh] items-center justify-center overflow-auto rounded-lg border-2 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-900"
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-move"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              // 使用原图，不裁剪
              onCrop(imageUrl);
            }}
            className="rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            使用原图
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              取消
            </button>
            <button
              onClick={handleCrop}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Check className="h-5 w-5" />
              确认裁剪
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
