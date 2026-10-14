import { act, renderHook, waitFor } from "@testing-library/react";
import { it, expect } from "vitest";
import { ApiClient } from "../../lib/api-client.js";
import { writeSession } from "../../lib/attempt-session.js";
import { session } from "../../test/contract-fixtures.js";
import { atValidate, mockApi } from "../../test/mock-api.js";
import { useAttempt } from "./use-attempt.js";
it("keeps newer reflection drafts when completion succeeds but report loading fails", async () => {
  writeSession(sessionStorage, session); const server = mockApi(atValidate());
  let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; });
  const api = new ApiClient(async (url, options) => {
    if (String(url).endsWith("/report")) throw new Error("report offline");
    const response = await server.fetcher(url, options);
    if (String(url).endsWith("/reflection")) await gate;
    return response;
  });
  const { result } = renderHook(() => useAttempt(api));
  await waitFor(() => expect(result.current.busy).toBe(false));
  await act(() => result.current.submit("validation", "total"));
  act(() => result.current.edit("reflection", "Submitted reflection"));
  let submitting!: Promise<void>;
  act(() => { submitting = result.current.submit("reflection", "", { reflection: "Submitted reflection" }); });
  await waitFor(() => expect(server.calls.some(call => call.path.endsWith("/reflection"))).toBe(true));
  act(() => result.current.edit("reflection", "Newer unsaved reflection"));
  await act(async () => { release(); await submitting; });
  await waitFor(() => expect(result.current.reportError).toContain("could not be loaded"));
  expect(result.current.snapshot?.stage).toBe("completed"); expect(result.current.needsReconcile).toBe(false);
  expect(result.current.drafts.reflection).toEqual({ value: "Newer unsaved reflection", dirty: true });
  expect(server.calls.filter(call => call.path.endsWith("/reflection"))).toHaveLength(1);
});
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
