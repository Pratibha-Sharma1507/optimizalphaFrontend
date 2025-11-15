// Currency formatter
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Number formatter
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

// Percentage formatter
export const formatPercentage = (num) => {
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
};

// Portfolio value formatter with currency conversion
export const formatPortfolioValue = (value, currency = 'INR') => {
  if (value === null || value === undefined) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;

  const conversionRate = 83;
  const converted = currency === 'INR' ? num * conversionRate : num;
  const symbol = currency === 'INR' ? '₹' : '$';
  
  return `${symbol}${converted.toLocaleString()}M`;
};
