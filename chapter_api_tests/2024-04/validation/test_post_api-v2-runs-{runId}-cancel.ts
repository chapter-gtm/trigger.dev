import axios from "axios";
import { describe, beforeAll, test, expect } from "@jest/globals";

describe("Cancel a run (POST /api/v2/runs/:runId/cancel)", () => {
  let baseURL: string;
  let authToken: string;

  beforeAll(() => {
    // Load environment variables
    baseURL = process.env.API_BASE_URL || "http://localhost:3000";
    authToken = process.env.API_AUTH_TOKEN || "";
  });

  describe("Input Validation tests", () => {
    test("Missing or empty runId should return 400 or 422", async () => {
      const runId = "";
      try {
        await axios.post(
          `${baseURL}/api/v2/runs/${runId}/cancel`,
          {},
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      } catch (error: any) {
        // Expect either 400 or 422 for invalid payload or missing path param
        expect([400, 422]).toContain(error.response.status);
        expect(error.response.data).toHaveProperty("error");
      }
    });

    test("Invalid runId format should return 400 or 422", async () => {
      const runId = "!!!invalid-id!!!";
      try {
        await axios.post(
          `${baseURL}/api/v2/runs/${runId}/cancel`,
          {},
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      } catch (error: any) {
        // Expect either 400 or 422 for malformed runId
        expect([400, 422]).toContain(error.response.status);
        expect(error.response.data).toHaveProperty("error");
      }
    });
  });

  describe("Authorization & Authentication", () => {
    test("No auth token should return 401 or 403", async () => {
      const runId = "run_1234";
      try {
        await axios.post(`${baseURL}/api/v2/runs/${runId}/cancel`);
      } catch (error: any) {
        // Expect either 401 or 403 for missing token
        expect([401, 403]).toContain(error.response.status);
        expect(error.response.data).toHaveProperty("error");
      }
    });

    test("Invalid auth token should return 401 or 403", async () => {
      const runId = "run_1234";
      try {
        await axios.post(
          `${baseURL}/api/v2/runs/${runId}/cancel`,
          {},
          { headers: { Authorization: `Bearer invalid_token` } }
        );
      } catch (error: any) {
        // Expect either 401 or 403 for invalid token
        expect([401, 403]).toContain(error.response.status);
        expect(error.response.data).toHaveProperty("error");
      }
    });
  });

  describe("Response Validation", () => {
    test("Successful cancellation should return 200 and valid schema", async () => {
      // Assume "run_1234" is valid/in-progress or acceptable for test
      const runId = "run_1234";
      const response = await axios.post(
        `${baseURL}/api/v2/runs/${runId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Response validation
      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.data).toHaveProperty("id");
      expect(typeof response.data.id).toBe("string");
    });

    test("Run not found should return 404", async () => {
      // "run_not_found" is deliberately invalid to test 404
      const runId = "run_not_found";
      try {
        await axios.post(
          `${baseURL}/api/v2/runs/${runId}/cancel`,
          {},
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        // We expect a 404 to be thrown, so fail if no error is thrown
        fail("Expected a 404 error but request succeeded.");
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toHaveProperty("error");
        expect(error.response.data.error).toBe("Run not found");
      }
    });

    test("Large runId string should return 400, 422 or 404 (implementation dependent)", async () => {
      // Try a very long runId
      const runId = "a".repeat(1000);
      try {
        await axios.post(
          `${baseURL}/api/v2/runs/${runId}/cancel`,
          {},
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error: any) {
        // Depending on the API implementation, it might interpret long IDs differently
        // Could be 400, 422 or 404
        expect([400, 422, 404]).toContain(error.response.status);
      }
    });
  });
});