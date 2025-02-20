import axios, { AxiosInstance } from 'axios';
import { describe, expect, test, beforeAll } from '@jest/globals';

describe('POST /api/v2/runs/:runId/cancel', () => {
  let axiosInstance: AxiosInstance;
  const validRunId = 'run_1234'; // Sample run ID for a valid scenario
  const invalidRunId = 'invalid_run_id'; // Sample run ID for an invalid scenario
  const nonExistentRunId = 'run_non_existent'; // Sample run ID that doesn't exist

  beforeAll(() => {
    // create an axios instance with baseURL and default headers
    axiosInstance = axios.create({
      baseURL: process.env.API_BASE_URL
    });
  });

  test('Should cancel a run successfully (200) with a valid run ID', async () => {
    try {
      const response = await axiosInstance.post(`/api/v2/runs/${validRunId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${process.env.API_AUTH_TOKEN}`
        }
      });

      // Response status check
      expect(response.status).toBe(200);
      // Response headers check
      expect(response.headers['content-type']).toContain('application/json');
      // Response body schema check
      expect(response.data).toHaveProperty('id');
      expect(typeof response.data.id).toBe('string');
    } catch (error: any) {
      // If we get an error here, fail the test explicitly
      throw new Error(`Expected 200, but received error: ${error.message}`);
    }
  });

  test('Should return 400 or 422 when run ID is invalid', async () => {
    expect.assertions(1);

    try {
      await axiosInstance.post(`/api/v2/runs/${invalidRunId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${process.env.API_AUTH_TOKEN}`
        }
      });
    } catch (error: any) {
      if (error.response) {
        // Input validation error codes
        expect([400, 422]).toContain(error.response.status);
      } else {
        throw new Error(`Expected 400 or 422, but no valid response found. Error: ${error.message}`);
      }
    }
  });

  test('Should return 401 or 403 if the token is missing or invalid', async () => {
    expect.assertions(1);

    try {
      // No Authorization header provided
      await axiosInstance.post(`/api/v2/runs/${validRunId}/cancel`);
    } catch (error: any) {
      if (error.response) {
        // Unauthorized or forbidden
        expect([401, 403]).toContain(error.response.status);
      } else {
        throw new Error(`Expected 401 or 403, but no valid response found. Error: ${error.message}`);
      }
    }
  });

  test('Should return 404 if the run ID does not exist', async () => {
    expect.assertions(2);

    try {
      await axiosInstance.post(`/api/v2/runs/${nonExistentRunId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${process.env.API_AUTH_TOKEN}`
        }
      });
    } catch (error: any) {
      if (error.response) {
        // Resource not found
        expect(error.response.status).toBe(404);
        expect(error.response.data).toHaveProperty('error', 'Run not found');
      } else {
        throw new Error(`Expected 404, but no valid response found. Error: ${error.message}`);
      }
    }
  });

  test('Should validate response headers (Content-Type is application/json)', async () => {
    try {
      const response = await axiosInstance.post(`/api/v2/runs/${validRunId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${process.env.API_AUTH_TOKEN}`
        }
      });

      expect(response.headers['content-type']).toMatch(/application\/json/i);
    } catch (error: any) {
      throw new Error(`Error occurred: ${error.message}`);
    }
  });

  test('Should handle server errors (500) gracefully if triggered', async () => {
    expect.assertions(1);

    // This test presumes there's a way to force a 500 from the server.
    // For demonstration purposes, we'll just illustrate how the test would look.
    try {
      await axiosInstance.post('/api/v2/runs/trigger_500_error/cancel', {}, {
        headers: {
          Authorization: `Bearer ${process.env.API_AUTH_TOKEN}`
        }
      });
    } catch (error: any) {
      if (error.response) {
        expect(error.response.status).toBe(500);
      } else {
        throw new Error(`Expected 500, but no valid response found. Error: ${error.message}`);
      }
    }
  });
});