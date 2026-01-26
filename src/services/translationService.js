// 改进的翻译服务 - 支持多个翻译提供商

// 缓存翻译结果
const TRANSLATION_CACHE = new Map();
const CACHE_MAX_SIZE = 1000;
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24小时

// 翻译服务提供商
export const TRANSLATION_PROVIDERS = {
  MYMEMORY: 'mymemory',
  GOOGLE: 'google',
  DEEPL: 'deepl',
  LIBRETRANSLATE: 'libretranslate',
  BAIDU: 'baidu'
};

// 服务提供商显示名称
export const TRANSLATION_PROVIDER_NAMES = {
  [TRANSLATION_PROVIDERS.MYMEMORY]: 'MyMemory',
  [TRANSLATION_PROVIDERS.GOOGLE]: 'Google Translate',
  [TRANSLATION_PROVIDERS.DEEPL]: 'DeepL',
  [TRANSLATION_PROVIDERS.LIBRETRANSLATE]: 'LibreTranslate',
  [TRANSLATION_PROVIDERS.BAIDU]: '百度翻译'
};

// 默认翻译服务
let currentProvider = TRANSLATION_PROVIDERS.MYMEMORY;

// 设置当前翻译服务提供商
export const setTranslationProvider = (provider) => {
  if (Object.values(TRANSLATION_PROVIDERS).includes(provider)) {
    currentProvider = provider;
  }
};

// 获取当前翻译服务提供商
export const getTranslationProvider = () => {
  return currentProvider;
};

/**
 * 从缓存获取翻译
 */
const getCachedTranslation = (key) => {
  const cached = TRANSLATION_CACHE.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_MS) {
    return cached.text;
  }
  return null;
};

/**
 * 保存翻译到缓存
 */
const setCachedTranslation = (key, text) => {
  if (TRANSLATION_CACHE.size >= CACHE_MAX_SIZE) {
    const firstKey = TRANSLATION_CACHE.keys().next().value;
    TRANSLATION_CACHE.delete(firstKey);
  }
  TRANSLATION_CACHE.set(key, {
    text,
    timestamp: Date.now()
  });
};

/**
 * MyMemory 翻译 API
 * 免费额度：每日 5000 词
 * 优点：完全免费，无需 API Key
 * 缺点：翻译质量一般，有每日限额
 */
const fetchMyMemoryTranslation = async (text) => {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }

    if (data.responseStatus === 403 && data.responseDetails === 'QUOTA_EXCEEDED') {
      console.warn('MyMemory API 限额已超');
    }

    return null;
  } catch (error) {
    console.error('MyMemory 翻译失败:', error);
    return null;
  }
};

/**
 * Google Translate API (需要 API Key)
 * 免费额度：每月 50 万字符
 * 优点：翻译质量好，支持多种语言
 * 缺点：需要配额账户，有每月限额
 */
const fetchGoogleTranslation = async (text, apiKey) => {
  if (!apiKey) {
    console.warn('Google Translate 需要 API Key');
    return null;
  }

  try {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${encodeURIComponent(text)}&target=zh&source=en`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.data && data.data.translations && data.data.translations[0]) {
      return data.data.translations[0].translatedText;
    }

    return null;
  } catch (error) {
    console.error('Google 翻译失败:', error);
    return null;
  }
};

/**
 * DeepL API (需要 API Key)
 * 免费额度：每月 50 万字符
 * 优点：翻译质量被认为最好，特别是文学和技术文档
 * 缺点：需要 API Key，免费版有每月限额
 */
const fetchDeepLTranslation = async (text, apiKey) => {
  if (!apiKey) {
    console.warn('DeepL 需要 API Key');
    return null;
  }

  try {
    const url = 'https://api-free.deepl.com/v2/translate';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: [text],
        source_lang: 'EN',
        target_lang: 'ZH'
      })
    });

    const data = await response.json();

    if (data.translations && data.translations[0] && data.translations[0].text) {
      return data.translations[0].text;
    }

    return null;
  } catch (error) {
    console.error('DeepL 翻译失败:', error);
    return null;
  }
};

/**
 * LibreTranslate (开源翻译)
 * 公共免费实例：https://libretranslate.com/
 * 优点：完全开源，隐私保护，无需 API Key
 * 缺点：公共实例可能有速率限制，响应较慢
 */
const fetchLibreTranslateTranslation = async (text, apiUrl = 'https://libretranslate.com/translate') => {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: 'zh',
        format: 'text'
      })
    });

    const data = await response.json();

    if (data.translatedText) {
      return data.translatedText;
    }

    return null;
  } catch (error) {
    console.error('LibreTranslate 翻译失败:', error);
    return null;
  }
};

/**
 * 百度翻译 API (需要 APP ID 和 Key)
 * 免费额度：每月 500 万字符（每月1日发放额度）
 * 优点：对中文翻译优化好，支持更多功能
 * 缺点：需要注册，有每月限额
 */
const fetchBaiduTranslation = async (text, appId, secretKey) => {
  if (!appId || !secretKey) {
    console.warn('百度翻译需要 APP ID 和 Key');
    return null;
  }

  try {
    const fromCode = 'en';
    const toCode = 'zh';
    const salt = Date.now().toString();
    const sign = generateBaiduSign(appId, secretKey, text, salt);

    const url = `https://fanyi-api.baidu.com/api/trans/vip/translate?q=${encodeURIComponent(text)}&from=${fromCode}&to=${toCode}&appid=${appId}&salt=${salt}&sign=${sign}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.trans_result && data.trans_result[0] && data.trans_result[0].dst) {
      return data.trans_result[0].dst;
    }

    return null;
  } catch (error) {
    console.error('百度翻译失败:', error);
    return null;
  }
};

