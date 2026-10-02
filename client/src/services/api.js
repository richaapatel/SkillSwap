const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  let data = null;
  try {
    data = await response.json();
  } catch {
    // Some successful responses may not contain a JSON body.
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('skillswap:unauthorized'));
    }

    const fallbackMessages = {
      400: 'Please check the information you entered.',
      403: 'You are not allowed to perform that action.',
      404: 'The requested resource was not found.',
      409: 'This request conflicts with existing information.',
      500: 'The server could not complete that request.',
    };
    throw new Error(data?.message || fallbackMessages[response.status] || 'The request could not be completed.');
  }
  return data;
};

const request = async (endpoint, options) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    return handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to reach SkillSwap right now. Please try again.', { cause: error });
    }
    throw error;
  }
};

const api = {
  get: async (endpoint, token = null) => {
    return request(endpoint, {
      method: 'GET',
      headers: getHeaders(token),
    });
  },

  post: async (endpoint, body, token = null) => {
    return request(endpoint, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(body),
    });
  },

  put: async (endpoint, body, token = null) => {
    return request(endpoint, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(body),
    });
  },

  patch: async (endpoint, body, token = null) => {
    return request(endpoint, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify(body),
    });
  },

  delete: async (endpoint, token = null) => {
    return request(endpoint, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
  },
};

export default api;
