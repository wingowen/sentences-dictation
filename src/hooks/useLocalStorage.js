// src/hooks/useLocalStorage.js
import { useState, useEffect, useCallback } from 'react';

/**
 * localStorage Hook(带防抖)
 * @param {string} key - localStorage键
 * @param {*} initialValue - 初始值
 * @param {number} debounceDelay - 防抖延迟(毫秒)，默认1000ms
 * @returns {Array} [value, setValue, error, isLoading]
 */
export function useLocalStorage(key, initialValue, debounceDelay = 1000) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载初始值
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(JSON.parse(item));
      }
      setIsLoading(false);
    } catch (err) {
      console.error(`Error loading ${key} from localStorage:`, err);
      setError(err);
      setIsLoading(false);
    }
  }, [key]);

  // 防抖保存
  const debouncedSave = useCallback((newValue) => {
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
      setError(null);
    } catch (err) {
      console.error(`Error saving ${key} to localStorage:`, err);
      setError(err);
    }
  }, [key]);

  // 当value变化时，防抖保存
  useEffect(() => {
    if (isLoading) return; // 避免初始加载时触发保存

    const timer = setTimeout(() => {
      debouncedSave(value);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [value, debouncedSave, debounceDelay, isLoading]);

  return [value, setValue, error, isLoading];
}