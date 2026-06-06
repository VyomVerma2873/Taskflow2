import api from './api';

const isMockMode = () => {
  const token = localStorage.getItem('token');
  return token && token.startsWith('mock-jwt-token-for-');
};

const getLocalTasks = () => {
  const tasks = localStorage.getItem('mock_tasks');
  return tasks ? JSON.parse(tasks) : [
    {
      id: 1,
      title: "Design premium landing page",
      description: "Review UI layout, typography, and responsive glassmorphic cards.",
      priority: "HIGH",
      status: "IN_PROGRESS",
      dueDate: "2026-06-10",
      estimatedTime: 120,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: "Verify task flow on mobile",
      description: "Ensure dummy authentication and offline tasks function perfectly.",
      priority: "HIGH",
      status: "TODO",
      dueDate: "2026-06-06",
      estimatedTime: 30,
      createdAt: new Date().toISOString()
    }
  ];
};

const saveLocalTasks = (tasks) => {
  localStorage.setItem('mock_tasks', JSON.stringify(tasks));
};

export const getAllTasks = async () => {
  if (isMockMode()) {
    return getLocalTasks();
  }
  try {
    const response = await api.get('/tasks');
    return response.data;
  } catch (error) {
    if (!error.response) {
      console.warn("Backend unreachable. Falling back to local tasks.");
      return getLocalTasks();
    }
    throw error;
  }
};

export const getTask = async (id) => {
  if (isMockMode()) {
    const tasks = getLocalTasks();
    return tasks.find(t => t.id === Number(id)) || null;
  }
  try {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    if (!error.response) {
      const tasks = getLocalTasks();
      return tasks.find(t => t.id === Number(id)) || null;
    }
    throw error;
  }
};

export const createTask = async (taskData) => {
  if (isMockMode()) {
    const tasks = getLocalTasks();
    const newTask = {
      ...taskData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    saveLocalTasks(tasks);
    return newTask;
  }
  try {
    const response = await api.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    if (!error.response) {
      const tasks = getLocalTasks();
      const newTask = {
        ...taskData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      tasks.push(newTask);
      saveLocalTasks(tasks);
      return newTask;
    }
    throw error;
  }
};

export const updateTask = async (id, taskData) => {
  if (isMockMode()) {
    const tasks = getLocalTasks();
    const index = tasks.findIndex(t => t.id === Number(id));
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...taskData };
      saveLocalTasks(tasks);
      return tasks[index];
    }
    return null;
  }
  try {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    if (!error.response) {
      const tasks = getLocalTasks();
      const index = tasks.findIndex(t => t.id === Number(id));
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...taskData };
        saveLocalTasks(tasks);
        return tasks[index];
      }
      return null;
    }
    throw error;
  }
};

export const deleteTask = async (id) => {
  if (isMockMode()) {
    let tasks = getLocalTasks();
    tasks = tasks.filter(t => t.id !== Number(id));
    saveLocalTasks(tasks);
    return { message: "Task deleted successfully" };
  }
  try {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    if (!error.response) {
      let tasks = getLocalTasks();
      tasks = tasks.filter(t => t.id !== Number(id));
      saveLocalTasks(tasks);
      return { message: "Task deleted successfully" };
    }
    throw error;
  }
};
