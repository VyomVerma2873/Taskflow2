import api from './api';

export const generateTaskDetails = async (title) => {
  const token = localStorage.getItem('token');
  const isMock = token && token.startsWith('mock-jwt-token-for-');

  if (isMock) {
    return {
      description: `Task Description for "${title}":\n- Plan and prototype the user interface.\n- Build components and hook up local state.\n- Verify layout responsiveness across all screen sizes.`,
      suggestedPriority: 'HIGH',
      estimatedTime: '2 hours'
    };
  }

  try {
    const response = await api.post('/ai/generate', { title });
    return response.data;
  } catch (error) {
    if (!error.response) {
      console.warn("Backend unreachable. Falling back to mock AI generation.");
      return {
        description: `Task Description for "${title}":\n- Plan and prototype the user interface.\n- Build components and hook up local state.\n- Verify layout responsiveness across all screen sizes.`,
        suggestedPriority: 'HIGH',
        estimatedTime: '2 hours'
      };
    }
    throw error;
  }
};
