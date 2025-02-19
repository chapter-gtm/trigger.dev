import axios, { AxiosInstance } from 'axios';
describe('POST /api/v1/schedules', () => {
  let axiosInstance: AxiosInstance;

  beforeAll(() => {
    axiosInstance = axios.create({
      baseURL: process.env.API_BASE_URL,
      headers: {
        Authorization: 'Bearer ' + (process.env.API_AUTH_TOKEN || ''),
        'Content-Type': 'application/json',
      },
    });
  });

  // 1. Valid payload -> Expect 200
  it('should create a schedule with valid payload and respond with 200', async () => {
    const validSchedule = {
      name: 'Test Schedule',
      type: 'IMPERATIVE',
      description: 'This is a test schedule',
      startDate: '2023-10-10T00:00:00Z',
      endDate: '2023-10-11T00:00:00Z',
    };

    const response = await axiosInstance.post('/api/v1/schedules', validSchedule);
    expect(response.status).toBe(200);
    // 2. Response Validation
    expect(response.data).toHaveProperty('id');
    expect(response.data.name).toBe(validSchedule.name);
    // 3. Response Headers Validation
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  // 1. Missing required fields -> Expect 400 or 422
  it('should return 400 or 422 when required fields are missing', async () => {
    const invalidSchedule = {
      // 'name' is required but missing
      type: 'IMPERATIVE',
    };

    try {
      await axiosInstance.post('/api/v1/schedules', invalidSchedule);
      fail('Request should have thrown an error');
    } catch (error: any) {
      expect([400, 422]).toContain(error.response.status);
    }
  });

  // 1. Invalid data types -> Expect 400 or 422
  it('should return 400 or 422 for invalid data types', async () => {
    const invalidSchedule = {
      name: 12345, // should be string
      type: 'IMPERATIVE',
    };

    try {
      await axiosInstance.post('/api/v1/schedules', invalidSchedule);
      fail('Request should have thrown an error');
    } catch (error: any) {
      expect([400, 422]).toContain(error.response.status);
    }
  });

  // 5. Authorization & Authentication -> Expect 401 or 403
  it('should return 401 or 403 for unauthorized requests', async () => {
    const validSchedule = {
      name: 'Unauthorized Schedule',
      type: 'IMPERATIVE',
    };

    try {
      await axios.post((process.env.API_BASE_URL || '') + '/api/v1/schedules', validSchedule, {
        headers: {
          Authorization: 'Bearer invalid_token',
          'Content-Type': 'application/json',
        },
      });
      fail('Request should have thrown an error');
    } catch (error: any) {
      expect([401, 403]).toContain(error.response.status);
    }
  });

  // 4. Edge Case: Large payload -> Expect possible 400 or 422
  it('should handle large payload gracefully', async () => {
    const longString = 'x'.repeat(10000);
    const invalidSchedule = {
      name: longString,
      type: 'IMPERATIVE',
    };

    try {
      await axiosInstance.post('/api/v1/schedules', invalidSchedule);
      // Depending on service limits, might succeed or return an error.
    } catch (error: any) {
      expect([400, 422]).toContain(error.response.status);
    }
  });
});