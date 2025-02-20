import axios, { AxiosResponse } from 'axios';
import { describe, it, expect } from '@jest/globals';

/**
 * Jest test suite for POST /api/v1/schedules.
 * This suite covers:
 * 1. Input Validation (required params, data types, edge cases)
 * 2. Response Validation (status codes, schema, error handling)
 * 3. Response Headers Validation (Content-Type, etc.)
 * 4. Edge Case & Limit Testing (large payload, boundary values, invalid requests)
 * 5. Testing Authorization & Authentication
 */

describe('POST /api/v1/schedules', () => {
  const baseURL = process.env.API_BASE_URL;
  const authToken = process.env.API_AUTH_TOKEN;

  // Helper function to build the request config (including Authorization header)
  const buildConfig = (token?: string) => {
    return {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  };

  // A valid payload conforming to the (hypothetical) required schema for creating an IMPERATIVE schedule.
  // Adjust the fields to match your actual ScheduleObject schema.
  const validPayload = {
    name: 'My IMPERATIVE Schedule',
    type: 'IMPERATIVE',
    startDate: '2023-12-31T00:00:00Z',
    endDate: '2024-01-07T00:00:00Z',
    repeat: false,
  };

  // Utility for checking expected properties in the response body.
  // Adjust to match your actual schema structure.
  const validateScheduleObject = (data: any) => {
    // Example checks based on hypothetical "ScheduleObject" schema:
    expect(data).toHaveProperty('id');
    expect(typeof data.id).toBe('string');
    expect(data).toHaveProperty('name');
    expect(typeof data.name).toBe('string');
    expect(data).toHaveProperty('type');
    expect(data.type).toBe('IMPERATIVE');
  };

  it('should create a new schedule with valid payload (200)', async () => {
    expect(baseURL).toBeDefined();
    expect(authToken).toBeDefined();

    const url = `${baseURL}/api/v1/schedules`;

    const response: AxiosResponse = await axios.post(url, validPayload, buildConfig(authToken));

    // Response validation
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');

    // Validate the response body against the expected schema
    validateScheduleObject(response.data);
  });

  it('should return 400 or 422 if required fields are missing', async () => {
    const url = `${baseURL}/api/v1/schedules`;
    // Remove a required field (e.g., "type") from the payload
    const invalidPayload = { ...validPayload };
    delete invalidPayload.type;

    try {
      await axios.post(url, invalidPayload, buildConfig(authToken));
      // If we reach here, no error was thrown, which is unexpected
      throw new Error('Expected request to fail with 400 or 422, but it succeeded.');
    } catch (error: any) {
      expect(error.response).toBeDefined();
      expect([400, 422]).toContain(error.response.status);
    }
  });

  it('should return 400 or 422 if an invalid data type is provided', async () => {
    const url = `${baseURL}/api/v1/schedules`;
    // Provide an invalid "name" type (number instead of string)
    const invalidPayload = { ...validPayload, name: 12345 };

    try {
      await axios.post(url, invalidPayload, buildConfig(authToken));
      throw new Error('Expected request to fail with 400 or 422, but it succeeded.');
    } catch (error: any) {
      expect(error.response).toBeDefined();
      expect([400, 422]).toContain(error.response.status);
    }
  });

  it('should return 401 or 403 if the request is unauthorized', async () => {
    const url = `${baseURL}/api/v1/schedules`;

    try {
      // No auth token provided
      await axios.post(url, validPayload, buildConfig());
      throw new Error('Expected 401 or 403 for unauthorized request, but it succeeded.');
    } catch (error: any) {
      expect(error.response).toBeDefined();
      expect([401, 403]).toContain(error.response.status);
    }
  });

  it('should handle large payload or boundary cases gracefully (400 or 422)', async () => {
    const url = `${baseURL}/api/v1/schedules`;
    // Construct an extremely long string for name
    const largeString = 'a'.repeat(2000); // Example boundary test
    const boundaryPayload = { ...validPayload, name: largeString };

    try {
      await axios.post(url, boundaryPayload, buildConfig(authToken));
      // Depending on API constraints, this may succeed or fail.
      // If your schema disallows long strings, expect an error.
      // Failing here simply ensures we handle whichever the spec dictates.
    } catch (error: any) {
      // If it fails, 400 or 422 is acceptable.
      if (error.response) {
        expect([400, 422]).toContain(error.response.status);
      } else {
        // If no response, it might be a server/network error.
        throw error;
      }
    }
  });

  it('should return appropriate error code when sending empty request body (400 or 422)', async () => {
    const url = `${baseURL}/api/v1/schedules`;

    try {
      await axios.post(url, {}, buildConfig(authToken));
      throw new Error('Expected 400 or 422 for empty request body, but it succeeded.');
    } catch (error: any) {
      expect(error.response).toBeDefined();
      expect([400, 422]).toContain(error.response.status);
    }
  });

  // Additional tests can be added for:
  // - server errors (5xx) handling
  // - rate limiting scenarios
  // - forbidden (403) with valid token but insufficient permissions (if applicable)
  // - etc.
});
