import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

let cachedCsrfToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (cachedCsrfToken) return cachedCsrfToken;
  const res = await fetch('/api/auth/csrf-token', { credentials: 'include' });
  if (res.ok) {
    const data = await res.json();
    cachedCsrfToken = data.csrfToken;
    return cachedCsrfToken!;
  }
  return '';
}

export async function apiRequest(endpoint: string, method: string = "GET", data?: any) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    const csrfToken = await getCsrfToken();
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  let response = await fetch(endpoint, config);

  if (response.status === 403 && !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    cachedCsrfToken = null;
    const freshToken = await getCsrfToken();
    if (freshToken) {
      (config.headers as Record<string, string>)['x-csrf-token'] = freshToken;
      response = await fetch(endpoint, config);
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = "/auth";
      return null;
    }

    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData?.message || `HTTP ${response.status}`;
    } catch {
      errorMessage = `HTTP ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  // Always ensure we return parsed JSON
  try {
    const jsonResponse = await response.json();
    console.log(`API Response for ${endpoint}:`, jsonResponse);
    return jsonResponse;
  } catch (error) {
    console.error(`Failed to parse JSON response from ${endpoint}:`, error);
    return null;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};

    // Add JWT token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
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