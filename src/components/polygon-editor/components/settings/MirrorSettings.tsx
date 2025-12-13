'use client';

import { Point } from '@/hooks/usePolygon';
import { FlipHorizontal, FlipVertical, RotateCcw, RotateCw } from 'lucide-react';

export interface MirrorSettingsProps {
  points: Point[];
  onUpdatePoints: (points: Point[]) => void;
}

export function MirrorSettings({ points, onUpdatePoints }: MirrorSettingsProps) {
  // 水平镜像（左右翻转）
  const handleHorizontalMirror = () => {
    const mirrored = points.map(point => ({
      ...point,
      x: 100 - point.x,
    }));
    onUpdatePoints(mirrored);
  };

  // 垂直镜像（上下翻转）
  const handleVerticalMirror = () => {
    const mirrored = points.map(point => ({
      ...point,
      y: 100 - point.y,
    }));
    onUpdatePoints(mirrored);
  };

  // 顺时针旋转90度
  const handleRotateCW = () => {
    const rotated = points.map(point => ({
      ...point,
      x: 100 - point.y,
      y: point.x,
    }));
    onUpdatePoints(rotated);
  };

  // 逆时针旋转90度
  const handleRotateCCW = () => {
    const rotated = points.map(point => ({
      ...point,
      x: point.y,
      y: 100 - point.x,
    }));
    onUpdatePoints(rotated);
  };

  // 中心对称（旋转180度）
  const handleRotate180 = () => {
    const rotated = points.map(point => ({
      ...point,
      x: 100 - point.x,
      y: 100 - point.y,
    }));
    onUpdatePoints(rotated);
  };

  // 反转顶点顺序
  const handleReverseOrder = () => {
    const reversed = [...points].reverse().map(point => ({ ...point }));
    onUpdatePoints(reversed);
  };

  return (
    <div className="space-y-4">
      {/* 镜像操作 */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-3">镜像翻转</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleHorizontalMirror}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-[#EAEDF2] hover:bg-[#F6F7FA] transition-colors"
          >
            <FlipHorizontal size={18} className="text-blue-500" />
            <span className="text-sm text-gray-700">水平镜像</span>
          </button>
          <button
            onClick={handleVerticalMirror}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-[#EAEDF2] hover:bg-[#F6F7FA] transition-colors"
          >
            <FlipVertical size={18} className="text-blue-500" />
            <span className="text-sm text-gray-700">垂直镜像</span>
          </button>
        </div>
      </div>

      {/* 旋转操作 */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-3">旋转变换</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleRotateCCW}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-[#EAEDF2] hover:bg-[#F6F7FA] transition-colors"
          >
            <RotateCcw size={18} className="text-green-500" />
            <span className="text-sm text-gray-700">逆时针90°</span>
          </button>
          <button
            onClick={handleRotateCW}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-[#EAEDF2] hover:bg-[#F6F7FA] transition-colors"
          >
            <RotateCw size={18} className="text-green-500" />
            <span className="text-sm text-gray-700">顺时针90°</span>
          </button>
          <button
            onClick={handleRotate180}
            className="col-span-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-[#EAEDF2] hover:bg-[#F6F7FA] transition-colors"
          >
            <RotateCw size={18} className="text-orange-500" />
            <span className="text-sm text-gray-700">旋转180°</span>
          </button>
        </div>
      </div>

      {/* 其他操作 */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-3">其他操作</div>
        <button
          onClick={handleReverseOrder}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-[#EAEDF2] hover:bg-[#F6F7FA] transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-purple-500"
          >
            <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" />
          </svg>
          <span className="text-sm text-gray-700">反转顶点顺序</span>
        </button>
      </div>

      {/* 提示信息 */}
      <div className="text-xs text-gray-400 mt-4 p-3 bg-gray-50 rounded-lg">
        <p>• 水平镜像：沿垂直中轴线翻转</p>
        <p>• 垂直镜像：沿水平中轴线翻转</p>
        <p>• 旋转变换：围绕中心点旋转</p>
        <p>• 反转顺序：改变顶点连接方向</p>
      </div>
    </div>
  );
}
