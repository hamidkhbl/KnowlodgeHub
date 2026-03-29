import { APIRequestContext, Page } from '@playwright/test';
import { AuthApi } from '../api/auth.api';

/**
 * Programmatically log in via API and inject auth state into the browser page.
 * Use this in UI tests to skip the login UI flow when auth is not under test.
 */
export async function injectAuthState(
  page: Page,
  request: APIRequestContext,
  baseUrl: string,
  email: string,
  password: string,
): Promise<void> {
  const authApi = new AuthApi(request, baseUrl);
  const { data } = await authApi.login(email, password);

  await page.addInitScript(
    ({ token, user }: { token: string; user: unknown }) => {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    },
    { token: data.access_token, user: data.user },
  );
}

/**
 * Reset and seed the database via the test support endpoints.
 */
export async function resetAndSeed(request: APIRequestContext, baseUrl: string): Promise<void> {
  const resetResponse = await request.post(`${baseUrl}/api/test/reset`);
  if (!resetResponse.ok()) {
    throw new Error(`DB reset failed: ${resetResponse.status()}`);
  }

  const seedResponse = await request.post(`${baseUrl}/api/test/seed`);
  if (!seedResponse.ok()) {
    throw new Error(`DB seed failed: ${seedResponse.status()}`);
  }
}
