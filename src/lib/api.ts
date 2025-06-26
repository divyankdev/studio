const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function shouldAttachToken(endpoint: string) {
  // Do not attach token for these endpoints
  return !(
    endpoint.startsWith('/auth/login') ||
    endpoint.startsWith('/auth/register') ||
    endpoint.startsWith('/auth/forgot-password')
  );
}

function normalizeHeaders(headers: any): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const obj: Record<string, string> = {};
    headers.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return { ...headers };
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  try {
    const baseHeaders = normalizeHeaders(options.headers);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...baseHeaders,
    };
    if (typeof window !== 'undefined' && shouldAttachToken(endpoint)) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorInfo;
      try {
        errorInfo = await response.json();
      } catch (e) {
        errorInfo = { message: response.statusText };
      }
      console.error('API Error:', errorInfo);
      throw new Error(`API error on ${endpoint}: ${response.status} ${response.statusText} - ${errorInfo.message || 'No additional error info'}`);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }
  
    return response.json();
  } catch (error) {
    console.error('Network or fetch error:', error);
    throw error;
  }
}

export const fetcher = async (endpoint: string) => {
  const response = await fetchApi(endpoint);
  return response?.data;
}

export const postData = (endpoint: string, data: any) => fetchApi(endpoint, { method: 'POST', body: JSON.stringify(data) });
export const putData = (endpoint: string, data: any) => fetchApi(endpoint, { method: 'PUT', body: JSON.stringify(data) });
export const deleteData = (endpoint: string) => fetchApi(endpoint, { method: 'DELETE' });
