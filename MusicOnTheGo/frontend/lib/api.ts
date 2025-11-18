// /Users/guimondpierrelouis/Downloads/Final Project/MusicOnTheGo/frontend/lib/api.ts
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

type ApiInit = RequestInit & {
  headers?: Record<string, string>;
};

export async function api(path: string, init: ApiInit = {}) {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) ||
      `Request failed with ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return data;
}