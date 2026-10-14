import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { App } from "../../App.js";
import { ApiClient } from "../../lib/api-client.js";
import { SESSION_KEY, writeSession } from "../../lib/attempt-session.js";
import { session, json } from "../../test/contract-fixtures.js";
import { completedSnapshot } from "../../test/report-fixture.js";
import { mockApi } from "../../test/mock-api.js";

it("keeps completion evidence visible during report loading", async () => {
  writeSession(sessionStorage, session); const server = mockApi(completedSnapshot());
  let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; });
  const fetcher: typeof fetch = async (url, options) => {
    if (String(url).endsWith("/report")) await gate;
    return server.fetcher(url, options);
  };
  render(<App api={new ApiClient(fetcher)} />);
  expect(await screen.findByText("Loading your evidence-based report…")).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Saved completion evidence" })).toHaveTextContent("I checked the arithmetic");
  await act(async () => release());
  expect(await screen.findByRole("heading", { name: "Competence report" })).toBeInTheDocument();
});
it("retries a failed report GET without resubmitting mutations or losing saved evidence", async () => {
  writeSession(sessionStorage, session); const server = mockApi(completedSnapshot()); let offline = true;
  const fetcher = vi.fn<typeof fetch>(async (url, options) => {
    if (offline && String(url).endsWith("/report")) throw new Error("private network details");
    return server.fetcher(url, options);
  });
  render(<App api={new ApiClient(fetcher)} />);
  expect(await screen.findByRole("alert")).toHaveTextContent("report could not be loaded");
  expect(screen.getByRole("region", { name: "Saved completion evidence" })).toHaveTextContent("Recorded prediction");
  expect(sessionStorage.getItem(SESSION_KEY)).not.toBeNull();
  offline = false; fireEvent.click(screen.getByRole("button", { name: "Retry report" }));
  expect(await screen.findByRole("heading", { name: "Competence report" })).toBeInTheDocument();
  expect(fetcher.mock.calls.filter(([url]) => String(url).endsWith("/report"))).toHaveLength(2);
  expect(fetcher.mock.calls.every(([, options]) => options?.method === "GET")).toBe(true);
  expect(Object.keys(JSON.parse(sessionStorage.getItem(SESSION_KEY)!)).sort()).toEqual(["attemptId", "secret"]);
});
it("refreshes completed state and refetches the protected report without a persistent evidence cache", async () => {
  writeSession(sessionStorage, session); const server = mockApi(completedSnapshot()), api = new ApiClient(server.fetcher);
  const first = render(<App api={api} />);
  await screen.findByRole("heading", { name: "Competence report" }); first.unmount();
  render(<App api={api} />); await screen.findByRole("heading", { name: "Competence report" });
  expect(server.calls.filter(call => call.path.endsWith("/report"))).toHaveLength(2);
  expect(server.calls.every(call => call.method === "GET")).toBe(true);
  expect(sessionStorage.length).toBe(1);
  expect(Object.keys(JSON.parse(sessionStorage.getItem(SESSION_KEY)!)).sort()).toEqual(["attemptId", "secret"]);
  expect(screen.getByRole("status")).toHaveTextContent("Changes not submitted before refreshing may have been lost");
});
it.each([401, 404])("clears inaccessible report access for %i while retaining local completion evidence for copying", async status => {
  writeSession(sessionStorage, session); sessionStorage.setItem("unrelated", "keep"); const server = mockApi(completedSnapshot());
  const fetcher: typeof fetch = (url, options) => String(url).endsWith("/report") ?
    Promise.resolve(json({ error: { code: "NOT_FOUND", message: "Attempt unavailable or expired." } }, status)) : server.fetcher(url, options);
  render(<App api={new ApiClient(fetcher)} />);
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("This attempt is unavailable"));
  expect(sessionStorage.getItem(SESSION_KEY)).toBeNull(); expect(sessionStorage.getItem("unrelated")).toBe("keep");
  expect(screen.queryByRole("heading", { name: "Competence report" })).not.toBeInTheDocument();
  expect(within(screen.getByRole("region", { name: "Saved completion evidence" })).getByText(/I checked the arithmetic/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Start again" })).toBeEnabled();
});
