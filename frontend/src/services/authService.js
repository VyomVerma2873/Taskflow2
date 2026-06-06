import api from './api';

export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  } catch (error) {
    // If it's a network/connection error (no response), fallback to dummy local auth
    if (!error.response) {
      console.warn("Backend unreachable. Falling back to frontend mock authentication.");
      return {
        id: 999,
        username: username,
        email: `${username}@dummy.com`,
        token: "mock-jwt-token-for-" + username
      };
    }
    throw error;
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  } catch (error) {
    // If it's a network/connection error (no response), fallback to dummy local auth
    if (!error.response) {
      console.warn("Backend unreachable. Falling back to frontend mock registration.");
      return {
        id: 999,
        username: username,
        email: email || `${username}@dummy.com`,
        token: "mock-jwt-token-for-" + username
      };
    }
    throw error;
  }
};
