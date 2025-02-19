import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
const authToken = process.env.API_AUTH_TOKEN || '';

describe('POST /api/v1/schedules', () => {
  // Helper function to create an Axios instance
  const createAxiosInstance = (token?: string) => {
    return axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      validateStatus: () => true, // Allows us to handle non-2xx status codes in tests
    });
  };

  // A valid payload conforming to a hypothetical ScheduleObject schema
  // Adjust this payload as necessary to match your actual schema requirements
  const validSchedulePayload = {
    type: 'IMPERATIVE',
    name: 'Test Schedule',
    frequency: 'daily',
    startTime: '2023-09-10T10:00:00Z',
    endTime: '2023-09-10T11:00:00Z',
  };

  it('should create a schedule with valid data (expect 200)', async () => {
    const axiosInstance = createAxiosInstance(authToken);

    const response = await axiosInstance.post('/api/v1/schedules', validSchedulePayload);

    // Response Validation
    expect([200]).toContain(response.status);
    expect(response.headers['content-type']).toContain('application/json');
    // Here you can add more specific checks based on the schema of the response
    // e.g. if the schema requires an 'id' field, you could do:
    // expect(response.data).toHaveProperty('id');
    // expect(response.data).toHaveProperty('type', 'IMPERATIVE');
  });

  it('should return 400 or 422 for missing required fields', async () => {
    const axiosInstance = createAxiosInstance(authToken);

    // Missing the 'name' field
    const invalidPayload = {
      type: 'IMPERATIVE',
      frequency: 'daily',
      startTime: '2023-09-10T10:00:00Z',
      endTime: '2023-09-10T11:00:00Z',
    };

    const response = await axiosInstance.post('/api/v1/schedules', invalidPayload);

    expect([400, 422]).toContain(response.status);
  });

  it('should return 400 or 422 for invalid parameter types', async () => {
    const axiosInstance = createAxiosInstance(authToken);

    // Invalid type for 'frequency' (should be string but provided as number)
    const invalidPayload = {
      ...validSchedulePayload,
      frequency: 12345,
    };

    const response = await axiosInstance.post('/api/v1/schedules', invalidPayload);

    expect([400, 422]).toContain(response.status);
  });

  it('should handle large payloads (expect success or appropriate error code)', async () => {
    const axiosInstance = createAxiosInstance(authToken);

    // Create a large string for testing
    const largeString = 'a'.repeat(10000); // Adjust size as needed

    const largePayload = {
      ...validSchedulePayload,
      description: largeString,
    };

    const response = await axiosInstance.post('/api/v1/schedules', largePayload);

    // Depending on server logic, it might accept or reject large payloads
    // If accepted, might return 200; if not, might return 413, 400, or another code
    // Adjust expectations based on your API's behavior
    expect([200, 400, 413, 422]).toContain(response.status);
  });

  it('should return 401 or 403 if no auth token is provided', async () => {
    const axiosInstance = createAxiosInstance(); // No token passed

    const response = await axiosInstance.post('/api/v1/schedules', validSchedulePayload);

    // Unauthorized or forbidden
    expect([401, 403]).toContain(response.status);
  });

  it('should return 401 or 403 if an invalid auth token is provided', async () => {
    const axiosInstance = createAxiosInstance('InvalidToken');

    const response = await axiosInstance.post('/api/v1/schedules', validSchedulePayload);

    // Unauthorized or forbidden
    expect([401, 403]).toContain(response.status);
  });

  it('should handle empty payload gracefully (expect 400 or 422)', async () => {
    const axiosInstance = createAxiosInstance(authToken);

    const response = await axiosInstance.post('/api/v1/schedules', {});

    // Missing all required fields, expecting 400 or 422
    expect([400, 422]).toContain(response.status);
  });

  it('should validate response headers correctly for a valid request', async () => {
    const axiosInstance = createAxiosInstance(authToken);

    const response = await axiosInstance.post('/api/v1/schedules', validSchedulePayload);

    // Verify Content-Type is application/json
    expect(response.headers['content-type']).toContain('application/json');
    // Check other potential headers if applicable, e.g. Cache-Control, X-RateLimit
    // expect(response.headers).toHaveProperty('cache-control');
    // expect(response.headers).toHaveProperty('x-ratelimit-limit');
  });

  it('should handle server errors (simulated check for 500)', async () => {
    // Forcing a 500 is highly dependent on the API. If you have a scenario that
    // triggers an internal server error, you can test it here. In many cases,
    // you might mock the server response or handle a known failure scenario.
    // The following lines demonstrate how you would handle an error gracefully.
    const axiosInstance = createAxiosInstance(authToken);

    try {
      // Attempting to trigger error by sending unexpected data
      const response = await axiosInstance.post('/api/v1/schedules', { unexpectedKey: 'foo' });
      // Not guaranteed to throw or return 500. Adjust based on your API.
      expect([500, 400, 422]).toContain(response.status);
    } catch (error) {
      const axiosError = error as AxiosError;
      // If the request fails and throws, handle it here
      if (axiosError.response) {
        expect(axiosError.response.status).toBe(500);
      } else {
        throw error;
      }
    }
  });
});
