const BASE_API =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4001/api/v1";

function getTokens() {
  const access = sessionStorage.getItem("accessToken");
  const refresh = sessionStorage.getItem("refreshToken");
  return { access, refresh };
}

async function apiRequest(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  const { access } = getTokens();
  if (access) {
    headers.set("Authorization", `Bearer ${access}`);
  }

  const response = await fetch(`${BASE_API}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => {});
  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}

export default apiRequest;
