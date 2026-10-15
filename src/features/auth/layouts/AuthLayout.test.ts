import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRawSnippet } from "svelte";
import { goto } from "$app/navigation";
import AuthLayout from "./AuthLayout.svelte";
import { renderWithProviders } from "../../../test-utils";
import userApi from "../../users/api/userApi";

const child = createRawSnippet(() => ({
  render: () => `<p data-testid="child">Isi halaman</p>`,
}));

describe("AuthLayout", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render course branding, tabs, and children", () => {
    const { wrapper } = renderWithProviders(AuthLayout, {
      route: "/auth/login",
      props: { children: child },
    });

    expect(wrapper.text()).toContain("Delcom Courses");
    expect(wrapper.text()).toContain("kursus online");
    expect(wrapper.text()).toContain("Masuk Akun");
    expect(wrapper.text()).toContain("Daftar Baru");
    expect(wrapper.find('[data-testid="child"]').text()).toBe("Isi halaman");
  });

  it("should render without children", () => {
    const { wrapper } = renderWithProviders(AuthLayout, { route: "/auth/login" });

    expect(wrapper.text()).toContain("Delcom Courses");
    expect(wrapper.find('[data-testid="child"]').exists()).toBe(false);
  });

  it("should highlight the login tab on /auth/login", () => {
    const { wrapper } = renderWithProviders(AuthLayout, { route: "/auth/login" });

    const [loginTab, registerTab] = wrapper.findAll("button");
    expect(loginTab.element.className).toContain("text-indigo-700");
    expect(registerTab.element.className).not.toContain("text-indigo-700");
  });

  it("should highlight the register tab on /auth/register", () => {
    const { wrapper } = renderWithProviders(AuthLayout, { route: "/auth/register" });

    const [loginTab, registerTab] = wrapper.findAll("button");
    expect(loginTab.element.className).not.toContain("text-indigo-700");
    expect(registerTab.element.className).toContain("text-indigo-700");
  });

  it("should navigate with goto when tab buttons are clicked", async () => {
    const { wrapper } = renderWithProviders(AuthLayout, { route: "/auth/login" });

    const [loginTab, registerTab] = wrapper.findAll("button");
    await loginTab.trigger("click");
    expect(goto).toHaveBeenCalledWith("/auth/login");

    await registerTab.trigger("click");
    expect(goto).toHaveBeenCalledWith("/auth/register");
  });

  it("should redirect an existing session to home", async () => {
    localStorage.setItem("accessToken", "valid-token");
    vi.spyOn(userApi, "getProfile").mockResolvedValue({
      id: "1",
      name: "Me",
      email: "me@del.org",
    });

    renderWithProviders(AuthLayout, { route: "/auth/login" });

    await vi.waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
  });
});