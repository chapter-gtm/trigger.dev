import axios from 'axios';
import { AxiosResponse } from 'axios';

/************************************************
 * DELETE /api/v1/schedules/{schedule_id}
 * Summary: Delete a schedule by its ID.
 * Only works on IMPERATIVE schedules.
 ************************************************/

describe('DELETE /api/v1/schedules/:schedule_id', () => {
  // Load environment variables
  const baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
  const authToken = process.env.API_AUTH_TOKEN || '';

  // Example schedule IDs. In real tests, you might set up test data or mock responses.
  // Replace these with actual values.
  const validScheduleId = 'VALID_SCHEDULE_ID';
  const nonExistentScheduleId = 'NON_EXISTENT_ID';
  const invalidScheduleId = '!!!'; // Example of a malformed ID.

  // Helper function to perform the DELETE request
  const deleteSchedule = async (
    scheduleId: string,
    token: string | null,
  ): Promise<AxiosResponse> => {
    const url = `${baseURL}/api/v1/schedules/${scheduleId}`;

    // Allow all status codes in the response so we can test them in assertions
    return axios.delete(url, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      validateStatus: () => true, // Prevent axios from throwing on non-2xx
    });
  };

  /************************************************
   * 1. Input Validation
   ************************************************/

  it('should return 400 or 422 when called with an invalid schedule ID format', async () => {
    const response = await deleteSchedule(invalidScheduleId, authToken);
    expect([400, 422]).toContain(response.status);
  });

  it('should return 400 or 422 when called with an empty schedule ID', async () => {
    const response = await deleteSchedule('', authToken);
    expect([400, 422]).toContain(response.status);
  });

  /************************************************
   * 2. Response Validation (Successful Deletion)
   ************************************************/

  it('should delete the schedule successfully and return status 200', async () => {
    // This test assumes the schedule with validScheduleId exists
    // and can be deleted. If it doesn’t exist, you may get a 404.
    const response = await deleteSchedule(validScheduleId, authToken);

    // Confirm it returned a 2xx or specifically 200
    expect(response.status).toBe(200);

    // Check response headers
    expect(response.headers).toHaveProperty('content-type');
    expect(response.headers['content-type']).toMatch(/application\/json/i);

    // Optional: Validate expected JSON body shape if the API returns a JSON response
    // For example, if the API returns: { message: 'Schedule deleted successfully' }
    // expect(response.data).toHaveProperty('message', 'Schedule deleted successfully');
  });

  it('should return 404 when schedule not found', async () => {
    // Attempt to delete a schedule ID that does not exist
    const response = await deleteSchedule(nonExistentScheduleId, authToken);

    expect(response.status).toBe(404);
    // Check response headers
    expect(response.headers).toHaveProperty('content-type');
    expect(response.headers['content-type']).toMatch(/application\/json/i);
    // Optional: check response body
    // expect(response.data).toHaveProperty('error');
  });

  /************************************************
   * 3. Response Headers Validation
   ************************************************/

  it('should include application/json Content-Type on error responses', async () => {
    // Use an invalid schedule ID to force error (e.g., 400)
    const response = await deleteSchedule(invalidScheduleId, authToken);

    expect([400, 422]).toContain(response.status);
    // Verify that the response is in JSON format.
    expect(response.headers).toHaveProperty('content-type');
    expect(response.headers['content-type']).toMatch(/application\/json/i);
  });

  /************************************************
   * 4. Edge Case & Limit Testing
   ************************************************/

  it('should handle an unauthorized request (missing token) with 401 or 403', async () => {
    // Attempt to delete without providing a token
    const response = await deleteSchedule(validScheduleId, null);
    expect([401, 403]).toContain(response.status);
  });

  it('should handle nonexistent schedule IDs correctly (already tested: returns 404)', async () => {
    // Already covered above, but you can add extra validations.
    // This test verifies a second time the correct code is 404.
    const response = await deleteSchedule(nonExistentScheduleId, authToken);
    expect(response.status).toBe(404);
  });

  /************************************************
   * 5. Testing Authorization & Authentication
   ************************************************/

  it('should return 401 or 403 if the token is invalid', async () => {
    const response = await deleteSchedule(validScheduleId, 'INVALID_TOKEN');
    expect([401, 403]).toContain(response.status);
  });
});
