/**
 * 句子验证器 - 用于整行输入模式的智能分词验证
 */
export class SentenceValidator {
  constructor(targetSentence) {
    this.targetWords = targetSentence.trim().split(/\s+/);
    this.currentIndex = 0;
  }

  /**
   * 验证用户输入
   * @param {string} userInput - 用户输入的完整句子
   * @returns {ValidationResult} 验证结果
   */
  validate(userInput) {
    const inputWords = userInput.trim().split(/\s+/).filter(w => w.length > 0);
    const results = [];
    let allCorrect = true;

    for (let i = 0; i < this.targetWords.length; i++) {
      const target = this.targetWords[i];
      const input = inputWords[i] || '';
      const isCorrect = this.normalize(input) === this.normalize(target);
      
      if (!isCorrect) allCorrect = false;
      
      results.push({
        index: i,
        target,
        input,
        isCorrect,
        isEmpty: !input,
        isCurrent: i === this.currentIndex
      });
    }

    // 检测多余的单词
    if (inputWords.length > this.targetWords.length) {
      for (let i = this.targetWords.length; i < inputWords.length; i++) {
        results.push({
          index: i,
          target: null,
          input: inputWords[i],
          isCorrect: false,
          isExtra: true,
          isCurrent: false
        });
      }
    }

    return {
      words: results,
      allCorrect,
      progress: results.filter(r => r.isCorrect).length / this.targetWords.length,
      isComplete: allCorrect && inputWords.length === this.targetWords.length,
      wordCount: this.targetWords.length,
      correctCount: results.filter(r => r.isCorrect).length
    };
  }

  /**
   * 标准化字符串（忽略大小写和标点）
   */
  normalize(str) {
    if (!str) return '';
    return str.toLowerCase().trim().replace(/[.,!?;:'"]/g, '');
  }

  /**
   * 获取当前应输入的单词提示
   */
  getCurrentHint() {
    return this.targetWords[this.currentIndex] || '';
  }

  /**
   * 获取目标单词列表
   */
  getTargetWords() {
    return [...this.targetWords];
  }

  /**
   * 移动到下一个单词
   */
  moveToNext() {
    if (this.currentIndex < this.targetWords.length - 1) {
      this.currentIndex++;
      return true;
    }
    return false;
  }

  /**
   * 移动到指定单词
   */
  moveTo(index) {
    if (index >= 0 && index < this.targetWords.length) {
      this.currentIndex = index;
    }
  }

  /**
   * 获取当前索引
   */
  getCurrentIndex() {
    return this.currentIndex;
  }
}

export default SentenceValidator;
