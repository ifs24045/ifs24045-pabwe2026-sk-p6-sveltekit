import { describe, it, expect } from "vitest";
import { createRawSnippet } from "svelte";
import { ssr, prerender } from "./+layout";
import RootLayout from "./+layout.svelte";
import RootPage from "./+page.svelte";
import { renderWithProviders } from "../test-utils";

describe("root routes (sementara)", () => {
  it("should run as a client-side app", () => {
    expect(ssr).toBe(false);
    expect(prerender).toBe(false);
  });

  it("should render children inside the root layout", () => {
    const children = createRawSnippet(() => ({
      render: () => `<p data-testid="child">Anak layout</p>`,
    }));

    const { wrapper } = renderWithProviders(RootLayout, { props: { children } });

    expect(wrapper.find('[data-testid="child"]').text()).toBe("Anak layout");
  });

  it("should render the placeholder home page", () => {
    const { wrapper } = renderWithProviders(RootPage);

    expect(wrapper.text()).toContain("Delcom Courses");
  });
});