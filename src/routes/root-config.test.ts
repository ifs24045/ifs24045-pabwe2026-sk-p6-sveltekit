import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRawSnippet } from "svelte";
import { waitFor } from "@testing-library/svelte";
import { ssr, prerender } from "./+layout";
import RootLayout from "./+layout.svelte";
import RootPage from "./+page.svelte";
import { renderWithProviders } from "../test-utils";
import { coursesStore } from "../features/courses/states/coursesStore";
import { usersStore } from "../features/users/states/usersStore";

const profile = { id: "1", name: "Abdullah", email: "abdullah@del.org" };

const children = createRawSnippet(() => ({
  render: () => `<p data-testid="child">Anak layout</p>`,
}));

describe("root routes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(coursesStore, "asyncSetCourses").mockResolvedValue();
  });

  it("should run as a client-side app", () => {
    expect(ssr).toBe(false);
    expect(prerender).toBe(false);
  });

  it("should render auth children without the course layout", () => {
    const { wrapper } = renderWithProviders(RootLayout, {
      route: "/auth/login",
      props: { children },
    });

    expect(wrapper.find('[data-testid="child"]').text()).toBe("Anak layout");
    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(false);
  });

  it("should wrap other routes with the course layout", async () => {
    localStorage.setItem("accessToken", "token");
    vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue();
    usersStore.setProfile(profile);

    const { wrapper } = renderWithProviders(RootLayout, {
      route: "/",
      props: { children },
    });

    await waitFor(() =>
      expect(wrapper.find('[data-testid="child"]').text()).toBe("Anak layout")
    );
    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(true);
  });

  it("should render the course home page", () => {
    const { wrapper } = renderWithProviders(RootPage);

    expect(wrapper.find('[data-testid="search-course-input"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Semua Kursus");
  });
});
