import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUsersStore, usersStore } from "./usersStore";
import userApi from "../api/userApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

const profile = { id: "1", name: "Me", email: "me@del.org" };

describe("usersStore", () => {
  beforeEach(() => {
    usersStore.reset();
    vi.restoreAllMocks();
    vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => ({}) as any);
    vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => ({}) as any);
  });

  it("should have correct default state", () => {
    const store = useUsersStore();
    expect(store.users).toEqual([]);
    expect(store.user).toBeNull();
    expect(store.profile).toBeNull();
    expect(store.profileError).toBeNull();
    expect(store.isProfile).toBe(false);
    expect(store.isChangeProfile).toBe(false);
    expect(store.isChangeProfilePhoto).toBe(false);
    expect(store.isChangeProfilePassword).toBe(false);
  });

  it("should update state with setters", () => {
    usersStore.setUsers([profile]);
    usersStore.setUser(profile);
    usersStore.setProfile(profile);
    usersStore.setProfileError("failed");
    usersStore.setIsProfile(true);
    usersStore.setIsChangeProfile(true);
    usersStore.setIsChangeProfilePhoto(true);
    usersStore.setIsChangeProfilePassword(true);

    expect(usersStore.users).toEqual([profile]);
    expect(usersStore.user).toEqual(profile);
    expect(usersStore.profile).toEqual(profile);
    expect(usersStore.profileError).toBe("failed");
    expect(usersStore.isProfile).toBe(true);
    expect(usersStore.isChangeProfile).toBe(true);
    expect(usersStore.isChangeProfilePhoto).toBe(true);
    expect(usersStore.isChangeProfilePassword).toBe(true);
    expect(usersStore.$state.profile).toEqual(profile);
  });

  it("should reset with partial state", () => {
    usersStore.reset({ profile });
    expect(usersStore.profile).toEqual(profile);
    expect(usersStore.users).toEqual([]);
  });

  describe("asyncSetUsers", () => {
    it("should store users on success", async () => {
      vi.spyOn(userApi, "getUsers").mockResolvedValue([profile]);
      await usersStore.asyncSetUsers();
      expect(usersStore.users).toEqual([profile]);
    });

    it("should store empty list on failure", async () => {
      vi.spyOn(userApi, "getUsers").mockRejectedValue(new Error("x"));
      usersStore.setUsers([profile]);
      await usersStore.asyncSetUsers();
      expect(usersStore.users).toEqual([]);
    });
  });

  describe("asyncSetUserById", () => {
    it("should store user on success", async () => {
      vi.spyOn(userApi, "getUserById").mockResolvedValue(profile);
      await usersStore.asyncSetUserById("1");
      expect(usersStore.user).toEqual(profile);
    });

    it("should store null on failure", async () => {
      vi.spyOn(userApi, "getUserById").mockRejectedValue(new Error("x"));
      usersStore.setUser(profile);
      await usersStore.asyncSetUserById("1");
      expect(usersStore.user).toBeNull();
    });
  });

  describe("asyncSetProfile", () => {
    it("should store profile and mark isProfile on success", async () => {
      vi.spyOn(userApi, "getProfile").mockResolvedValue(profile);
      await usersStore.asyncSetProfile();
      expect(usersStore.profile).toEqual(profile);
      expect(usersStore.profileError).toBeNull();
      expect(usersStore.isProfile).toBe(true);
    });

    it("should flag unauthorized on 401", async () => {
      const error: any = new Error("Token");
      error.status = 401;
      vi.spyOn(userApi, "getProfile").mockRejectedValue(error);
      await usersStore.asyncSetProfile();
      expect(usersStore.profile).toBeNull();
      expect(usersStore.profileError).toBe("unauthorized");
      expect(usersStore.isProfile).toBe(true);
    });

    it("should flag failed on other errors", async () => {
      vi.spyOn(userApi, "getProfile").mockRejectedValue(new Error("down"));
      await usersStore.asyncSetProfile();
      expect(usersStore.profileError).toBe("failed");
      expect(usersStore.isProfile).toBe(true);
    });
  });

  describe("asyncPutProfile", () => {
    it("should update profile and show success", async () => {
      vi.spyOn(userApi, "putProfile").mockResolvedValue(profile);
      await usersStore.asyncPutProfile("Me", "me@del.org");
      expect(usersStore.profile).toEqual(profile);
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Profil berhasil diperbarui!");
      expect(usersStore.isChangeProfile).toBe(true);
    });

    it("should show error on failure", async () => {
      vi.spyOn(userApi, "putProfile").mockRejectedValue(new Error("Email dipakai"));
      await usersStore.asyncPutProfile("Me", "me@del.org");
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Email dipakai");
      expect(usersStore.isChangeProfile).toBe(false);
    });
  });

  describe("asyncPostProfilePhoto", () => {
    const file = new File(["x"], "a.png");

    it("should use api message and refresh profile", async () => {
      vi.spyOn(userApi, "postProfilePhoto").mockResolvedValue("Foto OK");
      vi.spyOn(userApi, "getProfile").mockResolvedValue(profile);
      await usersStore.asyncPostProfilePhoto(file);
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Foto OK");
      expect(usersStore.profile).toEqual(profile);
      expect(usersStore.isChangeProfilePhoto).toBe(true);
    });

    it("should use default message when api message is empty", async () => {
      vi.spyOn(userApi, "postProfilePhoto").mockResolvedValue("");
      vi.spyOn(userApi, "getProfile").mockResolvedValue(profile);
      await usersStore.asyncPostProfilePhoto(file);
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith(
        "Foto profil berhasil diperbarui!"
      );
    });

    it("should show error on failure", async () => {
      vi.spyOn(userApi, "postProfilePhoto").mockRejectedValue(new Error("Gagal unggah"));
      await usersStore.asyncPostProfilePhoto(file);
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal unggah");
      expect(usersStore.isChangeProfilePhoto).toBe(false);
    });
  });

  describe("asyncPutProfilePassword", () => {
    it("should use api message on success", async () => {
      vi.spyOn(userApi, "putProfilePassword").mockResolvedValue("Sandi OK");
      await usersStore.asyncPutProfilePassword("a", "b", "b");
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Sandi OK");
      expect(usersStore.isChangeProfilePassword).toBe(true);
    });

    it("should use default message when api message is empty", async () => {
      vi.spyOn(userApi, "putProfilePassword").mockResolvedValue("");
      await usersStore.asyncPutProfilePassword("a", "b");
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith(
        "Kata sandi berhasil diperbarui!"
      );
    });

    it("should show error on failure", async () => {
      vi.spyOn(userApi, "putProfilePassword").mockRejectedValue(new Error("Sandi salah"));
      await usersStore.asyncPutProfilePassword("a", "b");
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Sandi salah");
      expect(usersStore.isChangeProfilePassword).toBe(false);
    });
  });
});