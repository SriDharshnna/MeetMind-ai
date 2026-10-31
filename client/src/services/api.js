// MeetMind AI Frontend REST API Client

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Generic Fetch Wrapper with JSON handling and detailed error extraction
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// Dashboard Endpoints
// -----------------------------------------------------------------------------
export const getDashboardStats = async () => {
  const res = await apiRequest('/dashboard/stats');
  return res.data;
};

// -----------------------------------------------------------------------------
// Meeting Endpoints
// -----------------------------------------------------------------------------
export const getMeetings = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/meetings?${query}` : '/meetings';
  const res = await apiRequest(endpoint);
  return res.data;
};

export const getMeetingById = async (id) => {
  const res = await apiRequest(`/meetings/${id}`);
  return res.data;
};

export const createMeeting = async (meetingData) => {
  const res = await apiRequest('/meetings', {
    method: 'POST',
    body: JSON.stringify(meetingData)
  });
  return res;
};

export const updateMeeting = async (id, updateData) => {
  const res = await apiRequest(`/meetings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });
  return res.data;
};

export const deleteMeeting = async (id) => {
  const res = await apiRequest(`/meetings/${id}`, {
    method: 'DELETE'
  });
  return res;
};

// -----------------------------------------------------------------------------
// Task Endpoints
// -----------------------------------------------------------------------------
export const getTasks = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/tasks?${query}` : '/tasks';
  const res = await apiRequest(endpoint);
  return res.data;
};

export const getTaskById = async (id) => {
  const res = await apiRequest(`/tasks/${id}`);
  return res.data;
};

export const createTask = async (taskData) => {
  const res = await apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  });
  return res.data;
};

export const updateTask = async (id, updateData) => {
  const res = await apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });
  return res.data;
};

export const deleteTask = async (id) => {
  const res = await apiRequest(`/tasks/${id}`, {
    method: 'DELETE'
  });
  return res;
};

// -----------------------------------------------------------------------------
// Decision Endpoints
// -----------------------------------------------------------------------------
export const getDecisions = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/decisions?${query}` : '/decisions';
  const res = await apiRequest(endpoint);
  return res.data;
};

export const getDecisionById = async (id) => {
  const res = await apiRequest(`/decisions/${id}`);
  return res.data;
};

export const createDecision = async (decisionData) => {
  const res = await apiRequest('/decisions', {
    method: 'POST',
    body: JSON.stringify(decisionData)
  });
  return res.data;
};

export const updateDecision = async (id, updateData) => {
  const res = await apiRequest(`/decisions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });
  return res.data;
};

export const deleteDecision = async (id) => {
  const res = await apiRequest(`/decisions/${id}`, {
    method: 'DELETE'
  });
  return res;
};
