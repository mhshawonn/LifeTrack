const DEFAULT_CURRENCY = 'USD';

// Static conversion table storing the value of 1 unit of the currency in USD.
// Rates are approximate and can be updated periodically.
const CURRENCY_TABLE = {
  USD: { label: 'US Dollar', symbol: '$', rateToUSD: 1 },
  EUR: { label: 'Euro', symbol: '€', rateToUSD: 1.08 },
  GBP: { label: 'British Pound', symbol: '£', rateToUSD: 1.27 },
  INR: { label: 'Indian Rupee', symbol: '₹', rateToUSD: 0.012 },
  BDT: { label: 'Bangladeshi Taka', symbol: '৳', rateToUSD: 0.0091 },
};

const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_TABLE);

const getCurrencyMeta = (code) => CURRENCY_TABLE[code] || CURRENCY_TABLE[DEFAULT_CURRENCY];

const isSupportedCurrency = (code) => SUPPORTED_CURRENCIES.includes(code);

const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (typeof amount !== 'number' || Number.isNaN(amount) || !Number.isFinite(amount)) {
    return 0;
  }

  const from = getCurrencyMeta(fromCurrency);
  const to = getCurrencyMeta(toCurrency);

  if (from === to) {
    return amount;
  }

  const usdValue = amount * from.rateToUSD;
  return usdValue / to.rateToUSD;
};

module.exports = {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  getCurrencyMeta,
  isSupportedCurrency,
  convertCurrency,
};
