/**
 * Cliente HTTP para comunicarse con el Backend Serverless de Express.
 * Se encarga de adjuntar automáticamente el JWT de Clerk a las peticiones.
 */
export const apiClient = {
  async getToken(): Promise<string | null> {
    if (typeof window !== 'undefined' && (window as any).Clerk?.session) {
      return await (window as any).Clerk.session.getToken();
    }
    return null;
  },

  async getHeaders(): Promise<HeadersInit> {
    const token = await this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  },

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    const res = await fetch(endpoint, { headers });
    if (!res.ok) {
      throw new Error(`GET ${endpoint} failed: ${res.statusText}`);
    }
    return res.json();
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error(`POST ${endpoint} failed: ${res.statusText}`);
    }
    return res.json();
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error(`PUT ${endpoint} failed: ${res.statusText}`);
    }
    return res.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    const res = await fetch(endpoint, { method: 'DELETE', headers });
    if (!res.ok) {
      throw new Error(`DELETE ${endpoint} failed: ${res.statusText}`);
    }
    return res.json();
  }
};
