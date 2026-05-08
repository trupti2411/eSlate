import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, "") ?? "";

function withBase(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/api") && API_BASE) return `${API_BASE}${url}`;
  return url;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest(endpoint: string, method: string = "GET", data?: any) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...authHeaders(),
  };

  const config: RequestInit = { method, headers };
  if (data) config.body = JSON.stringify(data);

  const response = await fetch(withBase(endpoint), config);

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth";
      }
      return null;
    }

    let errorMessage: string;
    try {
      const errorData = await response.json();
      errorMessage = errorData?.message || `HTTP ${response.status}`;
    } catch {
      errorMessage = `HTTP ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...authHeaders(),
    };

    const url = withBase(queryKey.join("/") as string);
    const res = await fetch(url, { headers });

    if (res.status === 401) {
      localStorage.removeItem("authToken");
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      window.location.href = "/auth";
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Kept for backwards compatibility with old callers; Sanctum doesn't need CSRF.
export async function getCsrfToken(): Promise<string> {
  return "";
}
