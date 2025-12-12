'use client';

import { Crop, ImageIcon, Image as ImageIconComponent, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { ImageCropModal } from './ImageCropModal';

export interface BackgroundImageConfig {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BackgroundSettingsProps {
  backgroundImage: string;
  onChange: (url: string) => void;
  previewSize?: { width: number; height: number };
  onPreviewSizeChange?: (width: number, height: number) => void;
  backgroundConfig?: BackgroundImageConfig;
  onBackgroundConfigChange?: (config: BackgroundImageConfig) => void;
}

export function BackgroundSettings({
  backgroundImage,
  onChange,
  previewSize,
  onPreviewSizeChange,
  backgroundConfig,
  onBackgroundConfigChange,
}: BackgroundSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string>('');

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

      // 检查图片尺寸，如果是长图或与预览尺寸比例不匹配则显示裁剪界面
      const img = new Image();
      img.onload = () => {
        const imgAspectRatio = img.width / img.height;
        const previewAspectRatio = previewSize ? previewSize.width / previewSize.height : null;

        // 如果宽高比大于 2:1 或小于 1:2，认为是长图，显示裁剪界面
        // 或者如果预览尺寸比例与图片比例差异较大，也显示裁剪界面
        const shouldCrop =
          imgAspectRatio > 2 ||
          imgAspectRatio < 0.5 ||
          (previewAspectRatio && Math.abs(imgAspectRatio - previewAspectRatio) > 0.2);

        if (shouldCrop) {
          setTempImageUrl(imageUrl);
          setShowCropModal(true);
        } else {
          onChange(imageUrl);
        }
      };
      img.src = imageUrl;
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

  const handleCrop = (croppedImageUrl: string) => {
    onChange(croppedImageUrl);
    setShowCropModal(false);
    // 只有当临时URL与裁剪后的URL不同时才清理
    // 避免释放正在使用的blob URL
    setTimeout(() => {
      if (
        tempImageUrl &&
        tempImageUrl.startsWith('blob:') &&
        tempImageUrl !== croppedImageUrl &&
        tempImageUrl !== backgroundImage
      ) {
        URL.revokeObjectURL(tempImageUrl);
      }
      setTempImageUrl('');
    }, 100);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    // 清理临时图片URL
    setTimeout(() => {
      if (tempImageUrl && tempImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(tempImageUrl);
      }
      setTempImageUrl('');
    }, 100);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropClick = () => {
    if (backgroundImage) {
      setTempImageUrl(backgroundImage);
      setShowCropModal(true);
    }
  };

  return (
    <div className="space-y-4">
      {showCropModal && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCrop={handleCrop}
          onCancel={handleCropCancel}
          aspectRatio={previewSize ? previewSize.width / previewSize.height : undefined}
          onAspectRatioChange={(width, height) => {
            console.log('[BackgroundSettings] onAspectRatioChange received:', { width, height });
            console.log('[BackgroundSettings] onPreviewSizeChange exists:', !!onPreviewSizeChange);
            if (onPreviewSizeChange) {
              onPreviewSizeChange(width, height);
            }
          }}
        />
      )}
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">背景设置</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">上传背景图片</p>
        </div>
      </div>

      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {!backgroundImage ? (
          <div
            onClick={handleButtonClick}
            className="group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
          >
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <ImageIconComponent className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              点击上传图片
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">支持 JPG、PNG、GIF 等格式</p>
          </div>
        ) : (
          <div className="relative rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <button
              type="button"
              onClick={handleClearImage}
              className="absolute right-2 top-2 rounded-full bg-red-100 p-1.5 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
              title="清除图片"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={backgroundImage} alt="背景预览" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                  背景图片已上传
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleButtonClick}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    更换图片
                  </button>
                  <button
                    type="button"
                    onClick={handleCropClick}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Crop className="h-3 w-3" />
                    裁剪图片
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 图片大小和位置设置 */}
        {backgroundImage && backgroundConfig && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">图片大小</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={backgroundConfig.width}
                  onChange={e => {
                    const size = Number(e.target.value);
                    onBackgroundConfigChange?.({ ...backgroundConfig, width: size, height: size });
                  }}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-600 w-12">{backgroundConfig.width}%</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">提示：可在画布中直接拖拽图片调整位置</div>
          </div>
        )}
      </div>
    </div>
  );
}
