import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
});

export function getInitData(): string {
  if (typeof window === 'undefined') return '';
  try {
    // Dynamic require to avoid SSR issues with @twa-dev/sdk
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const WebApp = require('@twa-dev/sdk').default;
    const data = WebApp.initData;
    if (data) return data;
  } catch {
    // WebApp not available (outside Telegram)
  }
  return '';
}

api.interceptors.request.use((config) => {
  const initData = getInitData();
  if (initData) {
    config.headers['X-Telegram-Init-Data'] = initData;
  }
  return config;
});
