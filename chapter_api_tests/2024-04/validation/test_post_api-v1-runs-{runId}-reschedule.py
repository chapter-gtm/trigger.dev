import axios from 'axios';
import { AxiosInstance } from 'axios';

describe('POST /api/v1/runs/{runId}/reschedule', () => {
  let client: AxiosInstance;
  const baseUrl = process.env.API_BASE_URL;
  const authToken = process.env.API_AUTH_TOKEN;

  beforeAll(() => {
    client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });
  });

  describe('Input Validation tests', () => {
    it('should return 400 or 422 if runId is invalid', async () => {
      try {
        const invalidRunId = 'abc';
        await client.post(`/api/v1/runs/${invalidRunId}/reschedule`, {
          // Simulate a valid payload otherwise
          delay: 30,
        });
        fail(`Request should have failed with 400 or 422`);
      } catch (error: any) {
        expect([400, 422]).toContain(error.response.status);
        expect(error.response.data).toHaveProperty('error');
      }
    });

    it('should return 400 or 422 when required fields are missing', async () => {
      try {
        const runId = 123;
        // Missing "delay" field
        await client.post(`/api/v1/runs/${runId}/reschedule`, {});
        fail(`Request should have failed with 400 or 422`);
      } catch (error: any) {
        expect([400, 422]).toContain(error.response.status);
        expect(error.response.data).toHaveProperty('error');
      }
    });
  });

  describe('Successful Response tests', () => {
    it('should reschedule a delayed run with valid runId and payload', async () => {
      // Assuming runId 999 is in DELAYED state on the test system
      const runId = 999;
      const response = await client.post(`/api/v1/runs/${runId}/reschedule`, {
        delay: 60,
      });

      // Response Validation
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('status');
    });
  });

  describe('Authorization & Authentication tests', () => {
    it('should return 401 or 403 if auth token is missing or invalid', async () => {
      const runId = 123;
      const unauthorizedClient = axios.create({
        baseURL: baseUrl,
        headers: {
          'Content-Type': 'application/json',
          // No Authorization header
        },
      });

      try {
        await unauthorizedClient.post(`/api/v1/runs/${runId}/reschedule`, {
          delay: 50,
        });
        fail(`Request should have failed with 401 or 403`);
      } catch (error: any) {
        expect([401, 403]).toContain(error.response.status);
        expect(error.response.data).toHaveProperty('error');
      }
    });
  });

  describe('Resource not found tests', () => {
    it('should return 404 if the run does not exist', async () => {
      try {
        const nonExistentId = 9999999;
        await client.post(`/api/v1/runs/${nonExistentId}/reschedule`, {
          delay: 10,
        });
        fail(`Request should have failed with 404`);
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toHaveProperty('error');
      }
    });
  });

  describe('Edge Case & Limit Testing', () => {
    it('should handle large delay values', async () => {
      // Test a large numerical boundary for delay
      const runId = 999; // Assume DELAYED state
      const largeDelay = 9999999;
      const response = await client.post(`/api/v1/runs/${runId}/reschedule`, {
        delay: largeDelay,
      });
      // Depending on API handling, might be success or error
      expect([200, 400, 422]).toContain(response.status);
    });

    it('should return an error if the run is not in DELAYED state', async () => {
      // This runId is assumed not to be in DELAYED state
      const runId = 555;
      try {
        await client.post(`/api/v1/runs/${runId}/reschedule`, {
          delay: 20,
        });
        fail(`Request should have failed due to the run not being in DELAYED state`);
      } catch (error: any) {
        expect([400, 422]).toContain(error.response.status);
      }
    });
  });
});
