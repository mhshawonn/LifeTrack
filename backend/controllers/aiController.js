const asyncHandler = require('express-async-handler');
const { predictCategory } = require('../utils/aiCategorizer');

exports.categorizeExpense = asyncHandler(async (req, res) => {
  const { description, type = 'expense' } = req.body;

  if (!description) {
    res.status(400);
    throw new Error('Description is required');
  }

  const prediction = await predictCategory(description, type);
  res.json(prediction);
});
