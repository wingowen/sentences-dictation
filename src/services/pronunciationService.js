// 发音服务 - 基于CMU发音字典获取单词音标

import { dictionary } from 'cmu-pronouncing-dictionary';
import { CONTRACTION_MAP } from '../utils/contractionMap.js';

/**
 * 尝试将复合词拆分成多个部分并获取音标
 * @param {string} word - 要拆分的单词
 * @param {number} maxDepth - 最大递归深度，防止无限递归
 * @returns {string|null} 合并后的音标，未找到则返回null
 */
const trySplitCompoundWord = (word, maxDepth = 3) => {
  if (maxDepth <= 0) return null;
  
  const lowerWord = word.toLowerCase();
  const minWordLength = 2; // 最小单词长度
  const maxLength = lowerWord.length;
  
  // 如果单词太短，无法拆分
  if (maxLength < minWordLength * 2) {
    return null;
  }
  
  // 从右往左尝试拆分（优先尝试较长的第二部分）
  for (let i = maxLength - minWordLength; i >= minWordLength; i--) {
    const part1 = lowerWord.substring(0, i);
    const part2 = lowerWord.substring(i);
    
    const phonetic1 = dictionary[part1];
    const phonetic2 = dictionary[part2];
    
    if (phonetic1 && phonetic2) {
      // 找到两部分都有音标，合并它们
      return `${phonetic1} ${phonetic2}`;
    }
    
    // 如果第二部分有音标，继续尝试拆分第一部分
    if (phonetic2 && part1.length >= minWordLength * 2) {
      const nestedResult = trySplitCompoundWord(part1, maxDepth - 1);
      if (nestedResult) {
        return `${nestedResult} ${phonetic2}`;
      }
    }
    
    // 如果第一部分有音标，继续尝试拆分第二部分
    if (phonetic1 && part2.length >= minWordLength * 2) {
      const nestedResult = trySplitCompoundWord(part2, maxDepth - 1);
      if (nestedResult) {
        return `${phonetic1} ${nestedResult}`;
      }
    }
  }
  
  return null;
};

/**
 * 获取单个单词的音标
 * @param {string} word - 要获取音标的单词
 * @returns {string|null} 单词的音标，未找到则返回null
 */
export const getPhonetic = (word) => {
  // 转换为小写，CMU字典中的单词都是小写的
  const lowerWord = word.toLowerCase();
  
  // 从CMU字典中获取音标
  const phonetic = dictionary[lowerWord];
  
  if (phonetic) {
    return phonetic;
  }
  
  // 检查是否是常见缩略词
  if (CONTRACTION_MAP[lowerWord]) {
    const expandedForm = contractionMap[lowerWord];
    const words = expandedForm.split(' ');
    
    // 获取展开形式中每个单词的音标
    const phonetics = words.map(w => dictionary[w]).filter(p => p);
    
    if (phonetics.length > 0) {
      // 合并所有单词的音标
      return phonetics.join(' ');
    }
  }
  
  // 尝试拆分缩略词（如 "i'm" -> "i" + "m"）
  if (lowerWord.includes("'")) {
    const parts = lowerWord.split("'");
    const phonetics = parts.map(part => part && dictionary[part]).filter(p => p);
    if (phonetics.length > 0) {
      return phonetics.join(' ');
    }
  }
  
  // 尝试拆分复合词（如 "openworld" -> "open" + "world"）
  // 只对长度较长的单词尝试拆分，避免小单词的误拆分
  if (lowerWord.length >= 6) {
    const compoundResult = trySplitCompoundWord(lowerWord);
    if (compoundResult) {
      return compoundResult;
    }
  }
  
  return null;
};

/**
 * 将ARPAbet音标转换为更易读的形式
 * @param {string} arpabet - ARPAbet格式的音标
 * @returns {string} 美化后的音标
 */
export const formatPhonetic = (arpabet) => {
  if (!arpabet) return '';
  
  // 简单替换一些常见的ARPAbet符号，使其更易读
  // 注意：这是一个简化的实现，完整的转换需要更复杂的映射
  return arpabet
    .replace(/\d/g, '') // 移除重音标记
    .replace(/AA/g, 'ɑ')
    .replace(/AE/g, 'æ')
    .replace(/AH/g, 'ʌ')
    .replace(/AO/g, 'ɔ')
    .replace(/AW/g, 'aʊ')
    .replace(/AY/g, 'aɪ')
    .replace(/EH/g, 'ɛ')
    .replace(/ER/g, 'ɜr')
    .replace(/EY/g, 'eɪ')
    .replace(/IH/g, 'ɪ')
    .replace(/IY/g, 'i')
    .replace(/OW/g, 'oʊ')
    .replace(/OY/g, 'ɔɪ')
    .replace(/UH/g, 'ʊ')
    .replace(/UW/g, 'u')
    .replace(/B/g, 'b')
    .replace(/CH/g, 'tʃ')
    .replace(/D/g, 'd')
    .replace(/DH/g, 'ð')
    .replace(/F/g, 'f')
    .replace(/G/g, 'ɡ')
    .replace(/HH/g, 'h')
    .replace(/JH/g, 'dʒ')
    .replace(/K/g, 'k')
    .replace(/L/g, 'l')
    .replace(/M/g, 'm')
    .replace(/N/g, 'n')
    .replace(/NG/g, 'ŋ')
    .replace(/P/g, 'p')
    .replace(/R/g, 'r')
    .replace(/S/g, 's')
    .replace(/SH/g, 'ʃ')
    .replace(/T/g, 't')
    .replace(/TH/g, 'θ')
    .replace(/V/g, 'v')
    .replace(/W/g, 'w')
    .replace(/Y/g, 'j')
    .replace(/Z/g, 'z')
    .replace(/ZH/g, 'ʒ');
};

/**
 * 解析句子，获取每个单词的音标
 * @param {string} sentence - 要解析的句子
 * @returns {Array} 包含单词和音标的对象数组
 */
/**
 * 检测并转换句子中的缩写形式
 * @param {string} sentence - 要检测的句子
 * @returns {Array} 包含原始单词和转换后单词的对象数组
 */
export const detectAndExpandContractions = (sentence) => {
  // 移除句子中的标点符号，保留缩略词中的单引号
  const words = sentence
    .replace(/[.,!?;:"()\[\]{}_-]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  // 检查并转换每个单词
  const result = [];
  for (const word of words) {
    const lowerWord = word.toLowerCase();
    if (CONTRACTION_MAP[lowerWord]) {
      // 缩写形式，转换为完整形式并拆分为多个单词
      const expandedWords = CONTRACTION_MAP[lowerWord].split(' ');
      expandedWords.forEach(expandedWord => {
        result.push({
          original: word,
          expanded: expandedWord,
          isContraction: true
        });
      });
    } else {
      // 非缩写形式，保持原样
      result.push({
        original: word,
        expanded: word,
        isContraction: false
      });
    }
  }
  
  return result;
};

/**
 * 解析句子，获取每个单词的音标
 * @param {string} sentence - 要解析的句子
 * @returns {Array} 包含单词和音标的对象数组
 */
export const parseSentenceForPhonetics = (sentence) => {
  // 检测并转换缩写形式
  const wordsWithContractions = detectAndExpandContractions(sentence);
  
  // 为每个单词获取音标
  return wordsWithContractions.map(wordData => {
    const phonetic = getPhonetic(wordData.expanded);
    return {
      word: wordData.expanded, // 使用转换后的完整形式
      original: wordData.original, // 保留原始单词
      phonetic: phonetic ? formatPhonetic(phonetic) : null,
      isContraction: wordData.isContraction
    };
  });
};