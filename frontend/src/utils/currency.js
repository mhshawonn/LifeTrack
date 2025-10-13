export const DEFAULT_CURRENCY = 'USD';

export const CURRENCY_OPTIONS = [
  { code: 'USD', label: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'EUR', label: 'Euro', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', label: 'British Pound', symbol: '£', locale: 'en-GB' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  { code: 'BDT', label: 'Bangladeshi Taka', symbol: '৳', locale: 'bn-BD' },
];

export const getCurrencyOption = (code) =>
  CURRENCY_OPTIONS.find((option) => option.code === code) ||
  CURRENCY_OPTIONS.find((option) => option.code === DEFAULT_CURRENCY);

export const formatCurrency = (value = 0, code = DEFAULT_CURRENCY, options = {}) => {
  const currencyOption = getCurrencyOption(code);
  const formatter = new Intl.NumberFormat(currencyOption.locale, {
    style: 'currency',
    currency: currencyOption.code,
    maximumFractionDigits: 2,
    ...options,
  });
  return formatter.format(Number.isNaN(Number(value)) ? 0 : Number(value));
};
