'use client';

import { usePolygon } from '@/hooks/usePolygon';
import { CircleDot, FlipHorizontal, Image, Palette, Radius, Ruler, Shapes } from 'lucide-react';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { CodeToolbar } from './components/CodeToolbar';
import { PolygonCanvas } from './components/PolygonCanvas';
import { PolygonPreview } from './components/render/PolygonPreview';
import {
  BackgroundSettings,
  BorderRadiusSettings,
  MirrorSettings,
  PresetsSettings,
  PreviewColorSettings,
  SizeSettings,
  VertexSettings,
} from './components/settings';

type TabType = 'image' | 'size' | 'preset' | 'vertex' | 'radius' | 'mirror' | 'color';

interface TabItem {
  id: TabType;
  icon: React.ReactNode;
  label: string;
}

const tabs: TabItem[] = [
  { id: 'image', icon: <Image size={20} />, label: '图片' },
  { id: 'size', icon: <Ruler size={20} />, label: '尺寸' },
  { id: 'preset', icon: <Shapes size={20} />, label: '预设' },
  { id: 'vertex', icon: <CircleDot size={20} />, label: '顶点' },
  { id: 'radius', icon: <Radius size={20} />, label: '圆角' },
  { id: 'mirror', icon: <FlipHorizontal size={20} />, label: '镜像' },
  { id: 'color', icon: <Palette size={20} />, label: '颜色' },
];

