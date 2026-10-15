import { describe, it, expect } from "vitest";
import { createRawSnippet } from "svelte";
import AuthRouteLayout from "./+layout.svelte";
import LoginRoute from "./login/+page.svelte";
import RegisterRoute from "./register/+page.svelte";
import { renderWithProviders } from "../../test-utils";

describe("auth routes", () => {
  it("should wrap children with the auth layout", () => {
    const children = createRawSnippet(() => ({
      render: () => `<p data-testid="child">Konten rute</p>`,
    }));

    const { wrapper } = renderWithProviders(AuthRouteLayout, {
      route: "/auth/login",
      props: { children },
    });

    expect(wrapper.text()).toContain("Delcom Courses");
    expect(wrapper.find('[data-testid="child"]').text()).toBe("Konten rute");
  });

  it("should render the login form on /auth/login", () => {
    const { wrapper } = renderWithProviders(LoginRoute, { route: "/auth/login" });
    expect(wrapper.find('[data-testid="login-email-input"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Masuk Sekarang");
  });

  it("should render the register form on /auth/register", () => {
    const { wrapper } = renderWithProviders(RegisterRoute, { route: "/auth/register" });
    expect(wrapper.find('[data-testid="register-name-input"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Daftar Sekarang");
  });
});