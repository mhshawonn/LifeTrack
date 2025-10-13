const axios = require('axios');

const keywordMap = [
  { category: 'Food & Dining', keywords: ['restaurant', 'dinner', 'lunch', 'coffee', 'grocer', 'meal', 'snack'] },
  { category: 'Health & Fitness', keywords: ['gym', 'protein', 'supplement', 'yoga', 'trainer', 'fitness', 'vitamin'] },
  { category: 'Education', keywords: ['tuition', 'course', 'class', 'book', 'study', 'exam', 'subscription'] },
  { category: 'Transportation', keywords: ['uber', 'lyft', 'fuel', 'bus', 'train', 'ticket', 'parking', 'taxi'] },
  { category: 'Entertainment', keywords: ['movie', 'game', 'concert', 'music', 'netflix', 'spotify', 'event'] },
  { category: 'Utilities', keywords: ['electric', 'water', 'internet', 'phone', 'bill', 'utility'] },
  { category: 'Shopping', keywords: ['clothing', 'electronics', 'amazon', 'mall', 'store', 'shopping'] },
  { category: 'Savings', keywords: ['savings', 'deposit', 'investment', 'stock', 'mutual', 'fund'] },
  { category: 'Housing', keywords: ['rent', 'mortgage', 'lease', 'apartment', 'home'] },
];

const defaultCategory = 'General';

const localCategorize = (description = '') => {
  const text = description.toLowerCase();

  for (const entry of keywordMap) {
    if (entry.keywords.some((keyword) => text.includes(keyword))) {
      return {
        category: entry.category,
        confidence: 0.6,
        source: 'local-keyword',
      };
    }
  }

  return {
    category: defaultCategory,
    confidence: 0.4,
    source: 'local-default',
  };
};

const remoteCategorize = async (description) => {
  const apiKey = process.env.HF_API_KEY;
  const model = process.env.HF_MODEL || 'facebook/bart-large-mnli';

  if (!apiKey) {
    return null;
  }

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        inputs: description,
        parameters: {
          candidate_labels: keywordMap.map((item) => item.category),
          multi_class: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 5000,
      }
    );

    const [best] = response.data;
    if (best) {
      return {
        category: best.label,
        confidence: best.score,
        source: 'hugging-face',
      };
    }
  } catch (error) {
    // Fail silently and fall back to local classifier
    console.warn('AI categorization fallback:', error.message);
  }

  return null;
};

exports.predictCategory = async (description) => {
  if (!description) {
    return {
      category: defaultCategory,
      confidence: 0.1,
      source: 'local-default',
    };
  }

  const remoteResult = await remoteCategorize(description);
  if (remoteResult) {
    return remoteResult;
  }

  return localCategorize(description);
};
