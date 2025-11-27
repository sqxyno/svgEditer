'use client';

import { useCallback, useState } from 'react';

/**
 * 表示多边形顶点的类型
 */
export interface Point {
  x: number;
  y: number;
  radius?: number; // 添加圆角半径属性，单位为px
}

/**
 * 多边形状态接口
 */
export interface PolygonState {
  points: Point[];
  isDragging: boolean;
  activePointIndex: number | null;
}

/**
 * 多边形编辑器钩子返回值接口
 */
export interface UsePolygonReturn {
  points: Point[];
  activePointIndex: number | null;
  isDragging: boolean;
  addPoint: (point: Point, insertIndex?: number) => void;
  removePoint: (index: number) => void;
  updatePoint: (index: number, point: Point) => void;
  updatePointRadius: (pointIndex: number, radius: number) => void; // 添加更新顶点圆角的方法
  startDragging: (index: number) => void;
  stopDragging: () => void;
  moveActivePoint: (point: Point) => void;
  resetPolygon: () => void;
  setPoints: (newPoints: Point[]) => void;
  generateCssClipPath: () => string;
}

/**
 * 默认多边形 - 正方形
 */
const DEFAULT_POLYGON: Point[] = [
  { x: 10, y: 10, radius: 0 },
  { x: 90, y: 10, radius: 0 },
  { x: 90, y: 90, radius: 0 },
  { x: 10, y: 90, radius: 0 },
];

/**
 * 多边形编辑器钩子
 * 提供管理多边形顶点和生成CSS clip-path的功能
 */
export function usePolygon(initialPoints: Point[] = DEFAULT_POLYGON): UsePolygonReturn {
  const [state, setState] = useState<PolygonState>({
    points: initialPoints,
    isDragging: false,
    activePointIndex: null,
  });

  /**
   * 直接设置所有顶点
   * @param newPoints 新的顶点数组
   */
  const setPoints = useCallback((newPoints: Point[]) => {
    // 确保每个点都有radius属性
    const pointsWithRadius = newPoints.map(point => ({
      ...point,
      radius: point.radius || 0
    }));
    setState(prev => ({
      ...prev,
      points: pointsWithRadius,
      activePointIndex: null,
    }));
  }, []);

  /**
   * 添加新的顶点
   * @param point 要添加的顶点坐标
   * @param insertIndex 可选的插入位置索引，如果提供则在该位置插入点，否则添加到末尾
   */
  const addPoint = useCallback((point: Point, insertIndex?: number) => {
    setState(prev => {
      const newPoints = [...prev.points];
      const pointWithRadius = { ...point, radius: point.radius || 0 };

      if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= newPoints.length) {
        // 在指定位置插入点
        newPoints.splice(insertIndex, 0, pointWithRadius);
      } else {
        // 添加到末尾
        newPoints.push(pointWithRadius);
      }

      return {
        ...prev,
        points: newPoints,
      };
    });
  }, []);

  /**
   * 移除指定索引的顶点
   */
  const removePoint = useCallback((index: number) => {
    setState(prev => {
      // 确保至少保留3个点（最小多边形）
      if (prev.points.length <= 3) {
        return prev;
      }

      const newPoints = [...prev.points];
      newPoints.splice(index, 1);

      return {
        ...prev,
        points: newPoints,
        activePointIndex: null,
      };
    });
  }, []);

  /**
   * 更新指定索引的顶点坐标
   * 限制坐标值最多只显示3位小数
   */
  const updatePoint = useCallback((index: number, point: Point) => {
    setState(prev => {
      const newPoints = [...prev.points];
      // 限制坐标值最多只显示3位小数
      newPoints[index] = {
        ...newPoints[index],
        x: parseFloat(point.x.toFixed(3)),
        y: parseFloat(point.y.toFixed(3)),
      };

      return {
        ...prev,
        points: newPoints,
      };
    });
  }, []);

  /**
   * 更新顶点圆角半径
   */
  const updatePointRadius = useCallback((pointIndex: number, radius: number) => {
    setState(prev => {
      const newPoints = [...prev.points];
      newPoints[pointIndex] = { 
        ...newPoints[pointIndex], 
        radius: Math.max(0, Math.min(50, radius)) // 限制圆角半径在0-50px之间
      };

      return {
        ...prev,
        points: newPoints,
      };
    });
  }, []);

  /**
   * 开始拖拽指定索引的顶点
   */
  const startDragging = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      isDragging: true,
      activePointIndex: index,
    }));
  }, []);

  /**
   * 停止拖拽
   */
  const stopDragging = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDragging: false,
      activePointIndex: null,
    }));
  }, []);

  /**
   * 移动当前激活的顶点
   * 限制坐标值最多只显示3位小数
   */
  const moveActivePoint = useCallback((point: Point) => {
    setState(prev => {
      if (prev.activePointIndex === null || !prev.isDragging) {
        return prev;
      }

      const newPoints = [...prev.points];
      // 限制坐标值最多只显示3位小数
      newPoints[prev.activePointIndex] = {
        ...newPoints[prev.activePointIndex],
        x: parseFloat(point.x.toFixed(3)),
        y: parseFloat(point.y.toFixed(3)),
      };

      return {
        ...prev,
        points: newPoints,
      };
    });
  }, []);

  /**
   * 重置多边形为默认形状
   */
  const resetPolygon = useCallback(() => {
    setState({
      points: DEFAULT_POLYGON,
      isDragging: false,
      activePointIndex: null,
    });
  }, []);

  /**
   * 生成CSS clip-path多边形路径
   * 确保坐标值最多只显示3位小数
   */
  const generateCssClipPath = useCallback(() => {
    return `polygon(${state.points.map(point => `${parseFloat(point.x.toFixed(3))}% ${parseFloat(point.y.toFixed(3))}%`).join(', ')})`;
  }, [state.points]);

  return {
    points: state.points,
    activePointIndex: state.activePointIndex,
    isDragging: state.isDragging,
    addPoint,
    removePoint,
    updatePoint,
    updatePointRadius, // 添加更新顶点圆角半径的方法
    startDragging,
    stopDragging,
    moveActivePoint,
    resetPolygon,
    setPoints,
    generateCssClipPath,
  };
}
