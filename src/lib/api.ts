
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        // In a real app, you'd send an auth token here
        // 'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
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

export const fetcher = (endpoint: string) => fetchApi(endpoint);

export const postData = (endpoint: string, data: any) => fetchApi(endpoint, { method: 'POST', body: JSON.stringify(data) });
export const putData = (endpoint: string, data: any) => fetchApi(endpoint, { method: 'PUT', body: JSON.stringify(data) });
export const deleteData = (endpoint: string) => fetchApi(endpoint, { method: 'DELETE' });
