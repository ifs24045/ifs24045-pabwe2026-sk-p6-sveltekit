import { describe, it, expect } from "vitest";
import { handle } from "./hooks.server";

describe("hooks.server handle", () => {
  it("should remove the etag so the page is always answered with 200", async () => {
    const resolved = new Response("<html></html>", {
      status: 200,
      headers: { etag: '"abc123"', "content-type": "text/html" },
    });

    const response = await handle({
      event: {} as any,
      resolve: async () => resolved,
    });

    expect(response.headers.has("etag")).toBe(false);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/html");
    expect(await response.text()).toBe("<html></html>");
  });

  it("should leave responses without an etag untouched", async () => {
    const resolved = new Response("ok", { status: 404 });

    const response = await handle({
      event: {} as any,
      resolve: async () => resolved,
    });

    expect(response.status).toBe(404);
    expect(response.headers.has("etag")).toBe(false);
  });
});