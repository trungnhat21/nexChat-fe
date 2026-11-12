/**
 * Global environment and connection endpoints configuration.
 */

const rawInput = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");
// Ensure trailing "/api" is stripped if user mistakenly configured it in the root URL
const sanitizedBaseUrl = rawInput.replace(/\/api$/, "");

// Criterion 5: Fail-fast check for Production environment
if (!import.meta.env.DEV && !sanitizedBaseUrl) {
    const message =
        "[Production Configuration Error] Missing VITE_API_BASE_URL! " +
        "Please define VITE_API_BASE_URL in your Vercel Dashboard (e.g. https://your-backend.onrender.com).";
    console.error(message);
    throw new Error(message);
}

/**
 * Base URL for REST API requests.
 * - In local dev (import.meta.env.DEV): defaults to relative "/api" to route requests
 *   through Vite's dev proxy, preventing local CORS and cookie issues.
 * - In production: uses `${sanitizedBaseUrl}/api` (ensuring no double or missing slashes).
 */
export const API_BASE_URL = import.meta.env.DEV
    ? "/api"
    : `${sanitizedBaseUrl}/api`;

/**
 * Base URL for Realtime Socket.IO connection.
 * Prioritizes VITE_SOCKET_URL, then sanitizedBaseUrl, and falls back to window.location.origin in dev.
 * Ensures the origin domain is used without trailing "/api" suffix.
 */
export const SOCKET_URL =
    (import.meta.env.VITE_SOCKET_URL?.trim().replace(/\/+$/, "").replace(/\/api$/, "")
        || sanitizedBaseUrl
        || (typeof window !== "undefined" ? window.location.origin : "")
    ).replace(/\/+$/, "");
