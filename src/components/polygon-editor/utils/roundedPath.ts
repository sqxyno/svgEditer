import { Point } from '@/hooks/usePolygon';

interface RoundedPathResult {
  cssPath: string;
  svgPath: string;
}

const clampRadius = (radius: number, max: number) => Math.max(0, Math.min(radius, max));

const roundNumber = (value: number) => parseFloat(value.toFixed(3));

const toPercent = (value: number, total: number) => (total === 0 ? 0 : (value / total) * 100);

/**
 * 根据顶点和圆角生成 path() 和 SVG path 字符串
 */
export function generateRoundedPath(points: Point[], width: number, height: number): RoundedPathResult | null {
  if (points.length < 3) {
    return null;
  }

  const percentCommands: string[] = [];
  const svgCommands: string[] = [];

  const getPointPx = (point: Point) => ({
    x: (point.x / 100) * width,
    y: (point.y / 100) * height,
  });

  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const prev = points[(i - 1 + points.length) % points.length];
    const next = points[(i + 1) % points.length];

    const currentPx = getPointPx(current);
    const prevPx = getPointPx(prev);
    const nextPx = getPointPx(next);

    const prevVector = { x: currentPx.x - prevPx.x, y: currentPx.y - prevPx.y };
    const nextVector = { x: currentPx.x - nextPx.x, y: currentPx.y - nextPx.y };

    const prevLength = Math.hypot(prevVector.x, prevVector.y);
    const nextLength = Math.hypot(nextVector.x, nextVector.y);

    const maxAllowedRadius = Math.min(prevLength, nextLength) / 2;
    const baseRadius = current.radius ?? 0;
    const cornerRadius = clampRadius(baseRadius, maxAllowedRadius);

    const normalizedPrev = prevLength === 0 ? { x: 0, y: 0 } : { x: prevVector.x / prevLength, y: prevVector.y / prevLength };
    const normalizedNext = nextLength === 0 ? { x: 0, y: 0 } : { x: nextVector.x / nextLength, y: nextVector.y / nextLength };

    const startPointPx = {
      x: currentPx.x - normalizedPrev.x * cornerRadius,
      y: currentPx.y - normalizedPrev.y * cornerRadius,
    };

    const endPointPx = {
      x: currentPx.x - normalizedNext.x * cornerRadius,
      y: currentPx.y - normalizedNext.y * cornerRadius,
    };

    const startPercent = {
      x: roundNumber(toPercent(startPointPx.x, width)),
      y: roundNumber(toPercent(startPointPx.y, height)),
    };
    const endPercent = {
      x: roundNumber(toPercent(endPointPx.x, width)),
      y: roundNumber(toPercent(endPointPx.y, height)),
    };
    const currentPercent = {
      x: roundNumber(toPercent(currentPx.x, width)),
      y: roundNumber(toPercent(currentPx.y, height)),
    };

    if (i === 0) {
      percentCommands.push(`M ${startPercent.x}% ${startPercent.y}%`);
      svgCommands.push(`M ${startPercent.x} ${startPercent.y}`);
    } else {
      percentCommands.push(`L ${startPercent.x}% ${startPercent.y}%`);
      svgCommands.push(`L ${startPercent.x} ${startPercent.y}`);
    }

    if (cornerRadius > 0) {
      percentCommands.push(`Q ${currentPercent.x}% ${currentPercent.y}% ${endPercent.x}% ${endPercent.y}%`);
      svgCommands.push(`Q ${currentPercent.x} ${currentPercent.y} ${endPercent.x} ${endPercent.y}`);
    }
  }

  percentCommands.push('Z');
  svgCommands.push('Z');

  return {
    cssPath: `path('${percentCommands.join(' ')}')`,
    svgPath: svgCommands.join(' '),
  };
}

