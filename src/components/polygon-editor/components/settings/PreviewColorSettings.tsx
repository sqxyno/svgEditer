'use client';

import { Palette } from 'lucide-react';

export interface PreviewColorSettingsProps {
  fillColor: string;
  fillType: 'solid' | 'gradient';
  onChange: (color: string, type: 'solid' | 'gradient') => void;
}

// 预设颜色
const presetColors = [
  '#6366f1', // 蓝色
  '#8b5cf6', // 紫色
  '#d946ef', // 粉色
  '#ec4899', // 玫瑰色
  '#f43f5e', // 红色
  '#f97316', // 橙色
  '#eab308', // 黄色
  '#22c55e', // 绿色
  '#06b6d4', // 青色
  '#3b82f6', // 亮蓝色
  '#64748b', // 灰色
  '#000000', // 黑色
];

// 预设渐变
const presetGradients = [
  { name: '蓝紫粉', colors: ['#6366f1', '#8b5cf6', '#d946ef'] },
  { name: '蓝青', colors: ['#3b82f6', '#06b6d4'] },
  { name: '紫粉', colors: ['#8b5cf6', '#d946ef', '#ec4899'] },
  { name: '橙红', colors: ['#f97316', '#f43f5e'] },
  { name: '绿青', colors: ['#22c55e', '#06b6d4'] },
  { name: '黄橙', colors: ['#eab308', '#f97316'] },
  { name: '粉红', colors: ['#ec4899', '#f43f5e'] },
  { name: '蓝绿', colors: ['#3b82f6', '#22c55e'] },
];

export function PreviewColorSettings({ fillColor, fillType, onChange }: PreviewColorSettingsProps) {
  const handleSolidColorSelect = (color: string) => {
    onChange(color, 'solid');
  };

  const handleGradientSelect = (colors: string[]) => {
    const gradientJson = JSON.stringify(colors);
    onChange(gradientJson, 'gradient');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">预览颜色</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">选择预览区域的填充颜色</p>
        </div>
      </div>

      {/* 填充类型选择 */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (fillType !== 'solid') {
              handleSolidColorSelect(presetColors[0]);
            }
          }}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            fillType === 'solid'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          纯色
        </button>
        <button
          onClick={() => {
            if (fillType !== 'gradient') {
              handleGradientSelect(presetGradients[0].colors);
            }
          }}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            fillType === 'gradient'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          渐变
        </button>
      </div>

      {/* 纯色选择 */}
      {fillType === 'solid' && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            预设颜色
          </label>
          <div className="grid grid-cols-6 gap-2">
            {presetColors.map(color => (
              <button
                key={color}
                onClick={() => handleSolidColorSelect(color)}
                className={`h-10 w-full rounded-md border-2 transition-all ${
                  fillColor === color
                    ? 'border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* 渐变选择 */}
      {fillType === 'gradient' && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            预设渐变
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {presetGradients.map((gradient, index) => {
              const gradientId = `preview-gradient-${index}`;
              const gradientJson = JSON.stringify(gradient.colors);
              const isSelected = fillColor === gradientJson;

              return (
                <button
                  key={index}
                  onClick={() => handleGradientSelect(gradient.colors)}
                  className={`relative h-16 w-full overflow-hidden rounded-md border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  }`}
                  title={gradient.name}
                >
                  <svg className="h-full w-full">
                    <defs>
                      <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        {gradient.colors.map((color, i) => (
                          <stop
                            key={i}
                            offset={`${(i / (gradient.colors.length - 1)) * 100}%`}
                            stopColor={color}
                          />
                        ))}
                      </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#${gradientId})`} />
                  </svg>
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-medium text-white drop-shadow-sm">
                    {gradient.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
