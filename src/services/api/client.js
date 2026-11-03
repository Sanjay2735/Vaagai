/**
 * VAAGAI Unified HTTP API Client
 */

const API_BASE = '/api';

function getAuthHeader() {
  try {
    const token =
      localStorage.getItem('vaagai_customer_token') ||
      localStorage.getItem('vaagai_auth_token_v1');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function apiClient(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export default apiClient;

