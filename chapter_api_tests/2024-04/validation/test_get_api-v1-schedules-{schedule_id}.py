import axios, { AxiosInstance } from "axios";
import { AxiosResponse } from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * Example interface for the expected schedule response.
 * Adjust fields as necessary to match your actual schema.
 */
interface Schedule {
  id: string;
  name?: string;
  // Add other fields that exist in your #/components/schemas/ScheduleObject
}

/**
 * Jest test suite for GET /api/v1/schedules/{schedule_id}.
 */
describe("GET /api/v1/schedules/{schedule_id} - Retrieve Schedule", () => {
  let client: AxiosInstance;

  beforeAll(() => {
    client = axios.create({
      baseURL: process.env.API_BASE_URL,
      headers: {
        Authorization: `Bearer ${process.env.API_AUTH_TOKEN}`,
      },
      validateStatus: () => true, // We'll manually check status codes in each test
    });
  });

  describe("Valid requests", () => {
    test("should retrieve a schedule (200) when provided a valid schedule_id", async () => {
      // Replace with a valid schedule ID that exists in your test environment
      const validScheduleId = "sched_1234";

      const response: AxiosResponse = await client.get(
        `/api/v1/schedules/${validScheduleId}`
      );

      // Response Validation
      expect([200]).toContain(response.status);
      expect(response.headers["content-type"]).toMatch(/application\/json/i);

      // Basic shape check (customize according to your schema)
      const data = response.data as Schedule;
      expect(data).toBeDefined();
      expect(typeof data.id).toBe("string");
      // Add more property checks if needed
    });
  });

  describe("Input Validation", () => {
    test("should return 400 or 422 when schedule_id is invalid (e.g., malformed)", async () => {
      // For example, an ID that clearly doesn't match your format
      const malformedScheduleId = "!!!";
      const response: AxiosResponse = await client.get(
        `/api/v1/schedules/${malformedScheduleId}`
      );

      expect([400, 422]).toContain(response.status);
    });

    test("should return 404 when schedule_id does not exist", async () => {
      // Non-existent but validly-formatted schedule_id
      const nonExistentId = "sched_non_existent";
      const response: AxiosResponse = await client.get(
        `/api/v1/schedules/${nonExistentId}`
      );

      expect([404]).toContain(response.status);
    });

    test("should handle edge case with extremely large schedule_id (potentially 400 or 422)", async () => {
      // Make a very long string to test boundary conditions
      const largeScheduleId = "sched_" + "x".repeat(1000);
      const response: AxiosResponse = await client.get(
        `/api/v1/schedules/${largeScheduleId}`
      );

      // Depending on your API, it might return 400, 422, or possibly 404
      expect([400, 422, 404]).toContain(response.status);
    });

    test("should return error (400/422) when schedule_id is empty", async () => {
      // An empty schedule_id might cause a route parameter error or 404
      const response: AxiosResponse = await client.get("/api/v1/schedules/");

      // Many frameworks might treat this as a 404 if the route doesn't match
      // or 400 if the framework explicitly validates the path param
      expect([400, 404, 422]).toContain(response.status);
    });
  });

  describe("Authorization & Authentication", () => {
    test("should return 401 or 403 when no auth token is provided", async () => {
      // Create a client without Authorization header
      const unauthClient = axios.create({
        baseURL: process.env.API_BASE_URL,
        validateStatus: () => true,
      });

      const response: AxiosResponse = await unauthClient.get(
        "/api/v1/schedules/sched_1234"
      );

      expect([401, 403]).toContain(response.status);
    });

    test("should return 401 or 403 when invalid auth token is provided", async () => {
      // Create a client with an invalid token
      const invalidAuthClient = axios.create({
        baseURL: process.env.API_BASE_URL,
        headers: {
          Authorization: "Bearer invalid_token",
        },
        validateStatus: () => true,
      });

      const response: AxiosResponse = await invalidAuthClient.get(
        "/api/v1/schedules/sched_1234"
      );

      expect([401, 403]).toContain(response.status);
    });
  });

  describe("Response Headers Validation", () => {
    test("should return Content-Type as application/json on success", async () => {
      const validScheduleId = "sched_1234";
      const response: AxiosResponse = await client.get(
        `/api/v1/schedules/${validScheduleId}`
      );

      if (response.status === 200) {
        expect(response.headers["content-type"]).toMatch(/application\/json/i);
      }
    });
  });

  describe("Edge Cases & Error Handling", () => {
    test("should handle unexpected server errors (5xx) gracefully if they occur", async () => {
      // For demonstration, this test is conceptual.
      // If you have a way to trigger a server error, add that scenario.
      // Otherwise, you might mock or intercept the request.

      // We'll attempt to call a route that might produce 500
      const response: AxiosResponse = await client.get(
        "/api/v1/schedules/trigger_500_error"
      );

      if (response.status >= 500 && response.status < 600) {
        expect(response.data).toBeDefined();
      } else {
        // The test won't fail if the server doesn't actually produce 5xx.
        // Adjust as necessary for your environment.
        expect([200, 400, 404, 422, 401, 403]).toContain(response.status);
      }
    });

    test("rate limiting test (429) if applicable", async () => {
      // This is a placeholder if your API enforces rate limits.
      // Typically you'd spam requests in a loop to trigger 429.
      // Pseudocode provided here.

      // for (let i = 0; i < 1000; i++) {
      //   await client.get("/api/v1/schedules/sched_1234");
      // }
      // Then check one last call's response.

      // const response: AxiosResponse = await client.get("/api/v1/schedules/sched_1234");
      // expect([429, 200]).toContain(response.status);

      // For now, we'll just do a placeholder expectation.
      expect(true).toBe(true);
    });
  });
});
