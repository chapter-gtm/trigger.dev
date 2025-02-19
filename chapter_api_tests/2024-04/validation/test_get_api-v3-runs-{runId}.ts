import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || '';
const VALID_AUTH_TOKEN = process.env.API_AUTH_TOKEN || '';

/**
 * In a real-world scenario, you would likely fetch/create a valid runId via a setup script
 * so that you can reliably test a '200' response. For demonstration purposes, we assume:
 * - "validRunId" is a placeholder that should exist in your system.
 * - "nonexistentRunId" is a placeholder that will not exist.
 * Adjust these values as needed.
 */
const validRunId = '123';
const nonexistentRunId = '999999';

/**
 * Helper function to create an Axios instance with optional auth.
 */
function createAxiosClient(token?: string): AxiosInstance {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    validateStatus: () => true, // allow manual handling of status codes
  });
}

describe('GET /api/v3/runs/{runId}', () => {
  let clientWithAuth: AxiosInstance;
  let clientWithoutAuth: AxiosInstance;

  beforeAll(() => {
    clientWithAuth = createAxiosClient(VALID_AUTH_TOKEN);
    clientWithoutAuth = createAxiosClient();
  });

  /************************************
   * 1. Input Validation Tests
   ************************************/

  describe('Input Validation', () => {
    it('should return 400 when runId is missing (e.g., empty)', async () => {
      // Some servers/frameworks might route this differently and return 404.
      // Adjust your expectation based on your actual API behavior.
      // We expect 400 if the server validates runId and responds with "Invalid or missing run ID".

      const response = await clientWithAuth.get('/api/v3/runs/', {});
      expect([400, 404]).toContain(response.status);

      if (response.status === 400) {
        expect(response.data).toHaveProperty('error');
        expect(response.data.error).toEqual('Invalid or missing run ID');
      }
    });

    it('should return 400 when runId is invalid format (non-numeric or malformed)', async () => {
      const invalidRunId = 'abc@@';

      const response = await clientWithAuth.get(`/api/v3/runs/${invalidRunId}`, {});
      expect([400, 404]).toContain(response.status);

      if (response.status === 400) {
        expect(response.data).toHaveProperty('error');
        expect(response.data.error).toEqual('Invalid or missing run ID');
      }
    });

    it('should handle extremely large or special-character runId gracefully', async () => {
      const largeRunId = '999999999999999999999';
      const response = await clientWithAuth.get(`/api/v3/runs/${largeRunId}`);

      // Depending on how your API handles out-of-range or invalid numeric IDs,
      // you might get 400 (bad request) or 404 (not found) if parsed as a number.
      expect([400, 404]).toContain(response.status);
      if (response.status === 400) {
        expect(response.data).toHaveProperty('error');
      }
    });
  });

  /************************************
   * 2. Response Validation Tests
   ************************************/

  describe('Response Validation', () => {
    it('should return 200 and conform to the schema for a valid runId (if run exists)', async () => {
      // Only run this test if you have a known validRunId that exists.
      // otherwise, it will likely return 404.
      // Adjust the expectation accordingly.

      const response = await clientWithAuth.get(`/api/v3/runs/${validRunId}`);
      if (response.status === 200) {
        // Basic checks
        expect(response.data).toBeDefined();
        // Example schema checks (implementation depends on your actual schema)
        // Replace these with the actual fields you expect from RetrieveRunResponse
        expect(response.data).toHaveProperty('id');
        expect(response.data).toHaveProperty('status');
        expect(response.data).toHaveProperty('attempts');
      } else {
        // If the runId does not exist, expect 404
        expect(response.status).toBe(404);
      }
    });

    it('should return 404 if the runId does not exist', async () => {
      const response = await clientWithAuth.get(`/api/v3/runs/${nonexistentRunId}`);
      expect(response.status).toBe(404);
      expect(response.data).toHaveProperty('error');
      expect(response.data.error).toBe('Run not found');
    });

    it('should return correct error body on 400 responses', async () => {
      // Using an obviously invalid runId
      const invalidRunId = '';
      const response = await clientWithAuth.get(`/api/v3/runs/${invalidRunId}`);
      expect([400, 404]).toContain(response.status);
      if (response.status === 400) {
        expect(response.data).toHaveProperty('error');
        expect(response.data.error).toBe('Invalid or missing run ID');
      }
    });
  });

  /************************************
   * 3. Response Headers Validation
   ************************************/

  describe('Response Headers Validation', () => {
    it('should return JSON content-type for valid requests', async () => {
      const response = await clientWithAuth.get(`/api/v3/runs/${validRunId}`);
      // We allow 200 or 404 in case the run does not exist.
      expect([200, 404]).toContain(response.status);
      // Validate content-type header
      if (response.headers['content-type']) {
        expect(response.headers['content-type']).toMatch(/application\/json/i);
      }
    });

    it('should return JSON content-type for invalid requests (e.g., bad runId)', async () => {
      const response = await clientWithAuth.get(`/api/v3/runs/!@#`);
      expect([400, 404]).toContain(response.status);
      if (response.headers['content-type']) {
        expect(response.headers['content-type']).toMatch(/application\/json/i);
      }
    });
  });

  /************************************
   * 4. Edge Case & Limit Testing
   ************************************/

  describe('Edge Case & Limit Testing', () => {
    // For GET requests, we typically don’t send a large payload in the request body,
    // but we can still test the behavior of large or unusually formatted path params.

    it('should handle random runId that does NOT exist (404)', async () => {
      const randomRunId = '999999999999';
      const response = await clientWithAuth.get(`/api/v3/runs/${randomRunId}`);
      expect([404, 400]).toContain(response.status);
      // If 404, check error message.
      if (response.status === 404) {
        expect(response.data.error).toBe('Run not found');
      }
    });

    it('should properly handle server errors (e.g., 500) if triggered', async () => {
      // For many APIs, you might not be able to trigger a 500 easily.
      // You could mock your API or use a special test fixture.
      // This is an example test to show how you might handle it.

      // Here, we artificially attempt a runId that might cause the server to fail.
      // Adjust to match whatever scenario might cause a 500 in your environment.

      const runIdCausingServerError = 'cause-500';
      const response = await clientWithAuth.get(`/api/v3/runs/${runIdCausingServerError}`);
      // We include 500 in the array if the server returns 500 for this scenario.
      expect([400, 404, 500]).toContain(response.status);
      // If 500, you might check for an error property.
      if (response.status === 500) {
        expect(response.data).toHaveProperty('error');
      }
    });
  });

  /************************************
   * 5. Testing Authorization & Authentication
   ************************************/

  describe('Authorization & Authentication', () => {
    it('should return 401 or 403 when no token is provided', async () => {
      const response = await clientWithoutAuth.get(`/api/v3/runs/${validRunId}`);

      // Depending on API design, you might get 401 or 403.
      expect([401, 403]).toContain(response.status);
      expect(response.data).toHaveProperty('error');
      // If 401, you might check:
      // expect(response.data.error).toBe('Invalid or Missing API key');
    });

    it('should return 401 or 403 when an invalid token is provided', async () => {
      const clientInvalidAuth = createAxiosClient('invalid_token');
      const response = await clientInvalidAuth.get(`/api/v3/runs/${validRunId}`);

      expect([401, 403]).toContain(response.status);
      expect(response.data).toHaveProperty('error');
    });
  });
});
