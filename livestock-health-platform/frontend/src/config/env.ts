const env = (import.meta as any).env || {};

export const API_BASE_URL: string = (env.VITE_API_BASE_URL as string) || '';

// Demo mode is active if explicitly set to 'true' or if no API_BASE_URL is configured
export const IS_DEMO_MODE: boolean =
  env.VITE_DEMO_MODE === 'true' ||
  env.VITE_DEMO_MODE === true ||
  !API_BASE_URL;

export const APP_ENV: string = (env.VITE_APP_ENV as string) || (IS_DEMO_MODE ? 'demo' : 'development');

