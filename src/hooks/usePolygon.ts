'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 表示多边形顶点的类型
 */
export interface Point {
  x: number;
  y: number;
  radius?: number;
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
  canUndo: boolean;
  canRedo: boolean;
  addPoint: (point: Point, insertIndex?: number) => void;
  removePoint: (index: number) => void;
  updatePoint: (index: number, point: Point) => void;
  updatePointRadius: (pointIndex: number, radius: number) => void;
  startDragging: (index: number) => void;
  stopDragging: () => void;
  moveActivePoint: (point: Point) => void;
  resetPolygon: () => void;
  setPoints: (newPoints: Point[]) => void;
  generateCssClipPath: () => string;
  undo: () => void;
  redo: () => void;
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

const MAX_HISTORY = 50;

/**
 * 多边形编辑器钩子
 * 提供管理多边形顶点和生成CSS clip-path的功能，支持撤回/重做
 */
export function usePolygon(initialPoints: Point[] = DEFAULT_POLYGON): UsePolygonReturn {
  const [state, setState] = useState<PolygonState>({
    points: initialPoints,
    isDragging: false,
    activePointIndex: null,
  });

  // 历史记录
  const [history, setHistory] = useState<Point[][]>([initialPoints]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoRef = useRef(false);
  const lastSavedPointsRef = useRef<string>(JSON.stringify(initialPoints));

  // 保存到历史记录（防抖，只在操作结束时保存）
  const saveToHistory = useCallback(
    (points: Point[]) => {
      const pointsJson = JSON.stringify(points);
      if (pointsJson === lastSavedPointsRef.current) return;

      lastSavedPointsRef.current = pointsJson;
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(points);
        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
          return newHistory;
        }
        return newHistory;
      });
      setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
    },
    [historyIndex]
  );

  // 撤回
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoRef.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevPoints = history[newIndex];
      lastSavedPointsRef.current = JSON.stringify(prevPoints);
      setState(prev => ({
        ...prev,
        points: prevPoints,
        activePointIndex: null,
      }));
    }
  }, [historyIndex, history]);

  // 重做
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextPoints = history[newIndex];
      lastSavedPointsRef.current = JSON.stringify(nextPoints);
      setState(prev => ({
        ...prev,
        points: nextPoints,
        activePointIndex: null,
      }));
    }
  }, [historyIndex, history]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const setPoints = useCallback(
    (newPoints: Point[]) => {
      const pointsWithRadius = newPoints.map(point => ({
        ...point,
        radius: point.radius || 0,
      }));
      setState(prev => ({
        ...prev,
        points: pointsWithRadius,
        activePointIndex: null,
      }));
      saveToHistory(pointsWithRadius);
    },
    [saveToHistory]
  );

  const addPoint = useCallback(
    (point: Point, insertIndex?: number) => {
      setState(prev => {
        const newPoints = [...prev.points];
        const pointWithRadius = { ...point, radius: point.radius || 0 };

        if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= newPoints.length) {
          newPoints.splice(insertIndex, 0, pointWithRadius);
        } else {
          newPoints.push(pointWithRadius);
        }

        saveToHistory(newPoints);
        return { ...prev, points: newPoints };
      });
    },
    [saveToHistory]
  );

  const removePoint = useCallback(
    (index: number) => {
      setState(prev => {
        if (prev.points.length <= 3) return prev;

        const newPoints = [...prev.points];
        newPoints.splice(index, 1);

        saveToHistory(newPoints);
        return { ...prev, points: newPoints, activePointIndex: null };
      });
    },
    [saveToHistory]
  );

  const updatePoint = useCallback(
    (index: number, point: Point) => {
      setState(prev => {
        const newPoints = [...prev.points];
        newPoints[index] = {
          ...newPoints[index],
          x: parseFloat(point.x.toFixed(3)),
          y: parseFloat(point.y.toFixed(3)),
        };

        saveToHistory(newPoints);
        return { ...prev, points: newPoints };
      });
    },
    [saveToHistory]
  );

  const updatePointRadius = useCallback(
    (pointIndex: number, radius: number) => {
      setState(prev => {
        const newPoints = [...prev.points];
        newPoints[pointIndex] = {
          ...newPoints[pointIndex],
          radius: Math.max(0, Math.min(50, radius)),
        };

        saveToHistory(newPoints);
        return { ...prev, points: newPoints };
      });
    },
    [saveToHistory]
  );

  const startDragging = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      isDragging: true,
      activePointIndex: index,
    }));
  }, []);

  const stopDragging = useCallback(() => {
    setState(prev => {
      // 拖拽结束时保存历史
      if (prev.isDragging) {
        saveToHistory(prev.points);
      }
      return { ...prev, isDragging: false, activePointIndex: null };
    });
  }, [saveToHistory]);

  const moveActivePoint = useCallback((point: Point) => {
    setState(prev => {
      if (prev.activePointIndex === null || !prev.isDragging) return prev;

      const newPoints = [...prev.points];
      newPoints[prev.activePointIndex] = {
        ...newPoints[prev.activePointIndex],
        x: parseFloat(point.x.toFixed(3)),
        y: parseFloat(point.y.toFixed(3)),
      };

      return { ...prev, points: newPoints };
    });
  }, []);

  const resetPolygon = useCallback(() => {
    setState({
      points: DEFAULT_POLYGON,
      isDragging: false,
      activePointIndex: null,
    });
    saveToHistory(DEFAULT_POLYGON);
  }, [saveToHistory]);

  const generateCssClipPath = useCallback(() => {
    return `polygon(${state.points.map(point => `${parseFloat(point.x.toFixed(3))}% ${parseFloat(point.y.toFixed(3))}%`).join(', ')})`;
  }, [state.points]);

  return {
    points: state.points,
    activePointIndex: state.activePointIndex,
    isDragging: state.isDragging,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    addPoint,
    removePoint,
    updatePoint,
    updatePointRadius,
    startDragging,
    stopDragging,
    moveActivePoint,
    resetPolygon,
    setPoints,
    generateCssClipPath,
    undo,
    redo,
  };
}
