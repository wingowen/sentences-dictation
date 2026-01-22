// src/utils/contractionMap.js
/**
 * 英语缩略词映射表
 * 用于将缩略词展开为完整形式
 * 单一数据源，避免重复定义
 */
export const CONTRACTION_MAP = {
  // 人称缩略词
  "i'm": "i am",
  "you're": "you are",
  "he's": "he is",
  "she's": "she is",
  "it's": "it is",
  "we're": "we are",
  "they're": "they are",

  // 将来时
  "i'll": "i will",
  "you'll": "you will",
  "he'll": "he will",
  "she'll": "she will",
  "it'll": "it will",
  "we'll": "we will",
  "they'll": "they will",

  // 完成时
  "i've": "i have",
  "you've": "you have",
  "we've": "we have",
  "they've": "they have",

  // 过去将来时
  "i'd": "i would",
  "you'd": "you would",
  "he'd": "he would",
  "she'd": "she would",
  "it'd": "it would",
  "we'd": "we would",
  "they'd": "they would",

  // 否定缩略词
  "don't": "do not",
  "doesn't": "does not",
  "didn't": "did not",
  "won't": "will not",
  "wouldn't": "would not",
  "can't": "cannot",
  "couldn't": "could not",
  "shouldn't": "should not",
  "mustn't": "must not",
  "isn't": "is not",
  "aren't": "are not",
  "wasn't": "was not",
  "weren't": "were not",
  "hasn't": "has not",
  "haven't": "have not",
  "hadn't": "had not"
};

/**
 * 展开缩略词
 * @param {string} word - 可能包含缩略词的单词
 * @returns {string} 展开后的单词
 */
export function expandContraction(word) {
  const lowerWord = word.toLowerCase();
  const expanded = CONTRACTION_MAP[lowerWord];
  return expanded || word;
}

/**
 * 检查单词是否为缩略词
 * @param {string} word - 要检查的单词
 * @returns {boolean} 是否为缩略词
 */
export function isContraction(word) {
  return CONTRACTION_MAP.hasOwnProperty(word.toLowerCase());
}