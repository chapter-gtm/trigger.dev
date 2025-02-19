import axios, { AxiosError } from 'axios';

describe('POST /api/v1/schedules/{schedule_id}/activate', () => {
  let baseUrl: string;
  let token: string;
  // Replace with real IDs if available/testable in your environment.
  let validScheduleId = 'valid_schedule_id';
  let nonImperativeScheduleId = 'non_imperative_schedule_id';
  let nonExistentScheduleId = 'non_existent_schedule_id';
  let largeScheduleId = 'x'.repeat(1000); // 1000 characters

  beforeAll(() => {
    // Load env vars for base URL and auth token.
    baseUrl = process.env.API_BASE_URL || '';
    token = process.env.API_AUTH_TOKEN || '';
  });

  const getHeaders = (authToken: string | null = token) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  };

  it('should activate the schedule with valid ID and return 200', async () => {
    expect(baseUrl).toBeTruthy();
    expect(token).toBeTruthy();

    const url = `${baseUrl}/api/v1/schedules/${validScheduleId}/activate`;

    const response = await axios.post(url, {}, {
      headers: getHeaders()
    });

    // Response Validation
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');

    // Optionally validate other headers
    // expect(response.headers['cache-control']).toBeDefined();
    // expect(response.headers['x-ratelimit']).toBeDefined();

    // Response body schema validation (partial example)
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('status');
    // Add further field/type checks as needed.
  });

  it('should return 401 or 403 when token is invalid', async () => {
    expect(baseUrl).toBeTruthy();

    const url = `${baseUrl}/api/v1/schedules/${validScheduleId}/activate`;

    try {
      await axios.post(url, {}, {
        headers: getHeaders('invalid_token')
      });
      fail('Request should have failed with 401 or 403');
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        expect([401, 403]).toContain(error.response.status);
      } else {
        throw error;
      }
    }
  });

  it('should return 401 or 403 when token is missing', async () => {
    expect(baseUrl).toBeTruthy();

    const url = `${baseUrl}/api/v1/schedules/${validScheduleId}/activate`;

    try {
      await axios.post(url, {}, {
        headers: getHeaders(null)
      });
      fail('Request should have failed with 401 or 403');
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        expect([401, 403]).toContain(error.response.status);
      } else {
        throw error;
      }
    }
  });

  it('should return 400 or 422 if schedule_id is empty', async () => {
    expect(baseUrl).toBeTruthy();
    expect(token).toBeTruthy();

    // Intentionally leave schedule_id empty.
    const url = `${baseUrl}/api/v1/schedules//activate`;

    try {
      await axios.post(url, {}, {
        headers: getHeaders()
      });
      fail('Request should have failed with 400 or 422');
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        expect([400, 422]).toContain(error.response.status);
      } else {
        throw error;
      }
    }
  });

  it('should return 400 or 422 if schedule_id is extremely large', async () => {
    expect(baseUrl).toBeTruthy();
    expect(token).toBeTruthy();

    const url = `${baseUrl}/api/v1/schedules/${largeScheduleId}/activate`;

    try {
      await axios.post(url, {}, {
        headers: getHeaders()
      });
      fail('Request should have failed with 400 or 422');
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        expect([400, 422]).toContain(error.response.status);
      } else {
        throw error;
      }
    }
  });

  it('should return 404 if the schedule_id does not exist', async () => {
    expect(baseUrl).toBeTruthy();
    expect(token).toBeTruthy();

    const url = `${baseUrl}/api/v1/schedules/${nonExistentScheduleId}/activate`;

    try {
      await axios.post(url, {}, {
        headers: getHeaders()
      });
      fail('Request should have failed with 404');
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        expect(error.response.status).toBe(404);
      } else {
        throw error;
      }
    }
  });

  it('should return 400 or 422 if the schedule is not IMPERATIVE', async () => {
    expect(baseUrl).toBeTruthy();
    expect(token).toBeTruthy();

    const url = `${baseUrl}/api/v1/schedules/${nonImperativeScheduleId}/activate`;

    try {
      await axios.post(url, {}, {
        headers: getHeaders()
      });
      fail('Request should have failed with 400 or 422');
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        expect([400, 422]).toContain(error.response.status);
      } else {
        throw error;
      }
    }
  });
});
