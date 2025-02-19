import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { describe, beforeAll, test, expect } from '@jest/globals';

// Example interfaces based on the provided OpenAPI schema references.
// Adjust or enrich these according to your actual schemas.
interface SucceedResponse {
  success: boolean;
  message: string;
}

interface ErrorResponse {
  error: string;
  message: string;
}

// Utility function for checking if a string is empty or has only whitespace.
// Used to test edge cases with path parameters.
function isEmptyOrWhitespace(str: string): boolean {
  return !str || !str.trim();
}

// Test suite for DELETE /api/v1/projects/{projectRef}/envvars/{env}/{name}
describe('DELETE /api/v1/projects/{projectRef}/envvars/{env}/{name}', () => {
  let axiosInstance: AxiosInstance;

  // Set up axios instance before tests.
  beforeAll(() => {
    axiosInstance = axios.create({
      baseURL: process.env.API_BASE_URL,
      // Let the test handle status codes, so we set validateStatus to always return true.
      validateStatus: () => true,
    });
  });

  test('Should delete environment variable successfully (200)', async () => {
    // Arrange
    const projectRef = 'my-project';
    const env = 'development';
    const name = 'TEST_VAR';

    // Act
    const response: AxiosResponse<SucceedResponse | ErrorResponse> = await axiosInstance.delete(
      `/api/v1/projects/${projectRef}/envvars/${env}/${name}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.API_AUTH_TOKEN}`,
        },
      }
    );

    // Assert: 200 Success
    // The API specification indicates a 200 response, but if the server returns 200 or 204, adapt the check.
    expect([200]).toContain(response.status);
    expect(response.headers['content-type']).toContain('application/json');

    if (response.status === 200) {
      // Validate that the response body conforms to SucceedResponse if status is 200.
      const data = response.data as SucceedResponse;
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
    }
  });

  test('Should return 400 (Or 422) for invalid path parameters', async () => {
    // Arrange: Use invalid path parameters (e.g., empty or malformed)
    const invalidProjectRef = '';
    const invalidEnv = '';
    const invalidName = '';

    // Act
    const response: AxiosResponse<ErrorResponse> = await axiosInstance.delete(
      `/api/v1/projects/${invalidProjectRef}/envvars/${invalidEnv}/${invalidName}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.API_AUTH_TOKEN}`,
        },
      }
    );

    // Assert: Expect 400 or 422 for invalid input
    // The API may return 400 or 422 for invalid payload or path parameters.
    expect([400, 422]).toContain(response.status);
    expect(response.headers['content-type']).toContain('application/json');

    // Validate error response structure
    const data = response.data;
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('message');

    // Further checks on the error content could be done here.
  });

  test('Should return 401 or 403 if authorization token is missing or invalid', async () => {
    // Arrange
    const projectRef = 'my-project';
    const env = 'development';
    const name = 'ANOTHER_TEST_VAR';

    // Act
    // Intentionally omit or use an invalid token.
    const response: AxiosResponse<ErrorResponse> = await axiosInstance.delete(
      `/api/v1/projects/${projectRef}/envvars/${env}/${name}`
      // No headers provided to simulate missing Authorization
    );

    // Assert: Check 401 or 403. API may return either for unauthorized/forbidden.
    expect([401, 403]).toContain(response.status);
    expect(response.headers['content-type']).toContain('application/json');

    // Validate error response.
    const data = response.data;
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('message');
  });

  test('Should return 404 for non-existent environment variable', async () => {
    // Arrange
    const projectRef = 'my-project';
    const env = 'development';
    const name = 'NON_EXISTENT_VAR';

    // Act
    const response: AxiosResponse<ErrorResponse> = await axiosInstance.delete(
      `/api/v1/projects/${projectRef}/envvars/${env}/${name}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.API_AUTH_TOKEN}`,
        },
      }
    );

    // Assert: Expect 404 if the resource is not found.
    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toContain('application/json');

    // Validate error response.
    const data = response.data;
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('message');
  });

  test('Should handle extremely large path parameters gracefully (edge case)', async () => {
    // Arrange: Create an extremely large string.
    const largeString = 'x'.repeat(5000); // 5,000 characters
    const projectRef = largeString;
    const env = largeString;
    const name = largeString;

    const response: AxiosResponse<ErrorResponse> = await axiosInstance.delete(
      `/api/v1/projects/${projectRef}/envvars/${env}/${name}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.API_AUTH_TOKEN}`,
        },
      }
    );

    // The API might respond with 400, 414 (URI Too Long), or similar.
    // If it does not handle large inputs, it could return a server error (500+).
    // Adjust expectations based on actual API behavior.
    expect([400, 414, 422, 500]).toContain(response.status);
  });
});
