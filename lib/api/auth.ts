export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const { backendService } = await import("@/lib/api/backend-service");
  const res = await backendService.register({ name, email, password });
  if (!res.success || !res.data) {
    const msg = typeof res.error === 'string' ? res.error : 'Registration failed';
    const error = new Error(msg);
    // Add error type information to the error object
    (error as any).isAuthError = res.isAuthError;
    (error as any).isNetworkError = res.isNetworkError;
    throw error;
  }
  return res.data;
}

export async function loginUser(email: string, password: string) {
  const { backendService } = await import("@/lib/api/backend-service");
  const res = await backendService.login(email, password);
  if (!res.success || !res.data) {
    const msg = typeof res.error === 'string' ? res.error : 'Login failed';
    const error = new Error(msg);
    // Add error type information to the error object
    (error as any).isAuthError = res.isAuthError;
    (error as any).isNetworkError = res.isNetworkError;
    throw error;
  }
  return { token: res.data.token, user: res.data.user };
}
