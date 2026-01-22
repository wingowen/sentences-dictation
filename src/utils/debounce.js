// src/utils/debounce.js
/**
 * 创建防抖函数
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟时间(毫秒)
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay = 300) {
  let lastCall = 0;
  let timer = null;

  return function(...args) {
    const now = Date.now();

    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer);
    }

    // 如果距离上次调用超过delay，立即执行
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    }

    // 否则延迟执行
    timer = setTimeout(() => {
      lastCall = Date.now();
      return fn.apply(this, args);
    }, delay - (now - lastCall));
  };
}

/**
 * 创建节流函数
 * @param {Function} fn - 要节流的函数
 * @param {number} interval - 执行间隔(毫秒)
 * @returns {Function} 节流后的函数
 */
export function throttle(fn, interval = 300) {
  let lastCall = 0;

  return function(...args) {
    const now = Date.now();

    if (now - lastCall >= interval) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}