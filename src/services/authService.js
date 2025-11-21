import axios from 'axios';


export const authService = {
  // Login user
  login: async (email, password) => {
    const response = await axios.post('https://optimizalphabackend.onrender.com/api/loginuser', {
      email,
      password,
    }, {
      withCredentials: true,
    });
    return response;
  },

  // Register user
  register: async (userData) => {
    const response = await axios.post('https://optimizalphabackend.onrender.com/api/userregister', userData, {
      withCredentials: true,
    });
    return response;
  },

  // Google Login
  googleLogin: () => {
    window.location.href = 'https://optimizalphabackend.onrender.com/auth/google';
  },

  // Logout user
  logout: async () => {
    try {
      await axios.post('http://localhost:5500/api/logoutuser', {}, {
        withCredentials: true,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    window.location.href = '/';
  },

  // Check if user is logged in (cookie-based only)
  isAuthenticated: async () => {
    try {
      const response = await axios.get('https://optimizalphabackend.onrender.com/api/verifyuser', {
        withCredentials: true,
      });
      return response.data.Status === 'Success';
    } catch (error) {
      return false;
    }
  }
};
