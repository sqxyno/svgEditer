'use client';

import { usePolygon } from '@/hooks/usePolygon';
import clsx from 'clsx';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { CodeToolbar } from './components/CodeToolbar';
import { ConfigAccordion } from './components/ConfigAccordion';
import { PolygonCanvas } from './components/PolygonCanvas';
import { PolygonPreview } from './components/render/PolygonPreview';
import {
  BackgroundSettings,
  BorderRadiusSettings,
  PresetsSettings,
  PreviewColorSettings,
  SizeSettings,
  VertexSettings,
} from './components/settings';

/**
 * SVG编辑器组件属性
 */
export interface PolygonEditorProps {
  className?: string;
}

/**
 * SVG编辑器组件
 */
export function PolygonEditor({ className = '' }: PolygonEditorProps) {
  const polygon = usePolygon();
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [previewSize, setPreviewSize] = useState({ width: 450, height: 450 });
  const [previewFillColor, setPreviewFillColor] = useState<string>(
    JSON.stringify(['#6366f1', '#8b5cf6', '#d946ef'])
  );
  const [previewFillType, setPreviewFillType] = useState<'solid' | 'gradient'>('gradient');

  return (
    <div className={clsx('w-full', className)}>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 左侧编辑区域 */}
        <div className="space-y-6 rounded-xl bg-white/10 p-6 shadow-lg backdrop-blur-sm dark:bg-black/10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">编辑区域</h2>

          {/* 编辑画布 - 加大尺寸 */}
          <div className="overflow-hidden rounded-lg bg-white/5 p-4 shadow-sm transition-all duration-300 hover:shadow-lg dark:bg-black/5">
            <PolygonCanvas
              points={polygon.points}
              activePointIndex={polygon.activePointIndex}
              isDragging={polygon.isDragging}
              backgroundImage={backgroundImage}
              previewSize={previewSize}
              onPointDragStart={polygon.startDragging}
              onPointDragEnd={polygon.stopDragging}
              onPointMove={polygon.moveActivePoint}
              onPointAdd={polygon.addPoint}
              onPointRemove={polygon.removePoint}
              onPointRadiusChange={polygon.updatePointRadius}
            />
          </div>

          {/* 配置区域 */}
          <div className="space-y-4 rounded-lg bg-white/5 p-4 shadow-sm dark:bg-black/5">
            {/* 背景设置 - 最上面 */}
            <div className="mb-4">
              <BackgroundSettings
                backgroundImage={backgroundImage}
                onChange={setBackgroundImage}
                previewSize={previewSize}
                onPreviewSizeChange={(width, height) => {
                  console.log('[PolygonEditor] onPreviewSizeChange called with:', {
                    width,
                    height,
                  });
                  setPreviewSize({ width, height });
                }}
              />
            </div>

            {/* 样式配置 */}
            <ConfigAccordion title="样式配置" defaultOpen={true}>
              <div className="space-y-4">
                <SizeSettings
                  width={previewSize.width}
                  height={previewSize.height}
                  onChange={(width, height) => setPreviewSize({ width, height })}
                />

                <div className="mt-4">
                  <PresetsSettings
                    onApplyPreset={polygon.setPoints}
                    currentWidth={previewSize.width}
                    currentHeight={previewSize.height}
                    onSizeChange={(width, height) => setPreviewSize({ width, height })}
                  />
                </div>
              </div>
            </ConfigAccordion>

            {/* 顶点配置 - 默认收缩 */}
            <ConfigAccordion title="顶点配置" defaultOpen={false}>
              <VertexSettings
                points={polygon.points}
                onUpdatePoint={polygon.updatePoint}
                onResetPolygon={polygon.resetPolygon}
              />
            </ConfigAccordion>

            {/* 圆角配置 - 默认收缩 */}
            <ConfigAccordion title="圆角配置" defaultOpen={false}>
              <BorderRadiusSettings
                points={polygon.points}
                onPointRadiusChange={polygon.updatePointRadius}
              />
            </ConfigAccordion>
          </div>
        </div>

        {/* 右侧预览区域 */}
        <div className="space-y-6 rounded-xl bg-white/10 p-6 shadow-lg backdrop-blur-sm dark:bg-black/10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">预览区域</h2>

          {/* 预览画布 - 加大尺寸 */}
          <div className="rounded-lg bg-white/5 p-4 shadow-sm dark:bg-black/5">
            <PolygonPreview
              clipPath={polygon.generateCssClipPath()}
              points={polygon.points}
              width={previewSize.width}
              height={previewSize.height}
              fillColor={previewFillColor}
              fillType={previewFillType}
            />
          </div>

          {/* 预览颜色设置 */}
          <div className="rounded-lg bg-white/5 p-4 shadow-sm dark:bg-black/5">
            <PreviewColorSettings
              fillColor={previewFillColor}
              fillType={previewFillType}
              onChange={(color, type) => {
                setPreviewFillColor(color);
                setPreviewFillType(type);
              }}
            />
          </div>

          {/* 代码配置 */}
          <div className="rounded-lg bg-white/5 p-4 shadow-sm dark:bg-black/5">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">SVG 代码</h3>
            <CodeToolbar points={polygon.points} previewSize={previewSize} />
          </div>
        </div>
      </div>
    </div>
  );
}
