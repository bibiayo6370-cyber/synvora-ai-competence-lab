import { StrictMode } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect, vi } from "vitest";
import { App } from "../../App.js";
import { ApiClient } from "../../lib/api-client.js";
import { SESSION_KEY, writeSession } from "../../lib/attempt-session.js";
import { atValidate, mockApi } from "../../test/mock-api.js";
import { json, session } from "../../test/contract-fixtures.js";
async function fill(label: string, value: string) { fireEvent.change(await screen.findByLabelText(label), { target: { value } }); }
async function click(label: string) { await userEvent.click(await screen.findByRole("button", { name: label })); }
function resume(server = mockApi(atValidate()), fetcher: typeof fetch = server.fetcher) {
  writeSession(sessionStorage, session); const api = new ApiClient(fetcher); const view = render(<App api={api} />); return { server, api, ...view };
}
it("completes the real-contract journey with rejection recovery and safely failing checks", async () => {
  const server = mockApi(); render(<StrictMode><App api={new ApiClient(server.fetcher)} /></StrictMode>);
  await click("Start challenge");
  await fill("Predicted console output", "123");
  expect(screen.queryByText("4500")).not.toBeInTheDocument();
  await click("Submit prediction");
  expect(await screen.findByText(/Your recorded prediction is locked/)).toBeInTheDocument();
  expect(screen.queryByLabelText("Predicted console output")).not.toBeInTheDocument();
  expect(screen.queryByText("4500")).not.toBeInTheDocument();
  await click("Reveal reference result"); expect(await screen.findByText("4500")).toBeInTheDocument();
  await click("Continue to investigation");
  await fill("Investigation explanation", "The arguments become price and quantity."); await click("Save investigation");
  await fill("Return expression", "total"); await click("Save expression and continue");
  await fill("Return expression", "total/0"); await click("Validate expression");
  expect(await screen.findByRole("alert")).toHaveTextContent("Expression rejected");
  expect(screen.getByLabelText("Return expression")).toHaveValue("total/0");
  await fill("Return expression", "total"); await click("Validate expression");
  expect(await screen.findByText("1 of 5 checks passed")).toBeInTheDocument();
  await click("Continue to reflection"); await fill("Reflection", "I still need to explain the discount.");
  await fill("AI-use declaration (optional)", "I checked an assistant suggestion."); await click("Record reflection and complete");
  expect(await screen.findByRole("heading", { name: "Evidence recorded" })).toBeInTheDocument();
  expect(screen.getByText(/Competence report forthcoming/)).toBeInTheDocument();
  expect(server.current().evidence.some(item => item.type === "ai_use_declaration")).toBe(true);
  expect(server.calls.filter(call => call.path === "/api/attempts")).toHaveLength(1);
  expect(Object.keys(JSON.parse(sessionStorage.getItem(SESSION_KEY)!)).sort()).toEqual(["attemptId", "secret"]);
});
it("blocks blank and whitespace draft saves before advancement", async () => {
  const initial = atValidate(); initial.stage = "modify"; initial.evidence = initial.evidence.filter(item => item.type !== "modification_draft");
  const { server } = resume(mockApi(initial));
  await click("Save expression and continue"); expect(await screen.findByRole("alert")).toBeInTheDocument();
  await fill("Return expression", "   "); await click("Save expression and continue");
  expect(server.calls.some(call => call.path.endsWith("/modification"))).toBe(false);
  expect(screen.getByRole("heading", { name: "Modify the return expression" })).toBeInTheDocument();
});
it("recovers from rejected validation at reflect and preserves reflection through a 409", async () => {
  const { server } = resume();
  await click("Validate expression"); await click("Continue to reflection");
  await fill("Reflection", "Keep this newer reflection."); await fill("AI-use declaration (optional)", "Keep this note.");
  server.revalidationConflict(); await click("Record reflection and complete");
  expect(await screen.findByRole("alert")).toHaveTextContent("Validate the current draft again");
  await fill("Return expression", "total/0"); await click("Validate expression");
  expect(await screen.findByText("Expression rejected.")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Continue to reflection" })).not.toBeInTheDocument();
  await fill("Return expression", "total"); await click("Validate expression"); await click("Continue to reflection");
  expect(screen.getByLabelText("Reflection")).toHaveValue("Keep this newer reflection.");
  expect(screen.getByLabelText("AI-use declaration (optional)")).toHaveValue("Keep this note.");
  await click("Record reflection and complete"); expect(await screen.findByRole("heading", { name: "Evidence recorded" })).toBeInTheDocument();
});
it("refreshes from submitted evidence while discarding only explicitly unsaved text", async () => {
  const { server, api, unmount } = resume();
  await fill("Return expression", "total/0"); await click("Validate expression");
  await fill("Return expression", "new unsaved text"); unmount(); render(<App api={api} />);
  expect(await screen.findByLabelText("Return expression")).toHaveValue("total/0");
  expect(screen.getByText(/Refreshing can discard unsubmitted changes/)).toBeInTheDocument();
  expect(server.current().stage).toBe("validate");
  expect(screen.getByRole("status")).toHaveTextContent("Saved progress restored. Changes not submitted before refreshing may have been lost.");
  expect(screen.getByRole("status")).not.toHaveTextContent("unsaved edits have been preserved");
});
it("reconciles a lost validation response without overwriting a newer draft or replaying", async () => {
  const server = mockApi(atValidate()); let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const fetcher: typeof fetch = async (url, options) => {
    const response = await server.fetcher(url, options);
    if (String(url).endsWith("/validation")) { await gate; throw new Error("synthetic network failure"); }
    return response;
  };
  resume(server, fetcher); await click("Validate expression");
  await fill("Return expression", "total/0"); release();
  await waitFor(() => expect(screen.getByLabelText("Return expression")).toHaveValue("total/0"));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("submission was saved"));
  expect(screen.getByRole("status")).toHaveTextContent("Saved progress checked. Your unsaved edits have been preserved on this page.");
  expect(server.calls.filter(call => call.path.endsWith("/validation"))).toHaveLength(1);
  expect(screen.getByText(/Unsaved changes/)).toBeInTheDocument();
});
it("keeps session and unsaved work during outage and checks progress before retry", async () => {
  const server = mockApi(atValidate()); let offline = false;
  const fetcher: typeof fetch = (url, options) => offline ? Promise.reject(new Error("offline")) : server.fetcher(url, options);
  resume(server, fetcher); await fill("Return expression", "total/0"); offline = true; await click("Validate expression");
  expect(await screen.findByText(/Saved progress could not be checked/)).toBeInTheDocument();
  expect(sessionStorage.getItem(SESSION_KEY)).not.toBeNull(); expect(screen.getByLabelText("Return expression")).toHaveValue("total/0");
  offline = false; await click("Check saved progress / Retry connection");
  expect(screen.getByRole("status")).toHaveTextContent("Saved progress checked. Your unsaved edits have been preserved on this page.");
  expect(screen.getByRole("status")).not.toHaveTextContent("Changes not submitted before refreshing may have been lost");
  expect(screen.getByLabelText("Return expression")).toHaveValue("total/0");
  await click("Validate expression"); expect(await screen.findByText("Expression rejected.")).toBeInTheDocument();
});
it.each([401, 404])("clears only the scoped inaccessible session for %i", async status => {
  const server = mockApi(); sessionStorage.setItem("unrelated", "keep");
  const fetcher: typeof fetch = (url, options) => String(url).endsWith(session.attemptId) ? Promise.resolve(json({ error: { code: "NOT_FOUND", message: "Attempt unavailable or expired." } }, status)) : server.fetcher(url, options);
  resume(server, fetcher);
  expect(await screen.findByRole("alert")).toHaveTextContent("This attempt is unavailable");
  expect(sessionStorage.getItem(SESSION_KEY)).toBeNull(); expect(sessionStorage.getItem("unrelated")).toBe("keep");
  expect(screen.getByRole("button", { name: "Start again" })).toBeEnabled();
});
it("does not create automatically or double-submit under StrictMode", async () => {
  const server = mockApi(); render(<StrictMode><App api={new ApiClient(server.fetcher)} /></StrictMode>);
  const button = await screen.findByRole("button", { name: "Start challenge" });
  expect(server.calls.filter(call => call.path === "/api/attempts")).toHaveLength(0);
  fireEvent.click(button); fireEvent.click(button);
  await screen.findByLabelText("Predicted console output");
  expect(server.calls.filter(call => call.path === "/api/attempts")).toHaveLength(1);
});
it("does not replay creation when its response is lost", async () => {
  const server = mockApi(); const fetcher: typeof fetch = (url, options) => String(url) === "/api/attempts" ? Promise.reject(new Error("lost")) : server.fetcher(url, options);
  const spy = vi.fn(fetcher); render(<App api={new ApiClient(spy)} />); await click("Start challenge");
  expect(await screen.findByRole("alert")).toHaveTextContent("No automatic retry was made");
  expect(spy.mock.calls.filter(([url]) => url === "/api/attempts")).toHaveLength(1);
  expect(screen.getByRole("button", { name: "Start again" })).toBeEnabled();
});
it("handles storage denial without creating an inaccessible attempt", async () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
  const server = mockApi(); render(<App api={new ApiClient(server.fetcher)} />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Browser session storage cannot be written");
  expect(screen.getByRole("button", { name: "Start challenge" })).toBeDisabled();
  expect(server.calls.some(call => call.path === "/api/attempts")).toBe(false);
});
it("supports keyboard focus and retains work when returning from reflection to edit", async () => {
  resume(); await click("Validate expression"); await click("Continue to reflection");
  await fill("Reflection", "My unfinished reflection."); await click("Edit / revalidate expression");
  await click("Continue to reflection"); expect(screen.getByLabelText("Reflection")).toHaveValue("My unfinished reflection.");
  const user = userEvent.setup(); screen.getByLabelText("Reflection").focus(); await user.tab();
  expect(screen.getByLabelText("AI-use declaration (optional)")).toHaveFocus();
});
it("does not offer a new start while protected resume is offline", async () => {
  const server = mockApi(atValidate());
  const fetcher: typeof fetch = (url, options) => String(url).endsWith(session.attemptId) ? Promise.reject(new Error("offline")) : server.fetcher(url, options);
  resume(server, fetcher); await screen.findByRole("alert");
  expect(screen.queryByRole("button", { name: /Start/ })).not.toBeInTheDocument();
  expect(sessionStorage.getItem(SESSION_KEY)).not.toBeNull();
});
it("omits an empty optional AI declaration", async () => {
  const { server } = resume(); await click("Validate expression"); await click("Continue to reflection");
  await fill("Reflection", "The checks show a technical gap."); await click("Record reflection and complete");
  await screen.findByRole("heading", { name: "Evidence recorded" });
  expect(server.current().evidence.some(item => item.type === "ai_use_declaration")).toBe(false);
});
it("labels and bounds the plain-text expression editor without an executable editor", async () => {
  resume(); const editor = await screen.findByLabelText("Return expression");
  expect(editor).toHaveAttribute("maxlength", "200"); expect(editor.tagName).toBe("TEXTAREA");
  fireEvent.change(editor, { target: { value: "1".repeat(200) } });
  expect(screen.getByText(/200\/200 characters/)).toBeInTheDocument();
  expect(screen.getByText(/Unsaved changes — refresh/)).toBeInTheDocument();
});

it("resumes readable existing credentials even if storage writes are denied", async () => {
  writeSession(sessionStorage, session);
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("writes denied"); });
  const server = mockApi(atValidate()); render(<App api={new ApiClient(server.fetcher)} />);
  expect(await screen.findByLabelText("Return expression")).toHaveValue("total");
  expect(screen.getByRole("alert")).toHaveTextContent("readable existing credentials");
  expect(screen.queryByRole("button", { name: /Start/ })).not.toBeInTheDocument();
});
