import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

describe('PUT /api/v1/schedules/{schedule_id}', () => {
  let axiosInstance: AxiosInstance;
  const baseURL = process.env.API_BASE_URL;
  const token = process.env.API_AUTH_TOKEN;

  // You can replace these with actual valid/invalid IDs from your system.
  const validScheduleId = 'test-schedule-id';
  const invalidScheduleId = '';

  // Example of a valid request payload (adjust keys/values based on your API's schema)
  const validPayload = {
    name: 'Updated Schedule Name',
    type: 'IMPERATIVE',
    tasks: [
      {
        action: 'someAction',
        parameters: {}
      }
    ]
  };

  // Example of an invalid request payload
  const invalidPayload = {
    // For instance, name is empty, type is wrong data type, tasks is not an array
    name: '',
    type: 1234,
    tasks: 'not-an-array'
  };

  beforeAll(() => {
    axiosInstance = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  });

  describe('Input Validation', () => {
    test('should update schedule successfully with valid parameters', async () => {
      expect(baseURL).toBeDefined();
      expect(token).toBeDefined();

      const response = await axiosInstance.put(
        `/api/v1/schedules/${validScheduleId}`,
        validPayload
      );

      expect(response.status).toBe(200);
      // Additional checks on response body to match the expected schema
      expect(response.data).toHaveProperty('id', validScheduleId);
      expect(response.data).toHaveProperty('name', validPayload.name);
      expect(response.data).toHaveProperty('type', validPayload.type);
      // Further validation on tasks if needed
    });

    test('should return 400 or 422 when payload is invalid', async () => {
      try {
        await axiosInstance.put(
          `/api/v1/schedules/${validScheduleId}`,
          invalidPayload
        );
        fail('Request should have failed with 400 or 422.');
      } catch (error: any) {
        const statusCode = error?.response?.status;
        expect([400, 422]).toContain(statusCode);
      }
    });

    test('should return 404 if schedule_id does not exist', async () => {
      const nonExistentId = 'nonexistent-schedule-id';
      try {
        await axiosInstance.put(
          `/api/v1/schedules/${nonExistentId}`,
          validPayload
        );
        fail('Request should have failed with 404.');
      } catch (error: any) {
        expect(error?.response?.status).toBe(404);
      }
    });

    test('should return 400 or 422 if schedule_id is invalid (e.g., empty)', async () => {
      try {
        await axiosInstance.put(
          `/api/v1/schedules/${invalidScheduleId}`,
          validPayload
        );
        fail('Request should have failed with 400 or 422.');
      } catch (error: any) {
        const statusCode = error?.response?.status;
        expect([400, 422]).toContain(statusCode);
      }
    });
  });

  describe('Response Validation', () => {
    test('should have the correct response headers', async () => {
      const response = await axiosInstance.put(
        `/api/v1/schedules/${validScheduleId}`,
        validPayload
      );
      expect(response.headers['content-type']).toContain('application/json');
    });

    test('should return a valid ScheduleObject in the response body', async () => {
      const response = await axiosInstance.put(
        `/api/v1/schedules/${validScheduleId}`,
        validPayload
      );
      // Check for required fields
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('name');
      expect(response.data).toHaveProperty('type');
      // Additional checks can be added based on the ScheduleObject schema
    });
  });

  describe('Edge Case & Limit Testing', () => {
    test('should handle large payload without error', async () => {
      // Example of a large payload; adjust as needed.
      const largePayload = {
        name: 'A'.repeat(10000),
        type: 'IMPERATIVE',
        tasks: Array(1000).fill({ action: 'someAction', parameters: {} })
      };

      // We expect either a success (200) if the API can handle it,
      // or a 400/413/422 if it's too large.
      try {
        const response = await axiosInstance.put(
          `/api/v1/schedules/${validScheduleId}`,
          largePayload
        );
        expect(response.status).toBe(200);
      } catch (error: any) {
        const statusCode = error?.response?.status;
        expect([400, 413, 422]).toContain(statusCode);
      }
    });

    test('should handle empty request body', async () => {
      try {
        await axiosInstance.put(
          `/api/v1/schedules/${validScheduleId}`,
          {}
        );
        fail('Request should have failed with 400 or 422 due to empty body.');
      } catch (error: any) {
        const statusCode = error?.response?.status;
        expect([400, 422]).toContain(statusCode);
      }
    });
  });

  describe('Testing Authorization & Authentication', () => {
    test('should return 401 or 403 if no token is provided', async () => {
      const unauthorizedInstance = axios.create({ baseURL });
      try {
        await unauthorizedInstance.put(
          `/api/v1/schedules/${validScheduleId}`,
          validPayload
        );
        fail('Request should have failed with 401 or 403.');
      } catch (error: any) {
        const statusCode = error?.response?.status;
        expect([401, 403]).toContain(statusCode);
      }
    });

    test('should return 200 when valid token is provided', async () => {
      const response = await axiosInstance.put(
        `/api/v1/schedules/${validScheduleId}`,
        validPayload
      );
      expect(response.status).toBe(200);
    });
  });
});
