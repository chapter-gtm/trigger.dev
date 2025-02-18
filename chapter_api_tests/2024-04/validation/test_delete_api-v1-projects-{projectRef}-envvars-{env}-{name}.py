import axios, { AxiosInstance } from 'axios';
import { describe, it, expect, beforeAll } from '@jest/globals';

/**
 * DELETE /api/v1/projects/{projectRef}/envvars/{env}/{name}
 * Summary: Delete environment variable
 * Description: Delete a specific environment variable for a specific project and environment.
 *
 * This test suite covers:
 * 1. Input Validation (e.g., missing or invalid path params)
 * 2. Response Validation (e.g., correct status codes and JSON schema checks)
 * 3. Response Headers Validation
 * 4. Edge Case & Limit Testing (e.g., extremely long params)
 * 5. Authorization & Authentication Tests
 */

describe('DELETE /api/v1/projects/{projectRef}/envvars/{env}/{name}', () => {
  let request: AxiosInstance;

  // Define some valid test data
  const validProjectRef = 'exampleProjectRef';
  const validEnv = 'staging';
  const validName = 'EXAMPLE_VAR';

  beforeAll(() => {
    // Create an Axios instance for all requests in this suite
    // Loads base URL and auth token from environment variables
    request = axios.create({
      baseURL: process.env.API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.API_AUTH_TOKEN}`,
      },
      validateStatus: () => true, // we'll handle status codes manually in each test
    });
  });

  /**
   * 1. Valid Request
   */
  describe('Valid Request', () => {
    it('should delete the environment variable successfully (expect 200)', async () => {
      // Perform the DELETE request with valid path parameters
      const response = await request.delete(
        `/api/v1/projects/${validProjectRef}/envvars/${validEnv}/${validName}`
      );

      // Check valid status code
      expect(response.status).toBe(200);

      // Validate response headers
      expect(response.headers).toHaveProperty('content-type');
      expect(response.headers['content-type']).toMatch(/application\/json/i);

      // Validate response body structure (SucceedResponse)
      // Example schema might have { message: 'Environment variable deleted successfully' }
      expect(response.data).toHaveProperty('message');
      expect(typeof response.data.message).toBe('string');
    });
  });

  /**
   * 2. Input Validation (Invalid or Malformed Parameters)
   */
  describe('Input Validation', () => {
    it('should return 400 or 422 when path param is empty or malformed', async () => {
      // Using an empty name to force an invalid path param scenario
      const invalidName = '';

      const response = await request.delete(
        `/api/v1/projects/${validProjectRef}/envvars/${validEnv}/${invalidName}`
      );

      // The API could return either 400 or 422 for invalid parameters
      expect([400, 422]).toContain(response.status);

      // Validate response headers
      expect(response.headers).toHaveProperty('content-type');
      expect(response.headers['content-type']).toMatch(/application\/json/i);

      // Validate error response body (ErrorResponse)
      // Example schema might have { error: 'some error message' }
      expect(response.data).toHaveProperty('error');
      expect(typeof response.data.error).toBe('string');
    });

    it('should return 400 or 422 when path param is extremely long', async () => {
      // Large string to test boundary condition
      const longName = 'A'.repeat(1000);

      const response = await request.delete(
        `/api/v1/projects/${validProjectRef}/envvars/${validEnv}/${longName}`
      );

      // The API could return either 400 or 422 for invalid parameters
      expect([400, 422]).toContain(response.status);

      // Validate response headers
      expect(response.headers).toHaveProperty('content-type');
      expect(response.headers['content-type']).toMatch(/application\/json/i);

      // Validate error response body (ErrorResponse)
      expect(response.data).toHaveProperty('error');
      expect(typeof response.data.error).toBe('string');
    });
  });

  /**
   * 3. Authorization & Authentication
   */
  describe('Authorization & Authentication', () => {
    it('should return 401 or 403 if the token is missing or invalid', async () => {
      // Create another Axios instance without Authorization header
      const unauthRequest = axios.create({
        baseURL: process.env.API_BASE_URL,
        validateStatus: () => true,
      });

      const response = await unauthRequest.delete(
        `/api/v1/projects/${validProjectRef}/envvars/${validEnv}/${validName}`
      );

      // Expect 401 (Unauthorized) or 403 (Forbidden)
      expect([401, 403]).toContain(response.status);

      // Validate response headers
      expect(response.headers).toHaveProperty('content-type');
      expect(response.headers['content-type']).toMatch(/application\/json/i);

      // Validate error response structure
      expect(response.data).toHaveProperty('error');
      expect(typeof response.data.error).toBe('string');
    });
  });

  /**
   * 4. Resource Not Found
   */
  describe('Resource Not Found', () => {
    it('should return 404 if the specified environment variable does not exist', async () => {
      const nonExistentName = 'NON_EXISTENT_VAR';

      const response = await request.delete(
        `/api/v1/projects/${validProjectRef}/envvars/${validEnv}/${nonExistentName}`
      );

      // Expect 404 for missing resource
      expect(response.status).toBe(404);

      // Validate response headers
      expect(response.headers).toHaveProperty('content-type');
      expect(response.headers['content-type']).toMatch(/application\/json/i);

      // Validate error response body
      expect(response.data).toHaveProperty('error');
      expect(typeof response.data.error).toBe('string');
    });
  });
});
