/**
 * 句子ID生成工具
 *
 * 统一ID格式: {数据源}-{课程ID}-{句子索引}
 *
 * 例如:
 * - nce2-L001-000    (新概念2，第1课，第0句)
 * - nce3-L001-000    (新概念3，第1课，第0句)
 *
 * 规则:
 * - 数据源: 小写字母，如 nce2, nce3
 * - 课程ID: L + 3位数字，如 L001, L002
 * - 句子索引: 3位数字，如 000, 001
 */

/**
 * 生成句子ID
 * @param {string} source - 数据源 (如 'nce2', 'nce3')
 * @param {string|number} lessonId - 课程ID (如 '001', 'L001', 1, '2-001')
 * @param {number} sentenceIndex - 句子在课程中的索引 (从0开始)
 * @returns {string} 统一格式的句子ID
 */
export function generateSentenceId(source, lessonId, sentenceIndex) {
  // 标准化数据源
  const normalizedSource = source.toLowerCase().trim();

  // 标准化课程ID
  let normalizedLessonId;
  if (typeof lessonId === 'number') {
    normalizedLessonId = `L${String(lessonId).padStart(3, '0')}`;
  } else if (typeof lessonId === 'string') {
    // 如果已经是 L001 格式，直接使用
    if (lessonId.match(/^L\d{3}$/)) {
      normalizedLessonId = lessonId;
    } else if (lessonId.match(/^\d+-\d+$/)) {
      // 处理 "2-001" 格式，提取最后的数字部分
      const parts = lessonId.split('-');
      const num = parseInt(parts[parts.length - 1], 10) || 1;
      normalizedLessonId = `L${String(num).padStart(3, '0')}`;
    } else {
      // 提取数字部分
      const num = parseInt(lessonId.replace(/\D/g, ''), 10) || 1;
      normalizedLessonId = `L${String(num).padStart(3, '0')}`;
    }
  } else {
    normalizedLessonId = 'L001';
  }

  // 标准化句子索引
  const normalizedIndex = String(sentenceIndex).padStart(3, '0');

  return `${normalizedSource}-${normalizedLessonId}-${normalizedIndex}`;
}

/**
 * 解析句子ID
 * @param {string} sentenceId - 句子ID
 * @returns {Object|null} 解析结果 { source, lessonId, sentenceIndex }
 */
export function parseSentenceId(sentenceId) {
  if (!sentenceId || typeof sentenceId !== 'string') {
    return null;
  }

  const parts = sentenceId.split('-');
  if (parts.length < 2) {
    return null;
  }

  const source = parts[0];

  // 标准格式: nce2-L001-000
  if (parts.length === 3) {
    return {
      source,
      lessonId: parts[1],
      sentenceIndex: parseInt(parts[2], 10)
    };
  }

  return null;
}

/**
 * 验证句子ID格式是否正确
 * @param {string} sentenceId - 句子ID
 * @returns {boolean} 是否有效
 */
export function isValidSentenceId(sentenceId) {
  if (!sentenceId || typeof sentenceId !== 'string') {
    return false;
  }

  // 标准格式: {source}-L\d{3}-\d{3}
  if (sentenceId.match(/^[a-z]+-L\d{3}-\d{3}$/)) {
    return true;
  }

  return false;
}

/**
 * 获取数据源前缀
 * @param {string} sentenceId - 句子ID
 * @returns {string|null} 数据源前缀
 */
export function getSourceFromId(sentenceId) {
  const parsed = parseSentenceId(sentenceId);
  return parsed ? parsed.source : null;
}

/**
 * 生成音频文件名
 * @param {string} sentenceId - 句子ID
 * @returns {string} 音频文件名 (如 "nce2-L001-000.opus")
 */
export function getAudioFileName(sentenceId) {
  return `${sentenceId}.opus`;
}

/**
 * 生成音频URL
 * @param {string} sentenceId - 句子ID
 * @param {string} baseUrl - Supabase基础URL
 * @param {string} bucket - 存储桶名称
 * @returns {string} 完整音频URL
 */
export function getAudioUrl(sentenceId, baseUrl, bucket = 'sentence-audios') {
  const fileName = getAudioFileName(sentenceId);
  return `${baseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
}
