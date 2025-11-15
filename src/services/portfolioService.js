import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const portfolioService = {
  // Get user portfolio
  getPortfolio: async () => {
    const response = await api.get(API_ENDPOINTS.PORTFOLIO);
    return response.data;
  },

  // Get equity data
  getEquityData: async () => {
    // Add your equity API endpoint here
    const response = await api.get('/api/equity');
    return response.data;
  },

  // Get fixed income data
  getFixedIncomeData: async () => {
    // Add your fixed income API endpoint here
    const response = await api.get('/api/fixed-income');
    return response.data;
  },

  // Get cash data
  getCashData: async () => {
    // Add your cash API endpoint here
    const response = await api.get('/api/cash');
    return response.data;
  },

  // Get mutual funds data
  getMutualFundsData: async () => {
    // Add your mutual funds API endpoint here
    const response = await api.get('/api/mutual-funds');
    return response.data;
  },
};
