import { describe, it, expect, vi, beforeEach } from "vitest";
import userApi from "./userApi";
import apiHelper from "../../../helpers/apiHelper";

function mockResponse(body: any, status = 200) {
  vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
    status,
    json: async () => body,
  } as unknown as Response);
}

describe("userApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getUsers", () => {
    it("should return users list on success", async () => {
      mockResponse({ status: "success", data: { users: [{ id: "1", name: "A" }] } });
      expect(await userApi.getUsers()).toEqual([{ id: "1", name: "A" }]);
    });

    it("should return empty array when users are missing", async () => {
      mockResponse({ success: true });
      expect(await userApi.getUsers()).toEqual([]);
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Gagal custom" });
      await expect(userApi.getUsers()).rejects.toThrow("Gagal custom");
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(userApi.getUsers()).rejects.toThrow("Gagal mengambil data pengguna");
    });
  });

  describe("getUserById", () => {
    it("should return user on success", async () => {
      mockResponse({ status: "success", data: { user: { id: "9" } } });
      expect(await userApi.getUserById("9")).toEqual({ id: "9" });
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Tidak ada" });
      await expect(userApi.getUserById("9")).rejects.toThrow("Tidak ada");
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(userApi.getUserById("9")).rejects.toThrow("Gagal mengambil detail pengguna");
    });
  });

  describe("getProfile", () => {
    it("should return profile on success", async () => {
      mockResponse({ status: "success", data: { user: { id: "1", name: "Me" } } });
      expect(await userApi.getProfile()).toEqual({ id: "1", name: "Me" });
    });

    it("should throw error carrying http status", async () => {
      mockResponse({ status: "fail", message: "Token tidak valid" }, 401);
      await expect(userApi.getProfile()).rejects.toMatchObject({
        message: "Token tidak valid",
        status: 401,
      });
    });

    it("should throw default message when message is missing", async () => {
      mockResponse({ status: "fail" }, 500);
      await expect(userApi.getProfile()).rejects.toThrow("Gagal mengambil data profil");
    });
  });

  describe("putProfile", () => {
    it("should send name and email and return user", async () => {
      mockResponse({ status: "success", data: { user: { id: "1", name: "Baru" } } });
      const user = await userApi.putProfile("Baru", "baru@del.org");
      expect(user).toEqual({ id: "1", name: "Baru" });
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/users/me"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ name: "Baru", email: "baru@del.org" }),
        })
      );
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Email dipakai" });
      await expect(userApi.putProfile("a", "b")).rejects.toThrow("Email dipakai");
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(userApi.putProfile("a", "b")).rejects.toThrow("Gagal mengubah profil");
    });
  });

  describe("postProfilePhoto", () => {
    it("should upload file with its own name", async () => {
      mockResponse({ status: "success", message: "Foto diubah" });
      const file = new File(["x"], "foto.png", { type: "image/png" });
      expect(await userApi.postProfilePhoto(file)).toBe("Foto diubah");

      const options = vi.mocked(apiHelper.fetchData).mock.calls[0][1] as RequestInit;
      expect(options.method).toBe("PUT");
      expect((options.body as FormData).get("photo")).toBeInstanceOf(File);
    });

    it("should fall back to profile.png when file has no name", async () => {
      mockResponse({ status: "success", message: "ok" });
      const blob = new Blob(["x"], { type: "image/png" }) as File;
      await userApi.postProfilePhoto(blob);

      const options = vi.mocked(apiHelper.fetchData).mock.calls[0][1] as RequestInit;
      expect(((options.body as FormData).get("photo") as File).name).toBe("profile.png");
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Berkas terlalu besar" });
      const file = new File(["x"], "foto.png");
      await expect(userApi.postProfilePhoto(file)).rejects.toThrow("Berkas terlalu besar");
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      const file = new File(["x"], "foto.png");
      await expect(userApi.postProfilePhoto(file)).rejects.toThrow("Gagal mengubah foto profil");
    });
  });

  describe("putProfilePassword", () => {
    it("should send confirmation when given", async () => {
      mockResponse({ status: "success", message: "Sandi diubah" });
      expect(await userApi.putProfilePassword("lama", "baru", "baru2")).toBe("Sandi diubah");
      const options = vi.mocked(apiHelper.fetchData).mock.calls[0][1] as RequestInit;
      expect(JSON.parse(options.body as string)).toEqual({
        password: "lama",
        new_password: "baru",
        new_password_confirmation: "baru2",
      });
    });

    it("should reuse new password as confirmation when omitted", async () => {
      mockResponse({ status: "success", message: "ok" });
      await userApi.putProfilePassword("lama", "baru");
      const options = vi.mocked(apiHelper.fetchData).mock.calls[0][1] as RequestInit;
      expect(JSON.parse(options.body as string).new_password_confirmation).toBe("baru");
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Sandi salah" });
      await expect(userApi.putProfilePassword("a", "b")).rejects.toThrow("Sandi salah");
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(userApi.putProfilePassword("a", "b")).rejects.toThrow(
        "Gagal mengubah kata sandi"
      );
    });
  });
});