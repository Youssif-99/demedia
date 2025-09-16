export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiFetch(path: string, options: RequestInit = {}, retryCount = 2): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (userId) {
    headers["user-id"] = userId;
  }
  if (!(headers as any)["Content-Type"] && options.body) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (res.status === 401) {
      // Auto logout on unauthorized
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
      }
    }
    if (!res.ok && retryCount > 0 && (res.status >= 500 || res.status === 429)) {
      await delay(300 * (3 - retryCount));
      return apiFetch(path, options, retryCount - 1);
    }
    return res;
  } catch (err) {
    if (retryCount > 0) {
      await delay(300 * (3 - retryCount));
      return apiFetch(path, options, retryCount - 1);
    }
    throw err;
  }
}

interface UserProfileResponse {
    id: number;
    name: string;
    username: string;
    email: string;
    bio: string | null;
    profilePicture: string | null;
    coverPhoto: string | null;
    createdAt: string;
    followersCount: number;
    followingCount: number;
    likesCount: number;
    stories: Array<{
        id: number;
        content: string;
        createdAt: string;
    }>;
}

export async function getUserProfile(userId: string | number): Promise<UserProfileResponse | null> {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error("NEXT_PUBLIC_API_URL environment variable is not set");
        }

        const res = await fetch(`${apiUrl}/api/user/${userId}/profile`, {
            cache: "no-store", // عشان ما يكاشي
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to fetch profile: ${res.status} ${errorText}`);
        }
        
        return await res.json() as UserProfileResponse;
    } catch (err) {
        console.error("Error fetching user profile:", err);
        return null; // Return null instead of throwing to handle gracefully
    }
}
