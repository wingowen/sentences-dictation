import { useState, useEffect } from 'react'

/**
 * 自定义hook用于处理localStorage的读写
 * @param {string} key - 存储键名
 * @param {any} initialValue - 初始值
 * @returns {[any, function, function]} - [值, 设置值的函数, 清除值的函数]
 */
export const useLocalStorage = (key, initialValue) => {
  // 从localStorage读取初始值
  const readValue = () => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // 状态保存值
  const [storedValue, setStoredValue] = useState(readValue);

  // 返回一个包装版的setState，将新值保存到localStorage
  const setValue = (value) => {
    try {
      // 允许value是一个函数，类似于setState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // 保存状态
      setStoredValue(valueToStore);
      
      // 保存到localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // 清除值
  const clearValue = () => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error clearing localStorage key "${key}":`, error);
    }
  };

  // 监听其他窗口的变化
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, clearValue];
};