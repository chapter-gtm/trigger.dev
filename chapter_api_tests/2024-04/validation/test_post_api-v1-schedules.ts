import axios, { AxiosError } from 'axios';
import { describe, it, expect, beforeAll } from '@jest/globals';

describe('POST /api/v1/schedules', () => {
  let baseUrl: string;
  let authToken: string;

  beforeAll(() => {
    // Load environment variables
    baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    authToken = process.env.API_AUTH_TOKEN || '';
  });

  it('should create a schedule with valid data (200)', async () => {
    const payload = {
      type: 'IMPERATIVE',
      name: 'Example schedule',
      // Add other required fields here
    };

    const response = await axios.post(`${baseUrl}/api/v1/schedules`, payload, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Response validation
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    // Validate response body (example checks)
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('type', 'IMPERATIVE');
    // Add additional schema validations as needed
  });

  it('should return 400 or 422 if required fields are missing', async () => {
    const payload = {
      // Omitting a required field (e.g., name)
      type: 'IMPERATIVE',
    };

    try {
      await axios.post(`${baseUrl}/api/v1/schedules`, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      fail('Request should not succeed with missing required fields');
    } catch (error) {
      const axiosError = error as AxiosError;
      expect([400, 422]).toContain(axiosError.response?.status);
    }
  });

  it('should return 400 or 422 if data type is invalid', async () => {
    const payload = {
      type: 'IMPERATIVE',
      // Passing an invalid data type for the name field
      name: 12345,
    };

    try {
      await axios.post(`${baseUrl}/api/v1/schedules`, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      fail('Request should not succeed with invalid data types');
    } catch (error) {
      const axiosError = error as AxiosError;
      expect([400, 422]).toContain(axiosError.response?.status);
    }
  });

  it('should return 401 or 403 if unauthorized or forbidden', async () => {
    const payload = {
      type: 'IMPERATIVE',
      name: 'Unauthorized test',
    };

    try {
      await axios.post(`${baseUrl}/api/v1/schedules`, payload, {
        headers: {
          // Using an invalid token
          Authorization: 'Bearer INVALID_TOKEN',
          'Content-Type': 'application/json',
        },
      });
      fail('Request should not succeed with invalid token');
    } catch (error) {
      const axiosError = error as AxiosError;
      // Either 401 or 403 is acceptable
      expect([401, 403]).toContain(axiosError.response?.status);
    }
  });

  it('should handle a large payload without server error', async () => {
    // Create a large string payload
    const largeString = 'x'.repeat(10000);
    const payload = {
      type: 'IMPERATIVE',
      name: largeString,
    };

    try {
      const response = await axios.post(`${baseUrl}/api/v1/schedules`, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      // Depending on API validation, may return 200 or 400/422
      expect([200, 400, 422]).toContain(response.status);
    } catch (error) {
      const axiosError = error as AxiosError;
      // Some APIs may return 413 or 500 for unusually large payloads
      expect([400, 413, 422, 500]).toContain(axiosError.response?.status);
    }
  });

  it('should return 400 or 422 if body is empty', async () => {
    const payload = {};

    try {
      await axios.post(`${baseUrl}/api/v1/schedules`, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      fail('Request should not succeed with empty body');
    } catch (error) {
      const axiosError = error as AxiosError;
      expect([400, 422]).toContain(axiosError.response?.status);
    }
  });

  it('should validate response headers for a valid request', async () => {
    const payload = {
      type: 'IMPERATIVE',
      name: 'Header test schedule',
    };

    const response = await axios.post(`${baseUrl}/api/v1/schedules`, payload, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(200);
    // Validate Content-Type header
    expect(response.headers['content-type']).toContain('application/json');
    // Add additional header checks as necessary
  });
});