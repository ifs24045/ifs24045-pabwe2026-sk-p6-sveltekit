import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore, authStore } from "./authStore";
import authApi from "../api/authApi";
import apiHelper from "../../../helpers/apiHelper";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("authStore", () => {
  beforeEach(() => {
    authStore.reset();
    vi.restoreAllMocks();
  });

  it("should have correct default state", () => {
    const store = useAuthStore();
    expect(store.isAuthLogin).toBe(false);
    expect(store.isAuthRegister).toBe(false);
    expect(store.isAuthLogout).toBe(false);
    expect(store.$state).toEqual({
      isAuthLogin: false,
      isAuthRegister: false,
      isAuthLogout: false,
    });
  });

  it("should update state with setters", () => {
    authStore.setIsAuthLogin(true);
    authStore.setIsAuthRegister(true);
    authStore.setIsAuthLogout(true);
    expect(authStore.isAuthLogin).toBe(true);
    expect(authStore.isAuthRegister).toBe(true);
    expect(authStore.isAuthLogout).toBe(true);
  });

  it("should reset with partial state", () => {
    authStore.reset({ isAuthLogin: true });
    expect(authStore.isAuthLogin).toBe(true);
    expect(authStore.isAuthRegister).toBe(false);
  });

  describe("asyncSetIsAuthLogin", () => {
    it("should set isAuthLogin to true and store token on success", async () => {
      vi.spyOn(authApi, "postLogin").mockResolvedValue({ token: "jwt-123" });
      const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

      await authStore.asyncSetIsAuthLogin("email@del.org", "password");

      expect(putTokenSpy).toHaveBeenCalledWith("jwt-123");
      expect(authStore.isAuthLogin).toBe(true);
    });

    it("should set isAuthLogin to false and show error on failure", async () => {
      vi.spyOn(authApi, "postLogin").mockRejectedValue(new Error("Login gagal"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => ({}) as any);

      await authStore.asyncSetIsAuthLogin("email@del.org", "wrong");

      expect(errorSpy).toHaveBeenCalledWith("Login gagal");
      expect(authStore.isAuthLogin).toBe(false);
    });
  });

  describe("asyncSetIsAuthRegister", () => {
    it("should set isAuthRegister to true and show success dialog", async () => {
      vi.spyOn(authApi, "postRegister").mockResolvedValue("Registrasi Berhasil");
      const successSpy = vi
        .spyOn(toolsHelper, "showSuccessDialog")
        .mockImplementation(() => ({}) as any);

      await authStore.asyncSetIsAuthRegister("Name", "name@del.org", "pass");

      expect(successSpy).toHaveBeenCalledWith("Registrasi Berhasil");
      expect(authStore.isAuthRegister).toBe(true);
    });

    it("should set isAuthRegister to false and show error dialog on failure", async () => {
      vi.spyOn(authApi, "postRegister").mockRejectedValue(new Error("Email sudah terdaftar"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => ({}) as any);

      await authStore.asyncSetIsAuthRegister("Name", "name@del.org", "pass");

      expect(errorSpy).toHaveBeenCalledWith("Email sudah terdaftar");
      expect(authStore.isAuthRegister).toBe(false);
    });
  });

  describe("asyncSetIsAuthLogout", () => {
    it("should clear token and set isAuthLogout to true on success", async () => {
      vi.spyOn(authApi, "postLogout").mockResolvedValue("Berhasil logout");
      const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

      await authStore.asyncSetIsAuthLogout();

      expect(putTokenSpy).toHaveBeenCalledWith("");
      expect(authStore.isAuthLogout).toBe(true);
    });

    it("should still clear token even if api throws error", async () => {
      vi.spyOn(authApi, "postLogout").mockRejectedValue(new Error("Network fail"));
      const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

      await authStore.asyncSetIsAuthLogout();

      expect(putTokenSpy).toHaveBeenCalledWith("");
      expect(authStore.isAuthLogout).toBe(true);
    });
  });
});