'use client';

import { Minus, Palette, Plus } from 'lucide-react';

// 自定义渐变编辑器
function CustomGradientEditor({
  colors,
  onChange,
}: {
  colors: string[];
  onChange: (colors: string[]) => void;
}) {
  const updateColor = (index: number, color: string) => {
    const newColors = [...colors];
    newColors[index] = color;
    onChange(newColors);
  };

  const addColor = () => {
    if (colors.length < 5) {
      onChange([...colors, '#888888']);
    }
  };

  const removeColor = (index: number) => {
    if (colors.length > 2) {
      const newColors = colors.filter((_, i) => i !== index);
      onChange(newColors);
    }
  };

  const gradientStyle = `linear-gradient(to right, ${colors.join(', ')})`;

  return (
    <div className="space-y-2">
      {/* 渐变预览 */}
      <div
        className="h-8 w-full rounded-md border border-gray-300 dark:border-gray-600"
        style={{ background: gradientStyle }}
      />

      {/* 颜色编辑 */}
      <div className="space-y-2">
        {colors.map((color, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-8 text-xs text-gray-500">{index + 1}</span>
            <input
              type="color"
              value={color}
              onChange={e => updateColor(index, e.target.value)}
              className="h-8 w-10 cursor-pointer rounded border border-gray-300 bg-transparent p-0.5 dark:border-gray-600"
            />
            <input
              type="text"
              value={color}
              onChange={e => {
                const value = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                  updateColor(index, value);
                }
              }}
              className="flex-1 rounded border border-gray-300 bg-white/10 px-2 py-1 text-xs dark:border-gray-600 dark:bg-black/10"
            />
            {colors.length > 2 && (
              <button
                onClick={() => removeColor(index)}
                className="rounded p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                title="删除颜色"
              >
                <Minus size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 添加颜色按钮 */}
      {colors.length < 5 && (
        <button
          onClick={addColor}
          className="flex w-full items-center justify-center gap-1 rounded border border-dashed border-gray-300 py-1.5 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-600 dark:border-gray-600 dark:hover:border-gray-500"
        >
          <Plus size={14} />
          添加颜色 ({colors.length}/5)
        </button>
      )}
    </div>
  );
}

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
        <div className="space-y-3">
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
          {/* 自定义颜色 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              自定义颜色
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fillColor.startsWith('#') ? fillColor : '#6366f1'}
                onChange={e => handleSolidColorSelect(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-gray-300 bg-transparent p-1 dark:border-gray-600"
              />
              <input
                type="text"
                value={fillColor}
                onChange={e => {
                  const value = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === '') {
                    handleSolidColorSelect(value || '#');
                  }
                }}
                onBlur={e => {
                  const value = e.target.value;
                  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                    handleSolidColorSelect('#6366f1');
                  }
                }}
                placeholder="#000000"
                className="flex-1 rounded border border-gray-300 bg-white/10 px-3 py-2 text-sm dark:border-gray-600 dark:bg-black/10"
              />
            </div>
          </div>
        </div>
      )}

      {/* 渐变选择 */}
      {fillType === 'gradient' && (
        <div className="space-y-3">
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
          {/* 自定义渐变 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              自定义渐变
            </label>
            <CustomGradientEditor
              colors={(() => {
                try {
                  return JSON.parse(fillColor);
                } catch {
                  return ['#6366f1', '#d946ef'];
                }
              })()}
              onChange={handleGradientSelect}
            />
          </div>
        </div>
      )}
    </div>
  );
}
