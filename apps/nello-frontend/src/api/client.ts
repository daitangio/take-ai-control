const JWT_KEY = "nello_jwt";
export const BASE_URL = "";

export const getJwt = () =>
  typeof window === "undefined" ? null : window.localStorage.getItem(JWT_KEY);

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const jwt = getJwt();

  if (jwt) {
    headers.set("Authorization", `Bearer ${jwt}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? ((await response.json()) as unknown)
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : typeof data === "object" && data && "error" in data
          ? String(data.error)
          : response.statusText;
    throw new Error(message || "Request failed");
  }

  return data as T;
}

export { JWT_KEY };
