const BASE_URL = import.meta.env.VITE_API_URL;

function getAuthToken(): string | null {
  return localStorage.getItem("adminToken");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw response;
  }

  // 🔥 Read raw text first
  const text = await response.text();

  // If empty body (200 OK with no content)
  if (!text) {
    return null as T;
  }

  // Otherwise parse JSON safely
  return JSON.parse(text) as T;
}
