import { act, renderHook, waitFor } from "@testing-library/react";
import { it, expect } from "vitest";
import { ApiClient } from "../../lib/api-client.js";
import { writeSession } from "../../lib/attempt-session.js";
import { session } from "../../test/contract-fixtures.js";
import { atValidate, mockApi } from "../../test/mock-api.js";
import { useAttempt } from "./use-attempt.js";
it("protects a newer unsaved expression even when a reflection panel is requested", async () => {
  writeSession(sessionStorage, session);
  const server = mockApi(atValidate()), api = new ApiClient(server.fetcher);
  const { result } = renderHook(() => useAttempt(api));
  await waitFor(() => expect(result.current.busy).toBe(false));
  await act(() => result.current.submit("validation", "total"));
  act(() => { result.current.edit("expression", "total + 0"); result.current.edit("reflection", "Keep my reflection"); result.current.showPanel("stage"); });
  await act(() => result.current.submit("reflection", "", { reflection: "Keep my reflection" }));
  expect(result.current.error).toContain("newer unsaved expression"); expect(result.current.panel).toBe("validation");
  expect(result.current.drafts.reflection.value).toBe("Keep my reflection");
  expect(server.calls.some(call => call.path.endsWith("/reflection"))).toBe(false);
});

it("checks saved progress without claiming preservation when there are no unsaved edits", async () => {
  writeSession(sessionStorage, session);
  const api = new ApiClient(mockApi(atValidate()).fetcher);
  const { result } = renderHook(() => useAttempt(api));
  await waitFor(() => expect(result.current.busy).toBe(false));
  expect(result.current.notice).toBe("Saved progress restored. Changes not submitted before refreshing may have been lost.");
  await act(() => result.current.retry());
  expect(result.current.notice).toBe("Saved progress checked.");
});
