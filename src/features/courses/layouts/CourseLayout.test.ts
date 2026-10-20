import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRawSnippet } from "svelte";
import { waitFor } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import CourseLayout from "./CourseLayout.svelte";
import { renderWithProviders } from "../../../test-utils";
import { usersStore } from "../../users/states/usersStore";

const profile = { id: "1", name: "Abdullah", email: "abdullah@del.org" };

const children = createRawSnippet(() => ({
  render: () => `<p data-testid="child">Konten halaman</p>`,
}));

describe("CourseLayout", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should redirect to login when there is no access token", async () => {
    renderWithProviders(CourseLayout, { props: { children } });

    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
  });

  it("should render navbar, sidebar, and children when the profile is ready", async () => {
    localStorage.setItem("accessToken", "token");
    vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue();
    usersStore.setProfile(profile);

    const { wrapper } = renderWithProviders(CourseLayout, { props: { children } });

    await waitFor(() =>
      expect(wrapper.find('[data-testid="child"]').text()).toBe("Konten halaman")
    );
    expect(wrapper.text()).toContain("Delcom Courses");
    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(true);
  });

  it("should show a loading indicator while the profile is not ready", async () => {
    localStorage.setItem("accessToken", "token");
    vi.spyOn(usersStore, "asyncSetProfile").mockReturnValue(new Promise(() => {}));

    const { wrapper } = renderWithProviders(CourseLayout, { props: { children } });

    await waitFor(() =>
      expect(wrapper.find('[data-testid="layout-loading"]').exists()).toBe(true)
    );
  });

  it("should clear the token and redirect when the profile fails to load", async () => {
    localStorage.setItem("accessToken", "token");
    vi.spyOn(usersStore, "asyncSetProfile").mockImplementation(async () => {
      usersStore.reset({ isProfile: true, profile: null });
    });

    renderWithProviders(CourseLayout, { props: { children } });

    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  it("should toggle the sidebar and close it on navigation", async () => {
    localStorage.setItem("accessToken", "token");
    vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue();
    usersStore.setProfile(profile);

    const { wrapper } = renderWithProviders(CourseLayout, { props: { children } });
    const sidebar = wrapper.find('[data-testid="sidebar"]');

    expect(sidebar.element.className).toContain("hidden");

    await wrapper.find('[data-testid="navbar-toggle"]').trigger("click");
    expect(sidebar.element.className).toContain("block");

    await wrapper.find('[data-testid="sidebar-link"]').trigger("click");
    expect(sidebar.element.className).toContain("hidden");
  });

  it("should ignore profile updates that still have data", async () => {
    localStorage.setItem("accessToken", "token");
    vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue();
    usersStore.setProfile(profile);

    renderWithProviders(CourseLayout, { props: { children } });
    usersStore.setIsProfile(true);

    await waitFor(() => expect(goto).not.toHaveBeenCalled());
    expect(localStorage.getItem("accessToken")).toBe("token");
  });
});
