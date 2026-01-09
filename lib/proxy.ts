export const PROTECTED_ROUTES = [
  "/dashboard",
  "/reports",
  "/inventory",
  "/sales",
  "/products",
  "/recipes",
  "/settings",
];

export const AUTH_COOKIE_NAME = "auth_token";

export function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some((route) => path.startsWith(route));
}
