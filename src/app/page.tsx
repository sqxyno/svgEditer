import { PolygonEditor } from '@/components/polygon-editor';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* 编辑器区域 */}
      <PolygonEditor />
    </div>
  );
}
