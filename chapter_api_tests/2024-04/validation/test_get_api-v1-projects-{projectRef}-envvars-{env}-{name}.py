import axios, { AxiosInstance, AxiosError } from 'axios';

describe('GET /api/v1/projects/{projectRef}/envvars/{env}/{name}', () => {
  let apiClient: AxiosInstance;

  // Example valid references for the happy path
  const existingProjectRef = 'myProject';
  const existingEnv = 'production';
  const existingVarName = 'SOME_VAR';

  // Example invalid or non-existent references
  const nonExistentVarName = 'NON_EXISTENT_VAR';
  const invalidProjectRef = '';
  const invalidEnv = '';
  const invalidName = '';

  beforeAll(() => {
    // Create an Axios instance using environment variables
    const baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
    const token = process.env.API_AUTH_TOKEN || ''; // If empty, tests for missing token will apply

    apiClient = axios.create({
      baseURL,
      headers: {
        // Only attach Authorization header if token exists
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  });

  // 1. Successful retrieval (200)
  test('should retrieve environment variable successfully (200)', async () => {
    const url = `/api/v1/projects/${existingProjectRef}/envvars/${existingEnv}/${existingVarName}`;

    const response = await apiClient.get(url);

    // Response validation
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/i);
    expect(response.data).toBeDefined();

    // Basic response body validation (assuming EnvVarValue has 'name' and 'value')
    expect(response.data).toHaveProperty('name');
    expect(typeof response.data.name).toBe('string');
    expect(response.data).toHaveProperty('value');
    expect(typeof response.data.value).toBe('string');
  });

  // 2. Resource not found (404)
  test('should return 404 for a non-existing environment variable', async () => {
    const url = `/api/v1/projects/${existingProjectRef}/envvars/${existingEnv}/${nonExistentVarName}`;

    try {
      await apiClient.get(url);
      fail('Expected 404 Not Found');
    } catch (error) {
      const err = error as AxiosError;
      expect(err.response).toBeDefined();
      expect(err.response?.status).toBe(404);
      expect(err.response?.data).toBeDefined();
      // Example check for a standard error response field
      expect(err.response?.data).toHaveProperty('message');
    }
  });

  // 3. Invalid path parameters (400 or 422)
  test('should return 400 or 422 for invalid path params (empty projectRef)', async () => {
    const url = `/api/v1/projects/${invalidProjectRef}/envvars/${existingEnv}/${existingVarName}`;

    try {
      await apiClient.get(url);
      fail('Expected 400 or 422 error');
    } catch (error) {
      const err = error as AxiosError;
      expect(err.response).toBeDefined();
      expect([400, 422]).toContain(err.response?.status);
    }
  });

  test('should return 400 or 422 for invalid path params (empty env)', async () => {
    const url = `/api/v1/projects/${existingProjectRef}/envvars/${invalidEnv}/${existingVarName}`;

    try {
      await apiClient.get(url);
      fail('Expected 400 or 422 error');
    } catch (error) {
      const err = error as AxiosError;
      expect(err.response).toBeDefined();
      expect([400, 422]).toContain(err.response?.status);
    }
  });

  test('should return 400 or 422 for invalid path params (empty name)', async () => {
    const url = `/api/v1/projects/${existingProjectRef}/envvars/${existingEnv}/${invalidName}`;

    try {
      await apiClient.get(url);
      fail('Expected 400 or 422 error');
    } catch (error) {
      const err = error as AxiosError;
      expect(err.response).toBeDefined();
      expect([400, 422]).toContain(err.response?.status);
    }
  });

  // 4. Unauthorized / forbidden requests (401 or 403)
  test('should return 401 or 403 for missing auth token', async () => {
    // Create a client with no auth header
    const baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
    const clientWithoutAuth = axios.create({ baseURL });

    const url = `/api/v1/projects/${existingProjectRef}/envvars/${existingEnv}/${existingVarName}`;

    try {
      await clientWithoutAuth.get(url);
      fail('Expected 401 or 403 error');
    } catch (error) {
      const err = error as AxiosError;
      expect(err.response).toBeDefined();
      expect([401, 403]).toContain(err.response?.status);
    }
  });
});