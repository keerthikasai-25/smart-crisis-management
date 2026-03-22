// Internet Identity has been fully removed.
// This stub exists only to prevent import errors from legacy hooks.
export const useInternetIdentity = () => ({
  identity: undefined,
  login: () => {},
  clear: () => {},
  loginStatus: "idle" as const,
  isInitializing: false,
  isLoginIdle: true,
  isLoggingIn: false,
  isLoginSuccess: false,
  isLoginError: false,
  loginError: undefined,
});

export function InternetIdentityProvider({
  children,
}: { children: React.ReactNode }) {
  // No-op provider stub
  return children as React.ReactElement;
}
