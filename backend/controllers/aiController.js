const asyncHandler = require('express-async-handler');
const { predictCategory } = require('../utils/aiCategorizer');

exports.categorizeExpense = asyncHandler(async (req, res) => {
  const { description } = req.body;

  if (!description) {
    res.status(400);
    throw new Error('Description is required');
  }

  const prediction = await predictCategory(description);
  res.json(prediction);
});
