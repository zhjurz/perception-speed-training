export function useApi() {
  const API_BASE = "http://localhost:3001/api";

  async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const token = localStorage.getItem("adminToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "请求失败" }));
      throw new Error(error.error || "请求失败");
    }

    return response.json();
  }

  return {
    API_BASE,
    request,
    get: (endpoint) => request(endpoint),
    post: (endpoint, data) =>
      request(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    put: (endpoint, data) =>
      request(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    del: (endpoint) =>
      request(endpoint, {
        method: "DELETE",
      }),
  };
}
