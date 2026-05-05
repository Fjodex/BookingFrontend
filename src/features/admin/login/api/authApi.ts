import { apiFetch } from "../../../../api/http";

export async function adminLogin(
  username: string,
  password: string,
): Promise<void> {
  const res = await apiFetch<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  if (!res?.token) {
    throw new Error("Invalid login response");
  }

  localStorage.setItem("adminToken", res.token);
}

export function adminLogout() {
  localStorage.removeItem("adminToken");
}

function isTokenExpired(token: string): boolean {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.exp * 1000 < Date.now();
}

export function isAdminLoggedIn(): boolean {
  const token = localStorage.getItem("adminToken");
  if (!token) return false;

  return !isTokenExpired(token);
}
