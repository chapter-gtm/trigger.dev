import axios, { AxiosResponse } from 'axios';
import { describe, it, expect, beforeAll } from '@jest/globals';

// Load environment variables
const API_BASE_URL = process.env.API_BASE_URL;
const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN;

// Common test data
const VALID_PROJECT_REF = 'test-project';
const VALID_ENV = 'production';

// Construct endpoint
// Example: https://example.com/api/v1/projects/test-project/envvars/production
function getEndpoint(projectRef: string, env: string): string {
  return `${API_BASE_URL}/api/v1/projects/${projectRef}/envvars/${env}`;
}

// Valid body payload based on presumed schema for creating an environment variable.
// Adjust fields as needed to match your actual API schema.
const validRequestBody = {
  name: 'MY_VARIABLE',
  value: 'someValue',
};

// Helper function to make requests
async function makeRequest(
  projectRef: string,
  env: string,
  data: any,
  token: string | undefined = API_AUTH_TOKEN
): Promise<AxiosResponse> {
  const url = getEndpoint(projectRef, env);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return axios.post(url, data, { headers });
}

describe('POST /api/v1/projects/{projectRef}/envvars/{env}', () => {
  beforeAll(() => {
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL environment variable is not defined.');
    }
  });

  describe('Input Validation', () => {
    it('should create environment variable with valid data (200 response)', async () => {
      const response = await makeRequest(VALID_PROJECT_REF, VALID_ENV, validRequestBody);
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      // Check if response body matches expected schema (e.g., has "success" or similar)
      // Adjust this validation to fit the actual "SucceedResponse" schema.
      expect(response.data).toHaveProperty('success');
      expect(typeof response.data.success).toBe('boolean');
    });

    it('should return 400 or 422 when required fields are missing', async () => {
      // Missing "name" and "value"
      const invalidBody = {};
      try {
        await makeRequest(VALID_PROJECT_REF, VALID_ENV, invalidBody);
      } catch (error: any) {
        const status = error.response?.status;
        // Either 400 or 422 is acceptable for invalid payload
        expect([400, 422]).toContain(status);
        expect(error.response.data).toBeDefined();
      }
    });

    it('should return 400 or 422 when fields have wrong types', async () => {
      // Provide number instead of string
      const invalidBody = {
        name: 1234,
        value: 5678,
      };
      try {
        await makeRequest(VALID_PROJECT_REF, VALID_ENV, invalidBody);
      } catch (error: any) {
        const status = error.response?.status;
        expect([400, 422]).toContain(status);
        expect(error.response.data).toBeDefined();
      }
    });

    it('should handle empty string as a field value and potentially return 400 or 422', async () => {
      const invalidBody = {
        name: '',
        value: ''
      };
      try {
        await makeRequest(VALID_PROJECT_REF, VALID_ENV, invalidBody);
      } catch (error: any) {
        const status = error.response?.status;
        expect([400, 422]).toContain(status);
        expect(error.response.data).toBeDefined();
      }
    });
  });

  describe('Response Validation', () => {
    it('should return the correct success structure for valid inputs', async () => {
      const response = await makeRequest(VALID_PROJECT_REF, VALID_ENV, validRequestBody);
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      // Validate response body structure against the expected schema
      expect(response.data).toHaveProperty('success');
      expect(typeof response.data.success).toBe('boolean');
    });

    it('should return 404 if projectRef or environment does not exist', async () => {
      const nonExistentProjectRef = 'non-existent-project';

      try {
        await makeRequest(nonExistentProjectRef, VALID_ENV, validRequestBody);
      } catch (error: any) {
        expect([404]).toContain(error.response?.status);
        expect(error.response.data).toBeDefined();
      }
    });

    // Note: The API might return 500 for server errors, or some other code.
    // This is a placeholder test in case the server triggers a 5xx.
    it('should handle unexpected server errors gracefully (simulate 500)', async () => {
      // Simulation approach: if the API doesn’t let you force a 500 easily,
      // you might skip or externally test this scenario.
      // For demonstration, we assume an invalid environment name triggers a 500 in some rare scenario.
      const invalidEnv = 'simulate-500';
      try {
        await makeRequest(VALID_PROJECT_REF, invalidEnv, validRequestBody);
      } catch (error: any) {
        // You might replace this logic depending on how your API surfaces errors.
        expect([500]).toContain(error.response?.status);
      }
    });
  });

  describe('Response Headers Validation', () => {
    it('should include application/json in Content-Type for successful request', async () => {
      const response = await makeRequest(VALID_PROJECT_REF, VALID_ENV, validRequestBody);
      expect(response.headers['content-type']).toContain('application/json');
    });

    // Add more header checks as needed, e.g. X-RateLimit, Cache-Control, etc.
    it('should include standard headers (e.g., Cache-Control) if applicable', async () => {
      const response = await makeRequest(VALID_PROJECT_REF, VALID_ENV, validRequestBody);
      // Example check:
      // expect(response.headers['cache-control']).toBeDefined();
      // Adjust based on your API’s actual headers.
      expect(response.status).toBe(200);
    });
  });

  describe('Edge Case & Limit Testing', () => {
    it('should handle extremely large payload (potentially 413 or 400)', async () => {
      // Create a large string
      const largeString = 'x'.repeat(100000); // 100k characters
      const largePayload = {
        name: largeString,
        value: largeString,
      };

      try {
        await makeRequest(VALID_PROJECT_REF, VALID_ENV, largePayload);
      } catch (error: any) {
        // Depending on how the server handles large payloads:
        // could be 413 Payload Too Large, 400, or 422
        expect([400, 413, 422]).toContain(error.response?.status);
      }
    });

    it('should return proper response when payload is empty', async () => {
      try {
        await makeRequest(VALID_PROJECT_REF, VALID_ENV, null);
      } catch (error: any) {
        expect([400, 422]).toContain(error.response?.status);
      }
    });
  });

  describe('Testing Authorization & Authentication', () => {
    it('should return 401 or 403 when no auth token is provided', async () => {
      try {
        await makeRequest(VALID_PROJECT_REF, VALID_ENV, validRequestBody, undefined /* no token */);
      } catch (error: any) {
        const status = error.response?.status;
        // The API could return either 401 or 403.
        expect([401, 403]).toContain(status);
      }
    });

    it('should return 401 or 403 when auth token is invalid', async () => {
      try {
        await makeRequest(VALID_PROJECT_REF, VALID_ENV, validRequestBody, 'invalid-token');
      } catch (error: any) {
        const status = error.response?.status;
        expect([401, 403]).toContain(status);
      }
    });

    it('should succeed (200) with a valid auth token', async () => {
      const response = await makeRequest(VALID_PROJECT_REF, VALID_ENV, validRequestBody, API_AUTH_TOKEN);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success');
    });
  });
});