export function PolygonEditor() {
  const polygon = usePolygon();
  const [activeTab, setActiveTab] = useState<TabType>('image');
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [backgroundConfig, setBackgroundConfig] = useState({
    url: '',
    x: 50,
    y: 50,
    width: 80,
    height: 80,
  });
  const [previewSize, setPreviewSize] = useState({ width: 450, height: 450 });
  const [previewFillColor, setPreviewFillColor] = useState<string>(
    JSON.stringify(['#6366f1', '#8b5cf6', '#d946ef'])
  );
  const [previewFillType, setPreviewFillType] = useState<'solid' | 'gradient'>('gradient');
  const [canvasScale, setCanvasScale] = useState<number>(100);
  const [imageEditMode, setImageEditMode] = useState<boolean>(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [, forceUpdate] = useState(0);

  const handleForceSync = () => {
    forceUpdate(n => n + 1);
    polygon.setPoints([...polygon.points]);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'image':
        return (
          <BackgroundSettings
            backgroundImage={backgroundImage}
            onChange={url => {
              setBackgroundImage(url);
              if (url) {
                setBackgroundConfig(prev => ({ ...prev, url }));
              }
            }}
            previewSize={previewSize}
            onPreviewSizeChange={(width, height) => setPreviewSize({ width, height })}
            backgroundConfig={backgroundConfig}
            onBackgroundConfigChange={setBackgroundConfig}
          />
        );
      case 'size':
        return (
          <SizeSettings
            width={previewSize.width}
            height={previewSize.height}
            onChange={(width, height) => setPreviewSize({ width, height })}
          />
        );
      case 'preset':
        return (
          <PresetsSettings
            onApplyPreset={polygon.setPoints}
            currentWidth={previewSize.width}
            currentHeight={previewSize.height}
            onSizeChange={(width, height) => setPreviewSize({ width, height })}
          />
        );
      case 'vertex':
        return (
          <VertexSettings
            points={polygon.points}
            onUpdatePoint={polygon.updatePoint}
            onResetPolygon={polygon.resetPolygon}
            selectedIndex={selectedPointIndex}
            onSelectPoint={setSelectedPointIndex}
          />
        );
      case 'radius':
        return (
          <BorderRadiusSettings
            points={polygon.points}
            onPointRadiusChange={polygon.updatePointRadius}
            selectedIndex={selectedPointIndex}
            onSelectPoint={setSelectedPointIndex}
          />
        );
      case 'mirror':
        return <MirrorSettings points={polygon.points} onUpdatePoints={polygon.setPoints} />;
      case 'color':
        return (
          <PreviewColorSettings
            fillColor={previewFillColor}
            fillType={previewFillType}
            onChange={(color, type) => {
              setPreviewFillColor(color);
              setPreviewFillType(type);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#FFFFFF]">
      <Toaster position="top-center" reverseOrder={false} />

      {/* 顶部导航栏 */}
      <header className="h-12 bg-[#FFFFFF] border-b border-[#EAEDF2] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/favicon.ico`}
            alt="Logo"
            className="w-6 h-6"
          />
          <span className="text-lg font-semibold text-gray-800">SVG编辑器</span>
          <span className="text-600 text-#E5E7EB">- {/*  */}前端处理复杂圆角多边形解决方案</span>
        </div>
        <nav>
          <a
            href="/about"
            className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded hover:bg-[#EAEDF2] transition-colors"
          >
            关于
          </a>
        </nav>
      </header>

      {/* 主内容区域 */}
      <div className="flex-1 flex min-h-0">
        {/* 左侧配置区 - 窄栏图标 + 宽栏配置 */}
        <div className="flex h-full">
          {/* 窄栏 - 图标导航 */}
          <div className="w-14 h-full bg-[#FFFFFF] border-r border-[#EAEDF2] flex flex-col py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full py-3 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#EAEDF2] text-blue-600'
                    : 'text-gray-500 hover:bg-[#EAEDF2] hover:text-gray-700'
                }`}
                title={tab.label}
              >
                {tab.icon}
                <span className="text-[10px]">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 宽栏 - 配置内容 */}
          <div className="w-64 h-full bg-[#FFFFFF] border-r border-[#EAEDF2] overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-4">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            {renderTabContent()}
          </div>
        </div>

        {/* 画布和预览区域容器 */}
        <div className="flex-1 h-full flex min-w-0">
          {/* 画布区域 - 60% */}
          <div className="w-[60%] h-full bg-[#F6F7FA] flex items-center justify-center p-6 relative">
            <PolygonCanvas
              points={polygon.points}
              activePointIndex={polygon.activePointIndex}
              isDragging={polygon.isDragging}
              backgroundImage={backgroundImage}
              backgroundConfig={backgroundConfig}
              previewSize={previewSize}
              canUndo={polygon.canUndo}
              canRedo={polygon.canRedo}
              canvasScale={canvasScale}
              imageEditMode={imageEditMode}
              externalSelectedIndex={selectedPointIndex}
              onPointDragStart={polygon.startDragging}
              onPointDragEnd={polygon.stopDragging}
              onPointMove={polygon.moveActivePoint}
              onPointAdd={polygon.addPoint}
              onPointRemove={polygon.removePoint}
              onPointRadiusChange={polygon.updatePointRadius}
              onPointUpdate={polygon.updatePoint}
              onForceSync={handleForceSync}
              onUndo={polygon.undo}
              onRedo={polygon.redo}
              onScaleChange={setCanvasScale}
              onBackgroundConfigChange={setBackgroundConfig}
              onImageEditModeChange={setImageEditMode}
              onExternalSelectPoint={setSelectedPointIndex}
            />
          </div>

          {/* 预览+代码区域 - 40% */}
          <div className="w-[40%] h-full flex flex-col border-l border-[#EAEDF2] bg-[#FFFFFF]">
            {/* 上部分 - 实时预览 (60%) */}
            <div className="h-[60%] p-4 border-b border-[#EAEDF2] overflow-hidden flex flex-col">
              <h3 className="text-sm font-medium text-gray-800 mb-3">实时预览</h3>
              <div className="flex-1 flex items-center justify-center overflow-hidden bg-[#F6F7FA] rounded-lg">
                <PolygonPreview
                  clipPath={polygon.generateCssClipPath()}
                  points={polygon.points}
                  width={previewSize.width}
                  height={previewSize.height}
                  fillColor={previewFillColor}
                  fillType={previewFillType}
                />
              </div>
            </div>

            {/* 下部分 - 代码 (40%) */}
            <div className="h-[40%] p-4 overflow-hidden flex flex-col">
              <h3 className="text-sm font-medium text-gray-800 mb-3">代码</h3>
              <div className="flex-1 overflow-auto bg-[#F6F7FA] rounded-lg p-3">
                <CodeToolbar points={polygon.points} previewSize={previewSize} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
