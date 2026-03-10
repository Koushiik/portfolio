export {};

declare global {
  interface Window {
    PORTFOLIO_CONTENT_DEFAULTS?: Record<string, string>;
    PORTFOLIO_CMS_CONFIG?: { workerBaseUrl: string };
    __PORTFOLIO_ADMIN_INIT__?: boolean;
  }
}
