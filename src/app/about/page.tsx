'use client';

import { Github, Scissors } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState('intro');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['intro', 'basic', 'style', 'advanced', 'export'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveSection(sectionId);
    }
  };

  const menuItems = [
    { id: 'intro', label: '项目简介' },
    { id: 'basic', label: '基础操作' },
    { id: 'style', label: '样式配置' },
    { id: 'advanced', label: '高级配置' },
    { id: 'export', label: '代码导出' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem-6rem)] justify-center">
      <div className="relative flex w-full max-w-7xl">
        {/* 左侧目录导航 - 使用 fixed 定位 */}
        <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white/95 p-6 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95 lg:block">
          <div className="mb-6 flex items-center gap-2">
            <Scissors className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">文档目录</h2>
          </div>
          <nav className="space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* 右侧内容区域 - 添加左边距为目录留出空间 */}
        <main className="flex-1 px-4 py-12 pb-24 sm:px-6 lg:ml-64 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* 页面标题 */}
            <div className="mb-12">
              <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">使用文档</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">SVG 编辑器的完整使用指南</p>
            </div>

            {/* 项目简介 */}
            <section id="intro" className="mb-16 scroll-mt-24">
              <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">项目简介</h2>
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  SVG 编辑器是一款直观的 SVG
                  多边形编辑工具，帮助您轻松创建和编辑复杂的多边形形状。无论您是前端开发者、设计师还是
                  SVG 爱好者，都能通过这个工具快速实现各种 SVG 效果。
                </p>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  本工具支持可视化编辑、实时预览、代码生成等功能，让 SVG 多边形的创建变得简单高效。
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="https://github.com/crper/next-css-polygon-editor"
                    target="_blank"
                    className="flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-white transition-colors hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    <Github className="h-5 w-5" />
                    <span>GitHub 原仓库</span>
                  </Link>
                  <Link
                    href="https://github.com/crper/next-css-polygon-editor"
                    target="_blank"
                    className="flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-white transition-colors hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    <Github className="h-5 w-5" />
                    <span>我的 GitHub 仓库</span>
                  </Link>
                </div>
              </div>
            </section>

            {/* 基础操作 */}
            <section id="basic" className="mb-16 scroll-mt-24">
              <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">基础操作</h2>
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <ul className="space-y-4 text-gray-600 dark:text-gray-400">
                  <li>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      添加顶点
                    </h3>
                    <p>
                      在编辑区域的画布上任意位置点击，即可在该位置添加一个新的顶点。也可以点击多边形的边线，系统会自动在最近的边上插入顶点。
                    </p>
                  </li>
                  <li>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      移动顶点
                    </h3>
                    <p>
                      将鼠标悬停在顶点上，按住鼠标左键并拖拽，即可移动顶点位置。顶点会实时跟随鼠标移动，方便精确调整。
                    </p>
                  </li>
                  <li>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      删除顶点
                    </h3>
                    <p>
                      在任意顶点上点击鼠标右键，即可删除该顶点。删除后多边形会自动重新连接剩余顶点。
                    </p>
                  </li>
                  <li>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      全屏编辑
                    </h3>
                    <p>点击编辑区域右上角的全屏按钮，可以进入全屏模式进行更精确的编辑操作。</p>
                  </li>
                </ul>
              </div>
            </section>

            {/* 样式配置 */}
            <section id="style" className="mb-16 scroll-mt-24">
              <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">样式配置</h2>
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <ul className="space-y-4 text-gray-600 dark:text-gray-400">
                  <li>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      背景设置
                    </h3>
                    <p>
                      在配置区域顶部，点击上传按钮选择图片文件，即可为编辑区域和预览区域设置背景图片。支持
                      JPG、PNG、GIF 等常见图片格式。点击清除按钮可移除背景图片。
                    </p>
                  </li>
                  <li>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      预览尺寸
                    </h3>
                    <p>
                      在样式配置中，可以手动输入宽度和高度（单位：像素），调整预览区域的显示尺寸。最小值为
                      50px，最大值为 1000px。
                    </p>
                  </li>
                  <li>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      预设形状
                    </h3>
                    <p>
                      点击预设形状按钮（如正方形、三角形、五边形、六边形、五角星、圆形），可以快速应用预设的多边形形状。
                    </p>
                  </li>
                  <li>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      预设比例
                    </h3>
                    <p>
                      选择预设比例（如
                      16:9、4:3、1:1、3:4、9:16、21:9），可以快速设置预览区域的宽高比。
                    </p>
                  </li>
                  <li>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      缩放功能
                    </h3>
                    <p>使用缩放按钮（0.5x、1x、1.5x、2x），可以按比例缩放当前的预览尺寸。</p>
                  </li>
                </ul>
              </div>
            </section>

            {/* 高级配置 */}
            <section id="advanced" className="mb-16 scroll-mt-24">
              <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">高级配置</h2>
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <ul className="space-y-4 text-gray-600 dark:text-gray-400">
                  <li>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      顶点配置
                    </h3>
                    <p>
                      展开顶点配置面板，可以精确调整每个顶点的 X 和 Y 坐标（百分比值，范围
                      0-100）。每个顶点都有独立的输入框，支持小数点后一位的精度。
                    </p>
                  </li>
                  <li>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      圆角配置
                    </h3>
                    <p>
                      展开圆角配置面板，可以为每个顶点设置圆角半径（单位：像素，范围
                      0-50）。圆角可以让多边形的边角更加平滑。点击重置按钮可将圆角恢复为 0。
                    </p>
                  </li>
                  <li>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      重置多边形
                    </h3>
                    <p>
                      在顶点配置面板中，点击&ldquo;重置多边形&rdquo;按钮，可以将所有顶点恢复为默认状态。
                    </p>
                  </li>
                </ul>
              </div>
            </section>

            {/* 代码导出 */}
            <section id="export" className="mb-16 scroll-mt-24">
              <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">代码导出</h2>
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <ul className="space-y-4 text-gray-600 dark:text-gray-400">
                  <li>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      SVG 代码
                    </h3>
                    <p>
                      在预览区域的代码配置面板中，会自动生成对应的 SVG 代码。代码包含完整的 SVG
                      标签、渐变定义和多边形路径。
                    </p>
                  </li>
                  <li>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      复制代码
                    </h3>
                    <p>
                      点击代码框右上角的复制按钮，即可将 SVG
                      代码复制到剪贴板，然后可以直接粘贴到您的项目中使用。
                    </p>
                  </li>
                  <li>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      实时预览
                    </h3>
                    <p>
                      编辑区域和预览区域会实时同步更新，您可以随时查看编辑效果，实现所见即所得。
                    </p>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
