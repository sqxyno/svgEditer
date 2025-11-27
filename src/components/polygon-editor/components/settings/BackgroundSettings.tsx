'use client';

import { useRef } from 'react';

export interface BackgroundSettingsProps {
  backgroundImage: string;
  onChange: (url: string) => void;
}

export function BackgroundSettings({ backgroundImage, onChange }: BackgroundSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
      }
      
      // 创建文件URL
      const imageUrl = URL.createObjectURL(file);
      onChange(imageUrl);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <h4 className="mb-2 text-sm font-medium">背景设置</h4>
      <div>
        <label className="mb-1 block text-xs">背景图片</label>
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleButtonClick}
              className="flex-1 rounded border border-gray-300 bg-white/10 px-3 py-2 text-sm hover:bg-white/20 dark:border-gray-700 dark:bg-black/10 dark:hover:bg-black/20"
            >
              选择图片
            </button>
            {backgroundImage && (
              <button
                type="button"
                onClick={handleClearImage}
                className="rounded border border-red-300 bg-red-50/10 px-3 py-2 text-sm text-red-600 hover:bg-red-50/20 dark:border-red-700 dark:text-red-400"
              >
                清除
              </button>
            )}
          </div>
          {backgroundImage && (
            <div className="rounded border border-gray-300 p-2 dark:border-gray-700">
              <img
                src={backgroundImage}
                alt="背景预览"
                className="max-h-20 max-w-full rounded object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
