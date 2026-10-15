import { describe, it, expect, vi, beforeEach } from "vitest";
import { tick } from "svelte";
import { waitFor } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import LoginPage from "./LoginPage.svelte";
import AuthSessionRedirect from "../components/AuthSessionRedirect.svelte";
import { renderWithProviders } from "../../../test-utils";
import authApi from "../api/authApi";
import userApi from "../../users/api/userApi";
import apiHelper from "../../../helpers/apiHelper";
import * as toolsHelper from "../../../helpers/toolsHelper";

const profile = { id: "1", name: "Me", email: "me@del.org" };

async function fillAndSubmit(wrapper: any) {
  await wrapper.find('[data-testid="login-email-input"]').setValue("testing@delcom.org");
  await wrapper.find('[data-testid="login-password-input"]').setValue("123456");
  await wrapper.find("form").trigger("submit");
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => ({}) as any);
  });

  it("should render inputs and submit credentials", async () => {
    const { wrapper, authStore } = renderWithProviders(LoginPage);
    const loginSpy = vi.spyOn(authStore, "asyncSetIsAuthLogin").mockResolvedValue();

    await fillAndSubmit(wrapper);

    expect(loginSpy).toHaveBeenCalledWith("testing@delcom.org", "123456");
  });

  it("should stay on the form when login fails", async () => {
    const { wrapper, authStore, usersStore } = renderWithProviders(LoginPage);
    vi.spyOn(authStore, "asyncSetIsAuthLogin").mockResolvedValue();
    const profileSpy = vi.spyOn(usersStore, "asyncSetProfile");

    await fillAndSubmit(wrapper);

    expect(profileSpy).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Masuk Sekarang");
    expect((wrapper.find('[data-testid="login-submit-button"]').element as HTMLButtonElement).disabled).toBe(false);
  });

  it("should stop when login succeeds but token is missing", async () => {
    const { wrapper, authStore, usersStore } = renderWithProviders(LoginPage);
    vi.spyOn(authStore, "asyncSetIsAuthLogin").mockImplementation(async () => {
      authStore.setIsAuthLogin(true);
    });
    const profileSpy = vi.spyOn(usersStore, "asyncSetProfile");

    await fillAndSubmit(wrapper);

    expect(profileSpy).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Masuk Sekarang");
  });

  it("should show loading state, load profile, then reset login flag", async () => {
    const { wrapper, authStore, usersStore } = renderWithProviders(LoginPage);
    vi.spyOn(authStore, "asyncSetIsAuthLogin").mockImplementation(async () => {
      apiHelper.putAccessToken("jwt-123");
      authStore.setIsAuthLogin(true);
    });

    let finishProfile!: () => void;
    const profileSpy = vi.spyOn(usersStore, "asyncSetProfile").mockImplementation(
      () => new Promise<void>((resolve) => (finishProfile = resolve))
    );

    await fillAndSubmit(wrapper);
    await tick();

    expect(profileSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain("Sedang Masuk...");
    expect((wrapper.find('[data-testid="login-submit-button"]').element as HTMLButtonElement).disabled).toBe(true);

    finishProfile();
    await waitFor(() => expect(wrapper.text()).toContain("Masuk Sekarang"));
    expect(authStore.isAuthLogin).toBe(false);
  });

  it("should redirect home once token, login status, and profile are ready", async () => {
    vi.spyOn(authApi, "postLogin").mockResolvedValue({ token: "jwt-123" });
    vi.spyOn(userApi, "getProfile").mockResolvedValue(profile);

    const { wrapper } = renderWithProviders(LoginPage);
    renderWithProviders(AuthSessionRedirect);

    await fillAndSubmit(wrapper);

    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
    expect(goto).toHaveBeenCalledTimes(1);
    expect(apiHelper.getAccessToken()).toBe("jwt-123");
    await waitFor(() => expect(wrapper.text()).toContain("Masuk Sekarang"));
  });

  it("should not redirect when the profile cannot be loaded", async () => {
    vi.spyOn(authApi, "postLogin").mockResolvedValue({ token: "jwt-123" });
    vi.spyOn(userApi, "getProfile").mockRejectedValue(new Error("Gagal"));

    const { wrapper, usersStore } = renderWithProviders(LoginPage);
    renderWithProviders(AuthSessionRedirect);

    await fillAndSubmit(wrapper);

    await waitFor(() => expect(usersStore.profileError).toBe("failed"));
    await waitFor(() => expect(wrapper.text()).toContain("Masuk Sekarang"));
    expect(goto).not.toHaveBeenCalled();
  });
});