import { describe, it, expect, vi, beforeEach } from "vitest";
import { tick } from "svelte";
import { goto } from "$app/navigation";
import RegisterPage from "./RegisterPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

async function fillForm(wrapper: any, values: Record<string, string>) {
  const ids: Record<string, string> = {
    name: "register-name-input",
    email: "register-email-input",
    password: "register-password-input",
    confirm: "register-password-confirm-input",
  };
  for (const [key, value] of Object.entries(values)) {
    await wrapper.find(`[data-testid="${ids[key]}"]`).setValue(value);
  }
}

describe("RegisterPage", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => ({}) as any);
  });

  it("should show error when name is empty", async () => {
    const { wrapper } = renderWithProviders(RegisterPage);
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Nama lengkap wajib diisi!");
  });

  it("should show error when email is empty", async () => {
    const { wrapper } = renderWithProviders(RegisterPage);
    await fillForm(wrapper, { name: "Abdul" });
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Email wajib diisi!");
  });

  it("should show error when password is empty", async () => {
    const { wrapper } = renderWithProviders(RegisterPage);
    await fillForm(wrapper, { name: "Abdul", email: "abdul@del.org" });
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Kata sandi wajib diisi!");
  });

  it("should show error when password confirmation does not match", async () => {
    const { wrapper } = renderWithProviders(RegisterPage);
    await fillForm(wrapper, {
      name: "Abdul",
      email: "abdul@del.org",
      password: "pass1",
      confirm: "pass2",
    });
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Konfirmasi kata sandi tidak cocok!");
  });

  it("should submit trimmed values and go to login when registration succeeds", async () => {
    const { wrapper, authStore } = renderWithProviders(RegisterPage);
    const registerSpy = vi
      .spyOn(authStore, "asyncSetIsAuthRegister")
      .mockImplementation(async () => {
        authStore.setIsAuthRegister(true);
      });

    await fillForm(wrapper, {
      name: " Abdul ",
      email: " abdul@del.org ",
      password: "pass123",
      confirm: "pass123",
    });
    await wrapper.find("form").trigger("submit");
    await tick();

    expect(registerSpy).toHaveBeenCalledWith("Abdul", "abdul@del.org", "pass123");
    expect(goto).toHaveBeenCalledWith("/auth/login");
    expect(authStore.isAuthRegister).toBe(false);
  });

  it("should stay on the form when registration fails", async () => {
    const { wrapper, authStore } = renderWithProviders(RegisterPage);
    vi.spyOn(authStore, "asyncSetIsAuthRegister").mockResolvedValue();

    await fillForm(wrapper, {
      name: "Abdul",
      email: "abdul@del.org",
      password: "pass123",
      confirm: "pass123",
    });
    await wrapper.find("form").trigger("submit");
    await tick();

    expect(goto).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Daftar Sekarang");
  });

  it("should show loading state while registering", async () => {
    const { wrapper, authStore } = renderWithProviders(RegisterPage);
    let finish!: () => void;
    vi.spyOn(authStore, "asyncSetIsAuthRegister").mockImplementation(
      () => new Promise<void>((resolve) => (finish = resolve))
    );

    await fillForm(wrapper, {
      name: "Abdul",
      email: "abdul@del.org",
      password: "pass123",
      confirm: "pass123",
    });
    await wrapper.find("form").trigger("submit");
    await tick();

    expect(wrapper.text()).toContain("Sedang Mendaftar...");
    expect((wrapper.find('[data-testid="register-submit-button"]').element as HTMLButtonElement).disabled).toBe(true);

    finish();
    await tick();
    await tick();
    expect(wrapper.text()).toContain("Daftar Sekarang");
  });
});