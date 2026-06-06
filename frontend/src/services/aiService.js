import api from './api';

export const generateTaskDetails = async (title) => {
  const token = localStorage.getItem('token');
  const isMock = token && token.startsWith('mock-jwt-token-for-');

  if (isMock) {
    return {
      description: `[Mock AI] Generated description for: "${title}". Make sure to focus on completing this task efficiently!`
    };
  }

  try {
    const response = await api.post('/ai/generate', { title });
    return response.data;
  } catch (error) {
    if (!error.response) {
      console.warn("Backend unreachable. Falling back to mock AI generation.");
      return {
        description: `[Mock AI] Generated description for: "${title}". Make sure to focus on completing this task efficiently!`
      };
    }
    throw error;
  }
};
