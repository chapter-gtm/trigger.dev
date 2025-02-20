import axios, { AxiosInstance, AxiosResponse } from "axios";
import { describe, it, beforeAll, expect } from "@jest/globals";

/**
 * Test file for POST /api/v1/runs/{runId}/reschedule endpoint
 * Framework: Jest
 * Language: TypeScript
 * HTTP Client: Axios
 *
 * Make sure to set the following environment variables:
 *  - API_BASE_URL (e.g., https://api.example.com)
 *  - API_AUTH_TOKEN (your valid API token)
 */

const baseURL = process.env.API_BASE_URL || "http://localhost:3000";
const validToken = process.env.API_AUTH_TOKEN || "";

// Helper function to create an Axios instance with or without auth
function createAxiosInstance(useAuth = true): AxiosInstance {
  const headers: Record<string, string> = {};
  if (useAuth) {
    headers["Authorization"] = `Bearer ${validToken}`;
  }

  return axios.create({
    baseURL,
    headers,
  });
}

// A valid run ID for successful testing (assumes a run in the DELAYED state).
// Update "validRunId" and "delayedRunId" with appropriate test values.
const validRunId = "123";
// Invalid run IDs to test error handling
const invalidRunId = "abc";
const nonExistentRunId = "9999999"; // ID that presumably does not exist

// Sample body that might match the expected request schema.
// Adjust field names/types based on actual OpenAPI schema.
interface RescheduleRunRequest {
  // Example field: the new delay (in seconds) for the delayed run
  delayInSeconds: number;
}

const validRequestBody: RescheduleRunRequest = {
  delayInSeconds: 300, // 5 minutes
};

// Some variants for edge cases
const zeroDelayRequestBody: RescheduleRunRequest = {
  delayInSeconds: 0,
};

const largeDelayRequestBody: RescheduleRunRequest = {
  delayInSeconds: 999999999, // Arbitrarily large number
};

const invalidRequestBodyType: any = {
  delayInSeconds: "not-a-number", // Wrong data type
};

// Utility to check common headers
function expectCommonHeaders(response: AxiosResponse) {
  // Content-Type should be application/json on success or error
  expect(response.headers["content-type"]).toMatch(/application\/json/i);
  // You can add more header checks here, e.g., Cache-Control
  // expect(response.headers["cache-control"]).toBeDefined();
}

describe("POST /api/v1/runs/{runId}/reschedule", () => {
  let client: AxiosInstance;

  beforeAll(() => {
    client = createAxiosInstance();
  });

  /**
   * 1. Input Validation Tests
   */
  describe("Input Validation", () => {
    it("should return 400 or 422 when runId is invalid", async () => {
      expect.assertions(2);
      try {
        await client.post(`/api/v1/runs/${invalidRunId}/reschedule`, validRequestBody);
      } catch (error: any) {
        expect([400, 422]).toContain(error.response.status);
        expectCommonHeaders(error.response);
      }
    });

    it("should return 400 or 422 when request body has invalid data type", async () => {
      expect.assertions(2);
      try {
        await client.post(`/api/v1/runs/${validRunId}/reschedule`, invalidRequestBodyType);
      } catch (error: any) {
        expect([400, 422]).toContain(error.response.status);
        expectCommonHeaders(error.response);
      }
    });

    it("should return 400 or 422 when required body is missing", async () => {
      expect.assertions(2);
      try {
        // Sending undefined or empty body
        await client.post(`/api/v1/runs/${validRunId}/reschedule`, {});
      } catch (error: any) {
        expect([400, 422]).toContain(error.response.status);
        expectCommonHeaders(error.response);
      }
    });
  });

  /**
   * 2. Response Validation Tests
   */
  describe("Response Validation", () => {
    it("should return 200 and match the schema on valid input", async () => {
      const response = await client.post<unknown>(
        `/api/v1/runs/${validRunId}/reschedule`,
        validRequestBody
      );

      expect(response.status).toBe(200);
      expectCommonHeaders(response);

      // Example schema checks (the actual schema depends on RetrieveRunResponse)
      // For demonstration, we assume it might have an 'id' (string) and 'status' (string).
      // Adjust field checks to match your actual schema.
      const data = response.data as {
        id?: string;
        status?: string;
        [key: string]: unknown;
      };

      expect(data).toBeDefined();
      expect(typeof data.id).toBe("string");
      expect(typeof data.status).toBe("string");
    });

    it("should return 404 if run does not exist", async () => {
      expect.assertions(2);
      try {
        await client.post(`/api/v1/runs/${nonExistentRunId}/reschedule`, validRequestBody);
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expectCommonHeaders(error.response);
      }
    });
  });

  /**
   * 3. Response Headers Validation
   */
  describe("Response Headers Validation", () => {
    it("should include correct headers on success", async () => {
      const response = await client.post<unknown>(
        `/api/v1/runs/${validRunId}/reschedule`,
        validRequestBody
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toMatch(/application\/json/i);
    });
  });

  /**
   * 4. Edge Case & Limit Testing
   */
  describe("Edge Case & Limit Testing", () => {
    it("should handle zero delay gracefully", async () => {
      // 0 might be a boundary value for the delay
      const response = await client.post<unknown>(
        `/api/v1/runs/${validRunId}/reschedule`,
        zeroDelayRequestBody
      );
      expect(response.status).toBe(200);
      expectCommonHeaders(response);
    });

    it("should handle large delay values", async () => {
      const response = await client.post<unknown>(
        `/api/v1/runs/${validRunId}/reschedule`,
        largeDelayRequestBody
      );
      expect(response.status).toBe(200);
      expectCommonHeaders(response);
    });

    it("should return 401 or 403 if request is unauthorized", async () => {
      expect.assertions(2);
      try {
        const unauthClient = createAxiosInstance(false);
        await unauthClient.post(`/api/v1/runs/${validRunId}/reschedule`, validRequestBody);
      } catch (error: any) {
        expect([401, 403]).toContain(error.response.status);
        expectCommonHeaders(error.response);
      }
    });

    it("should handle server errors (simulated test)", async () => {
      /**
       * This is a placeholder example. If you have a way to trigger 500 errors (or other 5xx errors),
       * you can do so here. Otherwise, you might mock or simulate it.
       */
      expect(true).toBe(true);
    });
  });

  /**
   * 5. Testing Authorization & Authentication
   * Covered in the unauthorized test above. Additional tests can be added
   * if there are multiple roles or permission levels.
   */
});
