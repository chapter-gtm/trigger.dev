import axios, { AxiosError } from 'axios';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN || 'fake-token';

describe('GET /api/v1/projects/{projectRef}/envvars/{env}', () => {
  const projectRef = 'testProject';
  const env = 'development';

  // Create an Axios instance with default headers
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${API_AUTH_TOKEN}`,
    },
    // Allow Jest tests to handle response codes manually
    validateStatus: () => true,
  });

  describe('Input validation', () => {
    it('should return 400 or 422 when projectRef is invalid (e.g. empty string)', async () => {
      const invalidProjectRef = '';
      const url = `/api/v1/projects/${invalidProjectRef}/envvars/${env}`;

      const response = await axiosInstance.get(url);

      // Expecting a 400 or 422 for invalid path parameter
      expect([400, 422]).toContain(response.status);
      expect(response.data).toBeDefined();
    });

    it('should return 400 or 422 when env is invalid (e.g. empty string)', async () => {
      const invalidEnv = '';
      const url = `/api/v1/projects/${projectRef}/envvars/${invalidEnv}`;

      const response = await axiosInstance.get(url);

      // Expecting a 400 or 422 for invalid path parameter
      expect([400, 422]).toContain(response.status);
      expect(response.data).toBeDefined();
    });

    it('should return 404 when projectRef does not exist', async () => {
      const nonExistentProjectRef = 'nonExistentProject';
      const url = `/api/v1/projects/${nonExistentProjectRef}/envvars/${env}`;

      const response = await axiosInstance.get(url);

      // If the project does not exist, we expect a 404
      expect(response.status).toBe(404);
      expect(response.data).toBeDefined();
    });
  });

  describe('Response validation', () => {
    it('should return 200 and a valid response schema with existing projectRef/env', async () => {
      const url = `/api/v1/projects/${projectRef}/envvars/${env}`;

      const response = await axiosInstance.get(url);

      // Check for a successful response
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/i);

      // Basic schema validation (example: expecting an array of envVars)
      expect(Array.isArray(response.data.envVars)).toBe(true);
      // Additional checks can be done to verify field types
    });
  });

  describe('Response headers validation', () => {
    it('should include the correct Content-Type header', async () => {
      const url = `/api/v1/projects/${projectRef}/envvars/${env}`;

      const response = await axiosInstance.get(url);

      // Verify the response Content-Type is JSON
      expect(response.headers['content-type']).toMatch(/application\/json/i);
    });
  });

  describe('Edge Case & Limit Testing', () => {
    it('should handle request with large or no environment variables', async () => {
      // We cannot easily enforce large or empty responses, but we can check structure
      const url = `/api/v1/projects/${projectRef}/envvars/${env}`;

      const response = await axiosInstance.get(url);

      // 200 for valid data, possibly 204 if no content
      expect([200, 204]).toContain(response.status);
      // If 200, verify envVars is an array
      if (response.status === 200) {
        expect(Array.isArray(response.data.envVars)).toBe(true);
      }
    });

    it('should handle server error gracefully (simulate if possible)', async () => {
      // Example of simulating a server error if the API supports such a parameter
      const url = `/api/v1/projects/${projectRef}/envvars/${env}?simulateServerError=true`;

      const response = await axiosInstance.get(url);

      // If the server is configured to return 500 for simulateServerError
      if (response.status === 500) {
        expect(response.data).toBeDefined();
      } else {
        // Otherwise, expect normal outcomes for a valid or invalid request
        expect([200, 400, 404]).toContain(response.status);
      }
    });
  });

  describe('Testing Authorization & Authentication', () => {
    // Axios instance without authentication
    const axiosInstanceNoAuth = axios.create({
      baseURL: API_BASE_URL,
      validateStatus: () => true,
    });

    it('should return 200 for valid token', async () => {
      const url = `/api/v1/projects/${projectRef}/envvars/${env}`;

      const response = await axiosInstance.get(url);

      // Typically 200 if authorized, though 403 may also be possible
      expect([200, 403]).toContain(response.status);
    });

    it('should return 401 or 403 for missing token', async () => {
      const url = `/api/v1/projects/${projectRef}/envvars/${env}`;

      const response = await axiosInstanceNoAuth.get(url);

      // The API might return 401 or 403 in unauthorized cases
      expect([401, 403]).toContain(response.status);
    });

    it('should return 401 or 403 for invalid token', async () => {
      const axiosInstanceInvalidAuth = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          Authorization: 'Bearer invalid_token',
        },
        validateStatus: () => true,
      });

      const url = `/api/v1/projects/${projectRef}/envvars/${env}`;
      const response = await axiosInstanceInvalidAuth.get(url);

      // The API might return 401 or 403 for invalid tokens
      expect([401, 403]).toContain(response.status);
    });
  });
});
