const axios = require('axios');

const CATEGORY_DEFINITIONS = {
  expense: [
    {
      category: 'Food & Dining',
      keywords: [
        'restaurant',
        'dinner',
        'lunch',
        'coffee',
        'grocer',
        'meal',
        'snack',
        'cafe',
        'takeout',
      ],
    },
    {
      category: 'Groceries',
      keywords: ['grocery', 'supermarket', 'vegetable', 'fruit', 'market', 'provision', 'wholesale'],
    },
    {
      category: 'Health & Fitness',
      keywords: ['gym', 'protein', 'supplement', 'yoga', 'trainer', 'fitness', 'vitamin', 'medical', 'doctor'],
    },
    {
      category: 'Education',
      keywords: ['tuition', 'course', 'class', 'book', 'study', 'exam', 'subscription', 'coaching', 'school'],
    },
    {
      category: 'Transportation',
      keywords: ['uber', 'lyft', 'fuel', 'bus', 'train', 'ticket', 'parking', 'taxi', 'ride', 'cab', 'flight'],
    },
    {
      category: 'Entertainment',
      keywords: ['movie', 'game', 'concert', 'music', 'netflix', 'spotify', 'event', 'cinema', 'show', 'festival'],
    },
    {
      category: 'Utilities',
      keywords: ['electric', 'water', 'internet', 'phone', 'bill', 'utility', 'gas', 'power', 'electricity', 'recharge'],
    },
    {
      category: 'Shopping',
      keywords: ['clothing', 'electronics', 'amazon', 'mall', 'store', 'shopping', 'apparel', 'fashion', 'purchase'],
    },
    {
      category: 'Savings',
      keywords: ['savings', 'deposit', 'investment', 'stock', 'mutual', 'fund', 'sip', 'fd', 'rd'],
    },
    {
      category: 'Housing',
      keywords: ['rent', 'mortgage', 'lease', 'apartment', 'home', 'maintenance', 'repairs'],
    },
    {
      category: 'Travel',
      keywords: ['hotel', 'tour', 'trip', 'vacation', 'airbnb', 'booking', 'visa'],
    },
    {
      category: 'Insurance',
      keywords: ['premium', 'insurance', 'coverage', 'policy', 'life', 'health insurance'],
    },
    {
      category: 'Subscriptions',
      keywords: ['subscription', 'membership', 'saas', 'plan', 'renewal', 'license'],
    },
    {
      category: 'Gifts & Donations',
      keywords: ['gift', 'donation', 'charity', 'offering', 'contribution'],
    },
  ],
  income: [
    {
      category: 'Salary',
      keywords: ['salary', 'paycheck', 'wage', 'payroll', 'monthly income', 'stipend'],
    },
    {
      category: 'Freelance & Side Hustles',
      keywords: ['freelance', 'contract', 'gig', 'side hustle', 'client payment', 'invoice', 'upwork', 'fiverr'],
    },
    {
      category: 'Investments',
      keywords: ['dividend', 'stock', 'interest', 'capital gain', 'mutual fund', 'trading', 'crypto'],
    },
    {
      category: 'Rental Income',
      keywords: ['rent received', 'tenant', 'lease payment', 'airbnb income'],
    },
    {
      category: 'Business & Sales',
      keywords: ['sale', 'revenue', 'business income', 'order payment', 'store income', 'customer payment'],
    },
    {
      category: 'Gifts & Refunds',
      keywords: ['gift', 'refund', 'rebate', 'cashback', 'reimbursement'],
    },
    {
      category: 'Other Income',
      keywords: ['lottery', 'bonus', 'award', 'scholarship', 'royalty', 'pension'],
    },
  ],
};

const defaultCategory = 'General';
const MIN_REMOTE_CONFIDENCE = 0.45;

const resolveType = (type) => (CATEGORY_DEFINITIONS[type] ? type : 'expense');
const candidateLabels = (type) => CATEGORY_DEFINITIONS[type].map((item) => item.category);

const localCategorize = (description = '', type) => {
  const text = description.toLowerCase();
  const categories = CATEGORY_DEFINITIONS[type] || CATEGORY_DEFINITIONS.expense;

  for (const entry of categories) {
    if (entry.keywords.some((keyword) => text.includes(keyword))) {
      return {
        category: entry.category,
        confidence: 0.7,
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

const remoteCategorize = async (description, type) => {
  const apiKey = process.env.HF_API_KEY;
  const model = process.env.HF_MODEL || 'facebook/bart-large-mnli';

  if (!apiKey) {
    return null;
  }

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        inputs: `Transaction type: ${type}\nDescription: ${description}`,
        parameters: {
          candidate_labels: candidateLabels(type),
          multi_class: false,
          hypothesis_template: 'The transaction is related to {}.',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 5000,
      }
    );

    const data = response.data;
    const predictions = Array.isArray(data)
      ? data
      : Array.isArray(data?.labels)
        ? data.labels.map((label, index) => ({
            label,
            score: data.scores?.[index] ?? 0,
          }))
        : [];

    const [best] = predictions;
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

exports.predictCategory = async (description, type = 'expense') => {
  const resolvedType = resolveType(type);

  if (!description) {
    return {
      category: defaultCategory,
      confidence: 0.1,
      source: 'local-default',
    };
  }

  const [remoteResult, localResult] = await Promise.all([
    remoteCategorize(description, resolvedType),
    Promise.resolve(localCategorize(description, resolvedType)),
  ]);

  if (remoteResult && remoteResult.confidence >= MIN_REMOTE_CONFIDENCE) {
    return remoteResult;
  }

  if (remoteResult && localResult.category !== defaultCategory) {
    return {
      category: localResult.category,
      confidence: Math.max(localResult.confidence, remoteResult.confidence * 0.85),
      source: 'hybrid-local',
    };
  }

  if (remoteResult) {
    return { ...remoteResult, confidence: remoteResult.confidence * 0.8, source: 'hugging-face-low-confidence' };
  }

  return localResult;
};
