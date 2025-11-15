// Application Configuration
export const config = {
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'https://optimizalphabackend.onrender.com/api',
    timeout: 10000,
  },

  // Application Settings
  app: {
    name: 'OptimizeAlpha Dashboard',
    version: '1.0.0',
    defaultTheme: 'dark',
    defaultCurrency: 'INR',
  },

  // Currency Conversion Rate
  currencyRates: {
    USD: 1,
    INR: 83,
    EUR: 0.92,
  },
};
