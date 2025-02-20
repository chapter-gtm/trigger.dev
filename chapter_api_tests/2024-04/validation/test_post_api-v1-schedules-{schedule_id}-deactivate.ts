import axios from 'axios';
import { describe, it, expect, beforeAll } from '@jest/globals';

/**
 * Jest test suite for the POST /api/v1/schedules/:schedule_id/deactivate endpoint.
 * This suite covers:
 * 1. Input Validation
 * 2. Response Validation
 * 3. Response Headers Validation
 * 4. Edge Case & Limit Testing
 * 5. Authorization & Authentication Testing
 *
 * Prerequisites:
 * - Set environment variables API_BASE_URL and API_AUTH_TOKEN.
 * - The API might return 400 or 422 for invalid inputs.
 * - The API might return 401 or 403 for unauthorized or forbidden requests.
 */

describe('POST /api/v1/schedules/:schedule_id/deactivate', () => {
  let baseUrl: string;
  let token: string;

  beforeAll(() => {
    baseUrl = process.env.API_BASE_URL || '';
    token = process.env.API_AUTH_TOKEN || '';
  });

  it('should deactivate a schedule successfully with a valid schedule_id (expect 200)', async () => {
    // Replace with a known-valid schedule ID
    const validScheduleId = 'someExistingImperativeScheduleId';
    let response: any;

    try {
      response = await axios.post(
        `${baseUrl}/api/v1/schedules/${validScheduleId}/deactivate`,
        null,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          }
        }
      );
    } catch (error: any) {
      // If we catch an error, the test fails
      expect(error).toBeFalsy();
    }

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    // Basic response body validation
    expect(response.data).toBeDefined();
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('name');
    expect(response.data).toHaveProperty('status');

    // Response header validation
    expect(response.headers['content-type']).toContain('application/json');
  });

  it('should return 401 or 403 for an invalid or missing auth token', async () => {
    // Replace with a known-valid schedule ID
    const validScheduleId = 'someExistingImperativeScheduleId';
    let error: any;

    try {
      // Provide an invalid token
      await axios.post(
        `${baseUrl}/api/v1/schedules/${validScheduleId}/deactivate`,
        null,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer invalid_or_missing_token'
          }
        }
      );
    } catch (err: any) {
      error = err;
    }

    expect(error).toBeDefined();
    // Could be 401 or 403
    expect([401, 403]).toContain(error?.response?.status);
  });

  it('should return 404 if the schedule is not found', async () => {
    const notFoundScheduleId = 'thisScheduleDoesNotExist';
    let error: any;

    try {
      await axios.post(
        `${baseUrl}/api/v1/schedules/${notFoundScheduleId}/deactivate`,
        null,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          }
        }
      );
    } catch (err: any) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.response?.status).toBe(404);
  });

  it('should return 400 or 422 when schedule_id is invalid (e.g. empty string)', async () => {
    // Using whitespace or empty string to simulate invalid input
    const invalidScheduleId = '   ';
    let error: any;

    try {
      await axios.post(
        `${baseUrl}/api/v1/schedules/${invalidScheduleId}/deactivate`,
        null,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          }
        }
      );
    } catch (err: any) {
      error = err;
    }

    expect(error).toBeDefined();
    // Could be 400 or 422
    expect([400, 422]).toContain(error?.response?.status);
  });

  it('should handle a large schedule_id (likely 400, 422, or 404)', async () => {
    // Very long fake schedule_id
    const largeScheduleId = 'a'.repeat(256);
    let error: any;

    try {
      await axios.post(
        `${baseUrl}/api/v1/schedules/${largeScheduleId}/deactivate`,
        null,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          }
        }
      );
    } catch (err: any) {
      error = err;
    }

    expect(error).toBeDefined();
    // Could be 400, 422, or 404 depending on server-side validation
    expect([400, 422, 404]).toContain(error?.response?.status);
  });

  it('should return 401 or 403 if the user is not authenticated at all', async () => {
    // Attempt request without any Authorization header
    const validScheduleId = 'someExistingImperativeScheduleId';
    let error: any;

    try {
      await axios.post(
        `${baseUrl}/api/v1/schedules/${validScheduleId}/deactivate`,
        null,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (err: any) {
      error = err;
    }

    expect(error).toBeDefined();
    // Could be 401 or 403
    expect([401, 403]).toContain(error?.response?.status);
  });
});
