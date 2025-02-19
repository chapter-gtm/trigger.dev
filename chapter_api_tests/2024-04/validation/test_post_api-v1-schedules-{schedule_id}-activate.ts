import axios, { AxiosInstance } from 'axios';

const baseUrl = process.env.API_BASE_URL;
const token = process.env.API_AUTH_TOKEN;

describe('POST /api/v1/schedules/{schedule_id}/activate', () => {
  let client: AxiosInstance;

  beforeAll(() => {
    client = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
  });

  describe('Input Validation', () => {
    test('should return 400 or 422 when schedule_id is invalid (e.g. empty string)', async () => {
      const invalidScheduleId = '';
      try {
        await client.post(`/api/v1/schedules/${invalidScheduleId}/activate`);
        fail('Expected an error, but got success response');
      } catch (error: any) {
        expect([400, 422]).toContain(error.response.status);
      }
    });

    test('should return 400 or 422 when schedule_id is a bad format (e.g. malformed string)', async () => {
      const invalidScheduleId = '!!!@@@';
      try {
        await client.post(`/api/v1/schedules/${invalidScheduleId}/activate`);
        fail('Expected an error, but got success response');
      } catch (error: any) {
        expect([400, 422]).toContain(error.response.status);
      }
    });
  });

  describe('Response Validation', () => {
    test('should activate schedule successfully with a valid schedule_id', async () => {
      // Replace with a valid imperative schedule ID known to exist
      const validScheduleId = 'some_existing_imperative_schedule_id';

      const response = await client.post(`/api/v1/schedules/${validScheduleId}/activate`);
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      // Validate response body structure (example checks below)
      expect(response.data).toHaveProperty('id', validScheduleId);
      expect(response.data).toHaveProperty('status', 'ACTIVE');
      // Additional schema validations can be added here
    });
  });

  describe('Response Headers Validation', () => {
    test('should include relevant response headers', async () => {
      // Replace with a valid imperative schedule ID known to exist
      const validScheduleId = 'some_existing_imperative_schedule_id';

      const response = await client.post(`/api/v1/schedules/${validScheduleId}/activate`);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      // If the API includes other headers like cache-control or rate-limiting, add tests here
      // Example: expect(response.headers).toHaveProperty('cache-control');
    });
  });

  describe('Edge Case & Limit Testing', () => {
    test('should return 404 if schedule is not found', async () => {
      const nonExistentScheduleId = 'non-existent-schedule-id';
      try {
        await client.post(`/api/v1/schedules/${nonExistentScheduleId}/activate`);
        fail('Expected 404 Not Found, but received success response');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    test('should handle large schedule_id gracefully', async () => {
      // Use an artificially large schedule ID
      const largeScheduleId = 'a'.repeat(1000);
      try {
        await client.post(`/api/v1/schedules/${largeScheduleId}/activate`);
        fail('Expected an error, but got success response');
      } catch (error: any) {
        // Could be 400, 422, or 404 depending on implementation
        expect([400, 422, 404]).toContain(error.response.status);
      }
    });
  });

  describe('Testing Authorization & Authentication', () => {
    test('should return 401 or 403 if token is missing', async () => {
      const tempClient = axios.create({
        baseURL: baseUrl,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // Replace with a valid imperative schedule ID
      const validScheduleId = 'some_existing_imperative_schedule_id';

      try {
        await tempClient.post(`/api/v1/schedules/${validScheduleId}/activate`);
        fail('Expected a 401 or 403 error');
      } catch (error: any) {
        expect([401, 403]).toContain(error.response.status);
      }
    });

    test('should return 401 or 403 if token is invalid', async () => {
      const tempClient = axios.create({
        baseURL: baseUrl,
        headers: {
          Authorization: 'Bearer invalid_token',
          'Content-Type': 'application/json',
        },
      });
      // Replace with a valid imperative schedule ID
      const validScheduleId = 'some_existing_imperative_schedule_id';

      try {
        await tempClient.post(`/api/v1/schedules/${validScheduleId}/activate`);
        fail('Expected a 401 or 403 error');
      } catch (error: any) {
        expect([401, 403]).toContain(error.response.status);
      }
    });
  });
});