import { describe, it, expect, vi, beforeEach } from "vitest";
import Sidebar from "./Sidebar.svelte";
import { renderWithProviders } from "../../../test-utils";

describe("Sidebar", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render all navigation links", () => {
    const { wrapper } = renderWithProviders(Sidebar, {
      props: { onNavigate: vi.fn() },
      route: "/",
    });
    const links = wrapper.findAll('[data-testid="sidebar-link"]');

    expect(links).toHaveLength(3);
    expect(wrapper.text()).toContain("Semua Kursus");
    expect(wrapper.text()).toContain("Pengguna");
    expect(wrapper.text()).toContain("Profil Saya");
    expect(links[0].element.getAttribute("href")).toBe("/");
    expect(links[1].element.getAttribute("href")).toBe("/users");
    expect(links[2].element.getAttribute("href")).toBe("/profile");
  });

  it("should hide the sidebar when closed and show it when opened", async () => {
    const { wrapper } = renderWithProviders(Sidebar, {
      props: { onNavigate: vi.fn() },
      route: "/",
    });

    expect(wrapper.find('[data-testid="sidebar"]').element.className).toContain("hidden");

    await wrapper.findAll('[data-testid="sidebar-link"]')[0].trigger("click");
    const opened = renderWithProviders(Sidebar, {
      props: { open: true, onNavigate: vi.fn() },
      route: "/",
    });
    expect(opened.wrapper.find('[data-testid="sidebar"]').element.className).toContain(
      "block"
    );
  });

  it("should mark the active link for course routes", () => {
    const { wrapper } = renderWithProviders(Sidebar, {
      props: { onNavigate: vi.fn() },
      route: "/courses/7",
    });
    const links = wrapper.findAll('[data-testid="sidebar-link"]');

    expect(links[0].element.className).toContain("bg-indigo-50");
    expect(links[1].element.className).not.toContain("bg-indigo-50");
    expect(links[2].element.className).not.toContain("bg-indigo-50");
  });

  it("should mark the active link for users and profile routes", () => {
    const users = renderWithProviders(Sidebar, {
      props: { onNavigate: vi.fn() },
      route: "/users/2",
    });
    const profilePage = renderWithProviders(Sidebar, {
      props: { onNavigate: vi.fn() },
      route: "/profile",
    });

    expect(users.wrapper.findAll('[data-testid="sidebar-link"]')[1].element.className).toContain(
      "bg-indigo-50"
    );
    expect(
      profilePage.wrapper.findAll('[data-testid="sidebar-link"]')[2].element.className
    ).toContain("bg-indigo-50");
  });

  it("should call onNavigate when a link is clicked", async () => {
    const onNavigate = vi.fn();
    const { wrapper } = renderWithProviders(Sidebar, {
      props: { onNavigate },
      route: "/",
    });
    const link = wrapper.findAll('[data-testid="sidebar-link"]')[1].element;
    link.addEventListener("click", (event) => event.preventDefault());

    await wrapper.findAll('[data-testid="sidebar-link"]')[1].trigger("click");

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
