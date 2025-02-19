import axios from 'axios';
import { describe, it, expect } from '@jest/globals';

describe('POST /api/v1/runs/{runId}/reschedule', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
  const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN || 'test-token';

  const validRunId = '12345';
  const nonExistentRunId = '99999';
  const invalidRunId = 'abc';
  const delayedRunId = 'delayedRun123'; // Suppose this run is actually in DELAYED state

  // Example request body for updating the delay (assuming it expects a field "delayInSeconds")
  const validPayload = {
    delayInSeconds: 60,
  };

  // Utility function for setting headers
  const getHeaders = (token?: string) => {
    return {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  };

  // 1. Successful Reschedule - Valid Input
  it('should reschedule a delayed run (status 200) with valid runId and payload', async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/runs/${delayedRunId}/reschedule`,
        validPayload,
        {
          headers: getHeaders(API_AUTH_TOKEN),
        }
      );

      // Response status and header checks
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');

      // Basic response body validation (example checks)
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('status');
      // Additional schema checks for RetrieveRunResponse can be added here.
    } catch (error) {
      // If an error is thrown, fail the test
      throw error;
    }
  });

  // 2. Invalid Payload (e.g., negative delay)
  it('should return 400 or 422 when the payload is invalid', async () => {
    const invalidPayload = {
      delayInSeconds: -1, // negative value is invalid
    };

    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/runs/${delayedRunId}/reschedule`,
        invalidPayload,
        {
          headers: getHeaders(API_AUTH_TOKEN),
        }
      );

      // We expect an error, so if we get here, the test fails.
      fail('Expected a 400 or 422 error for invalid payload, but the request succeeded.');
    } catch (error: any) {
      // Confirm we got the correct error status
      const status = error.response?.status;
      expect([400, 422]).toContain(status);
      // Check error body
      expect(error.response?.data).toHaveProperty('error');
    }
  });

  // 3. Invalid Path Parameter (non-numeric or malformed runId)
  it('should return 400 for invalid path parameter (non-numeric runId)', async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/runs/${invalidRunId}/reschedule`,
        validPayload,
        {
          headers: getHeaders(API_AUTH_TOKEN),
        }
      );

      fail('Expected a 400 error for invalid runId, but the request succeeded.');
    } catch (error: any) {
      const status = error.response?.status;
      expect(status).toBe(400);
      expect(error.response?.data).toHaveProperty('error');
    }
  });

  // 4. Non-existent Run
  it('should return 404 if the run does not exist', async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/runs/${nonExistentRunId}/reschedule`,
        validPayload,
        {
          headers: getHeaders(API_AUTH_TOKEN),
        }
      );

      fail('Expected a 404 error for non-existent run, but the request succeeded.');
    } catch (error: any) {
      const status = error.response?.status;
      expect(status).toBe(404);
      expect(error.response?.data).toHaveProperty('error');
    }
  });

  // 5. Authorization & Authentication Tests
  it('should return 401 or 403 if the authorization token is missing or invalid', async () => {
    // Missing token
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/runs/${validRunId}/reschedule`,
        validPayload,
        {
          headers: getHeaders(''), // empty token
        }
      );

      fail('Expected a 401 or 403 error for missing token, but the request succeeded.');
    } catch (error: any) {
      const status = error.response?.status;
      expect([401, 403]).toContain(status);
      expect(error.response?.data).toHaveProperty('error');
    }

    // Invalid token
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/runs/${validRunId}/reschedule`,
        validPayload,
        {
          headers: getHeaders('invalid-token'),
        }
      );

      fail('Expected a 401 or 403 error for invalid token, but the request succeeded.');
    } catch (error: any) {
      const status = error.response?.status;
      expect([401, 403]).toContain(status);
      expect(error.response?.data).toHaveProperty('error');
    }
  });

  // 6. Run Not in DELAYED State
  it('should handle cases where the run is not in DELAYED state (return 400)', async () => {
    const notDelayedRunId = 'activeRun123';

    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/runs/${notDelayedRunId}/reschedule`,
        validPayload,
        {
          headers: getHeaders(API_AUTH_TOKEN),
        }
      );

      fail('Expected a 400 error if run is not in DELAYED state, but request succeeded.');
    } catch (error: any) {
      const status = error.response?.status;
      expect(status).toBe(400);
      expect(error.response?.data).toHaveProperty('error');
    }
  });

  // 7. Large or Boundary Values for Delay
  it('should handle large values for delayInSeconds', async () => {
    const largePayload = {
      delayInSeconds: 999999999,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/runs/${delayedRunId}/reschedule`,
        largePayload,
        {
          headers: getHeaders(API_AUTH_TOKEN),
        }
      );

      // The API might allow large values or reject them with 400/422.
      expect([200, 400, 422]).toContain(response.status);
      expect(response.headers['content-type']).toContain('application/json');
    } catch (error: any) {
      // If it rejects, it should be 400/422.
      if (error.response) {
        const status = error.response.status;
        expect([400, 422]).toContain(status);
      } else {
        throw error; // Other network/unknown errors
      }
    }
  });
});
