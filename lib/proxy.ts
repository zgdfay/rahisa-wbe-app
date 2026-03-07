export const PROTECTED_ROUTES = [
  "/dashboard",
  "/report",
  "/sales",
  "/predictions",
];

export const AUTH_COOKIE_NAME = "auth_token";

export function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some((route) => path.startsWith(route));
}