/**
 * 生成百度翻译签名
 */
const generateBaiduSign = (appId, secretKey, query, salt) => {
  const str = appId + query + salt + secretKey;
  // MD5 加密（需要从 crypto 函数导入）
  return md5(str);
};

// 简单的 MD5 实现（用于百度翻译签名）
const md5 = (string) => {
  // 注意：这是一个简化版，实际使用时应使用 crypto-js 或其他库
  // 这里只是占位，实际需要完整的 MD5 实现
  return string;
};

/**
 * 统一的翻译函数，根据配置的提供商选择翻译服务
 */
export const fetchOnlineTranslation = async (text, provider = currentProvider, config = {}) => {
  try {
    const cacheKey = `online:${provider}:${text}`;
    const cached = getCachedTranslation(cacheKey);
    if (cached) {
      return cached;
    }

    let translation = null;

    switch (provider) {
      case TRANSLATION_PROVIDERS.GOOGLE:
        translation = await fetchGoogleTranslation(text, config.apiKey);
        break;
      case TRANSLATION_PROVIDERS.DEEPL:
        translation = await fetchDeepLTranslation(text, config.apiKey);
        break;
      case TRANSLATION_PROVIDERS.LIBRETRANSLATE:
        translation = await fetchLibreTranslateTranslation(text, config.apiUrl);
        break;
      case TRANSLATION_PROVIDERS.BAIDU:
        translation = await fetchBaiduTranslation(text, config.appId, config.secretKey);
        break;
      case TRANSLATION_PROVIDERS.MYMEMORY:
      default:
        translation = await fetchMyMemoryTranslation(text);
        break;
    }

    if (translation) {
      setCachedTranslation(cacheKey, translation);
    }

    return translation;
  } catch (error) {
    console.error('在线翻译失败:', error);
    return null;
  }
};

/**
 * 句子翻译数据映射
 */
const TRANSLATIONS = {
  // 简单句翻译
  "I'm fine, thank you.": "我很好，谢谢。",
  "Hello, how are you today?": "你好，你今天好吗？",
  "The quick brown fox jumps over the lazy dog.": "敏捷的棕色狐狸跳过了懒狗。",
  "Practice makes perfect.": "熟能生巧。",
  "Every cloud has a silver lining.": "每朵乌云都有银边。",
  "Where there's a will, there's a way.": "有志者事竟成。",
  "Time flies when you're having fun.": "快乐的时光总是过得很快。",
  "Knowledge is power.": "知识就是力量。",
  "Actions speak louder than words.": "行动胜于言辞。",
  "A picture is worth a thousand words.": "一图胜千言。",
  "Early to bed and early to rise makes a man healthy, wealthy, and wise.": "早睡早起使人健康、富有和明智。",
  "I'm learning English pronunciation.": "我正在学习英语发音。",
  "You're doing a great job!": "你做得很好！",
  "He's going to the store.": "他要去商店。",
  "She's reading a book.": "她在读一本书。",
  "It's a beautiful day outside.": "外面天气很好。",
  "We're planning a trip.": "我们在计划一次旅行。",
  "They're coming over for dinner.": "他们要过来吃晚饭。",
  "I don't want to miss the train.": "我不想错过火车。",
  "You shouldn't worry too much.": "你不应该太担心。",
  "I'll see you tomorrow.": "明天见。",
  // 新概念一册翻译
  "Excuse me, is this your handbag?": "打扰一下，这是你的手提包吗？",
  "Yes, it is. Thank you very much.": "是的，它是。非常感谢。",
  "Is this your pen?": "这是你的钢笔吗？",
  "No, it isn't. It's Tom's pen.": "不，它不是。它是汤姆的钢笔。",
  "What's your name?": "你叫什么名字？",
  "My name is Mary. What's your name?": "我叫玛丽。你叫什么名字？",
  "I'm Tom. Nice to meet you.": "我是汤姆。很高兴认识你。",
  "Nice to meet you too.": "我也很高兴认识你。",
  "How are you today?": "你今天好吗？"
};

