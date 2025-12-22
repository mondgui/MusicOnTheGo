// API Configuration for Admin Panel
// Connects to the MusicOnTheGo backend API

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5050";

// Get token from localStorage (web version)
function getToken() {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

// Main API function
export async function api(path, init = {}) {
  let url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  
  // Add query parameters if provided
  if (init.params && Object.keys(init.params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(init.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Set up headers
  const headers = {
    ...(init.headers || {}),
  };

  // Set Content-Type for JSON requests
  const isFormData = init.body instanceof FormData;
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Attach JWT token (default to true for authenticated requests)
  if (init.auth !== false) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  // Remove params from init before passing to fetch
  const { params, body: rawBody, ...fetchInit } = init;

  // Convert body to proper format
  let body = undefined;
  if (rawBody !== undefined) {
    if (isFormData || rawBody instanceof FormData || rawBody instanceof Blob || rawBody instanceof ArrayBuffer || rawBody instanceof URLSearchParams) {
      body = rawBody;
    } else if (typeof rawBody === 'object' && headers['Content-Type'] === 'application/json') {
      body = JSON.stringify(rawBody);
    } else {
      body = rawBody;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchInit,
      body,
      headers,
    });

    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      const message =
        (data && (data.error || data.message)) ||
        `Request failed with ${response.status} ${response.statusText}`;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error('[API] Error:', error);
    throw error;
  }
}

