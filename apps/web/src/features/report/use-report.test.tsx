import { StrictMode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../lib/api-client.js";
import { json, session } from "../../test/contract-fixtures.js";
import { reportFixture } from "../../test/report-fixture.js";
import { useReport } from "./use-report.js";

describe("read-only report recovery", () => {
  it("loads only when completed-session access is enabled and retries only GET", async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValueOnce(new Error("private network marker")).mockResolvedValue(json(reportFixture()));
    const api = new ApiClient(fetcher), unavailable = vi.fn();
    const { result, rerender } = renderHook(({ enabled }) => useReport(api, session, enabled, unavailable), { initialProps: { enabled: false } });
    expect(fetcher).not.toHaveBeenCalled(); rerender({ enabled: true });
    await waitFor(() => expect(result.current.reportError).toContain("could not be loaded"));
    expect(result.current.reportError).not.toContain("private network marker");
    act(() => result.current.retryReport());
    await waitFor(() => expect(result.current.report).not.toBeNull());
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls.every(([url, options]) => String(url).endsWith("/report") && options?.method === "GET" && options.body === undefined)).toBe(true);
  });
  it.each([401, 404])("delegates inaccessible/expired access for %i", async status => {
    const api = new ApiClient(vi.fn<typeof fetch>().mockResolvedValue(json({ error: { code: "NOT_FOUND", message: "Unavailable." } }, status)));
    const unavailable = vi.fn();
    const { result, rerender } = renderHook(({ enabled }) => useReport(api, session, enabled, unavailable), { initialProps: { enabled: true } });
    await waitFor(() => expect(unavailable).toHaveBeenCalledTimes(1)); rerender({ enabled: false });
    expect(result.current.report).toBeNull(); expect(result.current.reportBusy).toBe(false);
  });
  it.each([409, 500])("keeps errors report-specific and permits retry for %i", async status => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(json({ error: { code: "REPORT_ERROR", message: "Report unavailable; retry." } }, status)).mockResolvedValue(json(reportFixture()));
    const api = new ApiClient(fetcher), unavailable = vi.fn();
    const { result } = renderHook(() => useReport(api, session, true, unavailable));
    await waitFor(() => expect(result.current.reportError).toBe("Report unavailable; retry."));
    expect(unavailable).not.toHaveBeenCalled(); act(() => result.current.retryReport());
    await waitFor(() => expect(result.current.report).not.toBeNull());
  });
  it("rejects malformed report responses without mutation-reconciliation messaging", async () => {
    const api = new ApiClient(vi.fn<typeof fetch>().mockResolvedValue(json({ score: 100 })));
    const unavailable = vi.fn(); const { result } = renderHook(() => useReport(api, session, true, unavailable));
    await waitFor(() => expect(result.current.reportError).toContain("could not be verified"));
    expect(result.current.report).toBeNull(); expect(result.current.reportError).not.toContain("may have been saved");
  });
  it("discards stale responses after session change, including changes to only the secret", async () => {
    let release!: (response: Response) => void;
    const pending = new Promise<Response>(resolve => { release = resolve; });
    const fetcher = vi.fn<typeof fetch>().mockReturnValueOnce(pending).mockResolvedValue(json(reportFixture()));
    const api = new ApiClient(fetcher), unavailable = vi.fn(), next = { ...session, secret: "b".repeat(43) };
    const { result, rerender } = renderHook(({ owner }) => useReport(api, owner, true, unavailable), { initialProps: { owner: session } });
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1)); rerender({ owner: next });
    await waitFor(() => expect(result.current.report).not.toBeNull());
    await act(async () => release(json({ error: { code: "NOT_FOUND", message: "Old session unavailable." } }, 404)));
    expect(unavailable).not.toHaveBeenCalled(); expect(result.current.report).not.toBeNull();
  });
  it("discards a late old-attempt report when another attempt is active", async () => {
    let release!: (response: Response) => void; const pending = new Promise<Response>(resolve => { release = resolve; });
    const next = { ...session, attemptId: "00000000-0000-4000-8000-000000000099" }, nextReport = reportFixture(); nextReport.learningJourney.id = next.attemptId;
    const fetcher = vi.fn<typeof fetch>().mockReturnValueOnce(pending).mockResolvedValue(json(nextReport));
    const api = new ApiClient(fetcher), unavailable = vi.fn();
    const { result, rerender } = renderHook(({ owner }) => useReport(api, owner, true, unavailable), { initialProps: { owner: session } });
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1)); rerender({ owner: next });
    await waitFor(() => expect(result.current.report?.learningJourney.id).toBe(next.attemptId));
    await act(async () => release(json(reportFixture())));
    expect(result.current.report?.learningJourney.id).toBe(next.attemptId);
  });
  it("blocks stale authentication failures immediately when the coordinator generation changes", async () => {
    let release!: (response: Response) => void, version = 0;
    const api = new ApiClient(() => new Promise(resolve => { release = resolve; }));
    const unavailable = vi.fn(), getVersion = () => version;
    renderHook(() => useReport(api, session, true, unavailable, getVersion));
    await waitFor(() => expect(release).toBeDefined()); version++;
    await act(async () => release(json({ error: { code: "NOT_FOUND", message: "Unavailable." } }, 404)));
    expect(unavailable).not.toHaveBeenCalled();
  });
  it("clears cached reports when access is disabled and survives StrictMode effect replay", async () => {
    const api = new ApiClient(vi.fn<typeof fetch>().mockImplementation(async () => json(reportFixture()))), unavailable = vi.fn();
    const { result, rerender } = renderHook(({ enabled }) => useReport(api, session, enabled, unavailable), { initialProps: { enabled: true }, wrapper: StrictMode });
    await waitFor(() => expect(result.current.report).not.toBeNull()); rerender({ enabled: false });
    expect(result.current.report).toBeNull(); expect(result.current.reportBusy).toBe(false);
  });
});
