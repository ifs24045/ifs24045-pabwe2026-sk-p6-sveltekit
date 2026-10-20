import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import Navbar from "./Navbar.svelte";
import { renderWithProviders } from "../../../test-utils";
import { authStore } from "../../auth/states/authStore";

const profile = {
  id: "1",
  name: "Abdullah",
  email: "abdullah@del.org",
  photo: null as string | null,
};

describe("Navbar", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render the brand, profile initial, and logout button", () => {
    const { wrapper } = renderWithProviders(Navbar, {
      props: { onToggleSidebar: vi.fn() },
      preloadedState: { profile },
    });

    expect(wrapper.text()).toContain("Delcom Courses");
    expect(wrapper.text()).toContain("Abdullah");
    expect(wrapper.text()).toContain("A");
    expect(wrapper.find('[data-testid="navbar-profile"]').element.getAttribute("href")).toBe(
      "/profile"
    );
    expect(wrapper.find('[data-testid="navbar-logout"]').exists()).toBe(true);
  });

  it("should render the profile photo when available", () => {
    const { wrapper } = renderWithProviders(Navbar, {
      props: { onToggleSidebar: vi.fn() },
      preloadedState: { profile: { ...profile, photo: "https://example.com/p.jpg" } },
    });

    expect(wrapper.find('img[src="https://example.com/p.jpg"]').exists()).toBe(true);
  });

  it("should hide the profile block when no profile is loaded", () => {
    const { wrapper } = renderWithProviders(Navbar, {
      props: { onToggleSidebar: vi.fn() },
    });

    expect(wrapper.find('[data-testid="navbar-profile"]').exists()).toBe(false);
  });

  it("should call onToggleSidebar when the menu button is clicked", async () => {
    const onToggleSidebar = vi.fn();
    const { wrapper } = renderWithProviders(Navbar, {
      props: { onToggleSidebar },
      preloadedState: { profile },
    });

    await wrapper.find('[data-testid="navbar-toggle"]').trigger("click");

    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("should log out, clear the stores, and go to the login page", async () => {
    const logoutSpy = vi
      .spyOn(authStore, "asyncSetIsAuthLogout")
      .mockResolvedValue();
    const resetSpy = vi.spyOn(authStore, "setIsAuthLogout");
    const { wrapper, usersStore } = renderWithProviders(Navbar, {
      props: { onToggleSidebar: vi.fn() },
      preloadedState: { profile },
    });
    const usersResetSpy = vi.spyOn(usersStore, "reset");

    await wrapper.find('[data-testid="navbar-logout"]').trigger("click");

    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
    expect(logoutSpy).toHaveBeenCalledTimes(1);
    expect(resetSpy).toHaveBeenCalledWith(false);
    expect(usersResetSpy).toHaveBeenCalledTimes(1);
  });
});
