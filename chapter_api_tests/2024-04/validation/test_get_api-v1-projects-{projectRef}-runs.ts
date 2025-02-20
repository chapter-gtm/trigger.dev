import axios, { AxiosError } from 'axios';

describe('GET /api/v1/projects/{projectRef}/runs', () => {
  const baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
  const token = process.env.API_AUTH_TOKEN || '';
  const validProjectRef = 'my-valid-project';
  const invalidProjectRef = '!@#'; // some invalid reference
  const path = '/api/v1/projects';

  beforeAll(() => {
    if (!baseURL) {
      console.warn('API_BASE_URL is not set. Tests may fail.');
    }
  });

  describe('Input Validation', () => {
    it('should return 200 for valid query parameters', async () => {
      const url = `${baseURL}${path}/${validProjectRef}/runs?status=completed&page=1&limit=5`;
      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        expect(response.status).toBe(200);
        // Additional assertions about response structure could go here
      } catch (error) {
        // If there's an error, force the test to fail
        throw new Error(`Unexpected error: ${error}`);
      }
    });

    it('should return 400 or 422 for invalid query parameter types', async () => {
      const url = `${baseURL}${path}/${validProjectRef}/runs?limit=abc`; // limit is invalid type
      try {
        await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([400, 422]).toContain(axiosError.response?.status);
      }
    });
  });

  describe('Response Validation', () => {
    it('should return valid JSON and status 200 for a successful request', async () => {
      const url = `${baseURL}${path}/${validProjectRef}/runs`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      // Here we can do partial schema validation:
      expect(response.data).toHaveProperty('runs');
      expect(Array.isArray(response.data.runs)).toBe(true);
    });

    it('should handle invalid projectRef gracefully', async () => {
      const url = `${baseURL}${path}/${invalidProjectRef}/runs`;
      try {
        await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fail('Expected request to fail due to invalid projectRef');
      } catch (error) {
        const axiosError = error as AxiosError;
        // The API might return 400 or 404 if the projectRef is not valid
        expect([400, 404]).toContain(axiosError.response?.status);
      }
    });
  });

  describe('Response Headers Validation', () => {
    it('should have correct Content-Type header', async () => {
      const url = `${baseURL}${path}/${validProjectRef}/runs`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('Edge Case & Limit Testing', () => {
    it('should return empty array if no runs are found', async () => {
      const emptyProjectRef = 'project-with-no-runs';
      const url = `${baseURL}${path}/${emptyProjectRef}/runs`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.runs)).toBe(true);
      expect(response.data.runs.length).toBe(0);
    });

    it('should return 401 or 403 if token is missing', async () => {
      const url = `${baseURL}${path}/${validProjectRef}/runs`;
      try {
        await axios.get(url); // no authorization header
        fail('Expected request to fail due to missing token');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([401, 403]).toContain(axiosError.response?.status);
      }
    });

    it('should return 401 or 403 if token is invalid', async () => {
      const url = `${baseURL}${path}/${validProjectRef}/runs`;
      try {
        await axios.get(url, {
          headers: {
            Authorization: 'Bearer invalid-token',
          },
        });
        fail('Expected request to fail due to invalid token');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([401, 403]).toContain(axiosError.response?.status);
      }
    });
  });
});