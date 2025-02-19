import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { describe, expect, it, beforeAll } from '@jest/globals';

/**
 * This test suite covers the DELETE /api/v1/projects/{projectRef}/envvars/{env}/{name} endpoint.
 *
 * It validates:
 * 1. Input Validation
 * 2. Response Validation
 * 3. Response Headers Validation
 * 4. Edge Cases & Limit Testing
 * 5. Authorization & Authentication
 */

describe('DELETE /api/v1/projects/{projectRef}/envvars/{env}/{name}', () => {
  let axiosInstance: AxiosInstance;
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  const validToken = process.env.API_AUTH_TOKEN || 'VALID_TOKEN';

  // Example valid path parameter values (may need to be adjusted to match your actual environment)
  const validProjectRef = 'sampleProject';
  const validEnv = 'dev';
  const validName = 'TEST_VAR';

  // Example invalid path parameter values
  const invalidProjectRef = '';
  const invalidEnv = 123; // wrong type, expecting a string in most cases
  const invalidName = '';

  // Set up a new Axios instance before all tests
  beforeAll(() => {
    axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // Allow handling of non-2xx responses
    });
  });

  /**
   * Helper function to perform the DELETE request.
   * Adjust the function signature if you want extra parameters.
   */
  const deleteEnvVar = async (
    projectRef: string | number,
    env: string | number,
    name: string | number,
    token?: string
  ): Promise<AxiosResponse> => {
    const endpoint = `/api/v1/projects/${projectRef}/envvars/${env}/${name}`;
    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : undefined;

    return axiosInstance.delete(endpoint, {
      headers,
    });
  };

  it('should delete environment variable successfully [200]', async () => {
    const response = await deleteEnvVar(validProjectRef, validEnv, validName, validToken);

    // Expect the status code to be 200 (successful deletion)
    expect(response.status).toBe(200);

    // Check response headers
    expect(response.headers['content-type']).toMatch(/application\/json/);

    // Check response body schema (assuming a SucceedResponse structure)
    // e.g. { success: boolean, message: string, ... }
    expect(response.data).toHaveProperty('success');
    expect(typeof response.data.success).toBe('boolean');
    expect(response.data).toHaveProperty('message');
    expect(typeof response.data.message).toBe('string');
  });

  it('should return 400 or 422 for invalid path parameters', async () => {
    // Attempt with an invalid projectRef (empty string)
    const response = await deleteEnvVar(invalidProjectRef, validEnv, validName, validToken);

    // The API might return 400 or 422
    expect([400, 422]).toContain(response.status);

    // Check response headers
    expect(response.headers['content-type']).toMatch(/application\/json/);

    // Check response body (assuming ErrorResponse structure)
    // e.g. { error: string, message: string, ... }
    expect(response.data).toHaveProperty('error');
    expect(response.data).toHaveProperty('message');
  });

  it('should return 401 or 403 if token is missing or invalid', async () => {
    // Missing token
    const response = await deleteEnvVar(validProjectRef, validEnv, validName);

    // The API might return 401 or 403
    expect([401, 403]).toContain(response.status);

    // Check response headers
    expect(response.headers['content-type']).toMatch(/application\/json/);

    // Check response body (assuming ErrorResponse structure)
    expect(response.data).toHaveProperty('error');
    expect(response.data).toHaveProperty('message');
  });

  it('should return 404 if environment variable (resource) does not exist', async () => {
    // Attempt to delete with a non-existing name
    const nonExistentName = 'NON_EXISTENT_VARIABLE';
    const response = await deleteEnvVar(validProjectRef, validEnv, nonExistentName, validToken);

    // Expect a 404 if resource isn't found
    expect(response.status).toBe(404);

    // Check response headers
    expect(response.headers['content-type']).toMatch(/application\/json/);

    // Check response body (assuming ErrorResponse structure)
    expect(response.data).toHaveProperty('error');
    expect(response.data).toHaveProperty('message');
  });

  it('should handle large or boundary case values gracefully', async () => {
    // Example: extremely large string for projectRef
    const largeProjectRef = 'a'.repeat(1000); // Adjust length to test boundary
    const response = await deleteEnvVar(largeProjectRef, validEnv, validName, validToken);

    // The API might return 400/422 for invalid/boundary issues
    expect([400, 422]).toContain(response.status);

    // Check headers
    expect(response.headers['content-type']).toMatch(/application\/json/);

    // Check body
    expect(response.data).toHaveProperty('error');
    expect(response.data).toHaveProperty('message');
  });

  // Additional tests can be added here for 500 server errors, rate limiting, etc.
});
