import axios from 'axios';
import { AxiosResponse } from 'axios';

describe('PUT /api/v1/schedules/{schedule_id}', () => {
  let baseURL: string;
  let authToken: string;
  let validScheduleId: string;

  beforeAll(() => {
    // Load base URL and auth token from environment variables
    baseURL = process.env.API_BASE_URL || '';
    authToken = process.env.API_AUTH_TOKEN || '';

    // For demonstration purposes, use a hardcoded or pre-created schedule ID.
    // In a real test, you might retrieve this via a setup step.
    validScheduleId = 'some-valid-schedule-id';
  });

  it('should update a schedule successfully with valid payload', async () => {
    const url = `${baseURL}/api/v1/schedules/${validScheduleId}`;
    const requestData = {
      name: 'Updated Schedule',
      type: 'IMPERATIVE',
      // Include other valid fields as necessary
    };

    const response: AxiosResponse = await axios.put(url, requestData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Response status check
    expect(response.status).toBe(200);
    // Header validation
    expect(response.headers['content-type']).toContain('application/json');
    // Basic body validation (adjust to actual schema)
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('name');
    expect(response.data.name).toBe('Updated Schedule');
  });

  it('should return 400 or 422 for invalid request payload', async () => {
    const url = `${baseURL}/api/v1/schedules/${validScheduleId}`;
    // Example of invalid payload: wrong data type for 'name'
    const invalidRequestData = {
      name: 12345,
    };

    try {
      await axios.put(url, invalidRequestData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      fail('Request should have failed with status 400 or 422');
    } catch (error: any) {
      // Validate that we see one of the expected errors
      expect([400, 422]).toContain(error.response.status);
    }
  });

  it('should return 401 or 403 for unauthorized or forbidden request', async () => {
    const url = `${baseURL}/api/v1/schedules/${validScheduleId}`;
    const validData = {
      name: 'Attempted Update without Auth',
      type: 'IMPERATIVE',
    };

    try {
      // Missing Authorization header
      await axios.put(url, validData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      fail('Request should have failed with status 401 or 403');
    } catch (error: any) {
      expect([401, 403]).toContain(error.response.status);
    }
  });

  it('should return 404 if the schedule does not exist', async () => {
    const url = `${baseURL}/api/v1/schedules/non-existing-schedule-id`;
    const requestData = {
      name: 'Does Not Exist',
      type: 'IMPERATIVE',
    };

    try {
      await axios.put(url, requestData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      fail('Request should have failed with status 404');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  it('should return 400, 404, or 422 if path parameter is empty or invalid', async () => {
    // Intentionally omitting the schedule_id
    const url = `${baseURL}/api/v1/schedules/`;
    const requestData = {
      name: 'Should Fail',
      type: 'IMPERATIVE',
    };

    try {
      await axios.put(url, requestData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      fail('Request should have failed due to invalid path');
    } catch (error: any) {
      expect([400, 404, 422]).toContain(error.response.status);
    }
  });

  it('should return 400 or 422 for empty request body', async () => {
    const url = `${baseURL}/api/v1/schedules/${validScheduleId}`;

    try {
      // Send an empty object
      await axios.put(url, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      fail('Request should have failed with status 400 or 422');
    } catch (error: any) {
      expect([400, 422]).toContain(error.response.status);
    }
  });

  it('should handle large payload (if supported)', async () => {
    const url = `${baseURL}/api/v1/schedules/${validScheduleId}`;
    const largeName = 'A'.repeat(10000); // Extra-large string
    const requestData = {
      name: largeName,
      type: 'IMPERATIVE',
    };

    try {
      const response: AxiosResponse = await axios.put(url, requestData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      // Some endpoints might accept large payloads; others might reject them.
      // Check plausible success or error codes.
      expect([200, 400, 413]).toContain(response.status);
    } catch (error: any) {
      if (error.response) {
        // Validate typical error codes: 400, 413, or 422
        expect([400, 413, 422]).toContain(error.response.status);
      } else {
        // Re-throw if there's a network or unexpected error
        throw error;
      }
    }
  });
});