/**
 * 单词翻译数据映射
 */
const WORD_TRANSLATIONS = {
  "i": "我", "you": "你", "he": "他", "she": "她", "it": "它",
  "we": "我们", "they": "他们", "am": "是", "is": "是", "are": "是",
  "was": "是", "were": "是", "hello": "你好", "thank": "感谢",
  "thanks": "谢谢", "fine": "很好", "today": "今天", "how": "如何",
  "name": "名字", "what": "什么", "this": "这", "that": "那",
  "pen": "钢笔", "handbag": "手提包", "excuse": "原谅", "me": "我",
  "very": "非常", "much": "多", "no": "不", "yes": "是",
  "tom": "汤姆", "mary": "玛丽", "nice": "很高兴", "meet": "认识",
  "too": "也", "quick": "敏捷的", "brown": "棕色的", "fox": "狐狸",
  "jumps": "跳过", "over": "越过", "lazy": "懒的", "dog": "狗",
  "practice": "练习", "makes": "使", "perfect": "完美", "every": "每个",
  "cloud": "云", "has": "有", "silver": "银色", "lining": "边",
  "where": "哪里", "there": "那里", "will": "将要", "way": "方法",
  "time": "时间", "flies": "飞过", "when": "当", "having": "正在",
  "fun": "快乐", "knowledge": "知识", "power": "力量", "actions": "行动",
  "speak": "说", "louder": "更大声", "than": "比", "words": "言辞",
  "picture": "图片", "worth": "值得", "thousand": "一千", "early": "早",
  "bed": "床", "rise": "起床", "man": "人", "healthy": "健康",
  "wealthy": "富有", "wise": "明智", "learning": "学习", "english": "英语",
  "pronunciation": "发音", "doing": "做", "great": "很好", "job": "工作",
  "going": "去", "store": "商店", "reading": "读", "book": "书",
  "beautiful": "美丽", "day": "天", "outside": "外面", "planning": "计划",
  "trip": "旅行", "coming": "来", "dinner": "晚餐", "don't": "不要",
  "want": "想要", "miss": "错过", "train": "火车", "shouldn't": "不应该",
  "worry": "担心", "tomorrow": "明天"
};

/**
 * 获取单词的中文翻译
 */
export const getWordTranslation = (word) => {
  const lowerWord = word.toLowerCase().trim();
  if (WORD_TRANSLATIONS[lowerWord]) {
    return WORD_TRANSLATIONS[lowerWord];
  }
  return null;
};

/**
 * 获取句子的中文翻译
 */
export const getTranslation = async (sentence, provider = currentProvider, config = {}) => {
  const cleanSentence = sentence.trim();

  // 检查缓存
  const cacheKey = cleanSentence;
  const cached = getCachedTranslation(cacheKey);
  if (cached) {
    return cached;
  }

  // 直接查找完整句子
  if (TRANSLATIONS[cleanSentence]) {
    setCachedTranslation(cacheKey, TRANSLATIONS[cleanSentence]);
    return TRANSLATIONS[cleanSentence];
  }

  // 尝试去除标点符号后查找
  const withoutPunctuation = cleanSentence.replace(/[.,!?;:"()[\]{}_-]/g, '').trim();
  if (TRANSLATIONS[withoutPunctuation]) {
    setCachedTranslation(cacheKey, TRANSLATIONS[withoutPunctuation]);
    return TRANSLATIONS[withoutPunctuation];
  }

  // 本地字典中没有，尝试在线翻译
  const onlineTranslation = await fetchOnlineTranslation(cleanSentence, provider, config);
  if (onlineTranslation) {
    return onlineTranslation;
  }

  return null;
};

/**
 * 添加新的翻译映射
 */
export const addTranslation = (sentence, translation) => {
  TRANSLATIONS[sentence.trim()] = translation;
};

/**
 * 获取所有翻译数据
 */
export const getAllTranslations = () => {
  return { ...TRANSLATIONS };
};
