import { describe, it, expect, vi, beforeEach } from "vitest";
import authApi from "./authApi";
import apiHelper from "../../../helpers/apiHelper";

function mockResponse(body: any) {
  vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
    json: async () => body,
  } as unknown as Response);
}

describe("authApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("postRegister", () => {
    it("should return message on success response", async () => {
      mockResponse({ status: "success", message: "Berhasil melakukan pendaftaran" });
      const message = await authApi.postRegister("Delcom", "delcom@org.id", "123456");
      expect(message).toBe("Berhasil melakukan pendaftaran");
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/auth/register"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Delcom", email: "delcom@org.id", password: "123456" }),
        })
      );
    });

    it("should throw error when api returns fail", async () => {
      mockResponse({ status: "fail", message: "Data tidak valid" });
      await expect(authApi.postRegister("a", "b", "c")).rejects.toThrow("Data tidak valid");
    });

    it("should use default fallback message when message is missing", async () => {
      mockResponse({ status: "fail" });
      await expect(authApi.postRegister("a", "b", "c")).rejects.toThrow(
        "Gagal melakukan pendaftaran"
      );
    });

    it("should handle when data object has no error messages", async () => {
      mockResponse({ status: "fail", message: "Data tidak valid", data: {} });
      await expect(authApi.postRegister("a", "b", "c")).rejects.toThrow("Data tidak valid");
    });

    it("should ignore data that is not an object", async () => {
      mockResponse({ status: "fail", message: "Data tidak valid", data: "teks" });
      await expect(authApi.postRegister("a", "b", "c")).rejects.toThrow("Data tidak valid");
    });

    it("should format detailed validation errors when present", async () => {
      mockResponse({
        status: "fail",
        message: "Data tidak valid",
        data: { email: ["Email sudah terdaftar."] },
      });
      await expect(authApi.postRegister("a", "b", "c")).rejects.toThrow(
        "Data tidak valid: Email sudah terdaftar."
      );
    });
  });

  describe("postLogin", () => {
    it("should return data on success response", async () => {
      const data = { user: { id: 1 }, token: "fake-jwt" };
      mockResponse({ status: "success", data });
      expect(await authApi.postLogin("test@delcom.org", "123456")).toEqual(data);
    });

    it("should accept success flag as success", async () => {
      mockResponse({ success: true, data: { token: "t" } });
      expect(await authApi.postLogin("a", "b")).toEqual({ token: "t" });
    });

    it("should throw error when login fails", async () => {
      mockResponse({ status: "fail", message: "Kredensial akun tidak ditemukan" });
      await expect(authApi.postLogin("a", "b")).rejects.toThrow(
        "Kredensial akun tidak ditemukan"
      );
    });

    it("should use default fallback error message when missing", async () => {
      mockResponse({ status: "fail" });
      await expect(authApi.postLogin("a", "b")).rejects.toThrow("Gagal login");
    });
  });

  describe("postLogout", () => {
    it("should return message on success logout", async () => {
      mockResponse({ status: "success", message: "Berhasil logout" });
      expect(await authApi.postLogout()).toBe("Berhasil logout");
    });

    it("should throw error when logout fails", async () => {
      mockResponse({ status: "fail", message: "Token tidak sah" });
      await expect(authApi.postLogout()).rejects.toThrow("Token tidak sah");
    });

    it("should use default fallback message when missing on logout failure", async () => {
      mockResponse({ status: "fail" });
      await expect(authApi.postLogout()).rejects.toThrow("Gagal logout");
    });
  });
});