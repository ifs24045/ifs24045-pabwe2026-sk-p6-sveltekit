import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import AuthSessionRedirect from "./AuthSessionRedirect.svelte";
import { renderWithProviders } from "../../../test-utils";
import userApi from "../../users/api/userApi";

const profile = { id: "1", name: "Me", email: "me@del.org" };

describe("AuthSessionRedirect", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not load profile or redirect when there is no token", () => {
    const getProfile = vi.spyOn(userApi, "getProfile");
    renderWithProviders(AuthSessionRedirect);

    expect(getProfile).not.toHaveBeenCalled();
    expect(goto).not.toHaveBeenCalled();
  });

  it("should load profile and redirect home when token and profile are ready", async () => {
    localStorage.setItem("accessToken", "valid-token");
    const getProfile = vi.spyOn(userApi, "getProfile").mockResolvedValue(profile);

    const { usersStore } = renderWithProviders(AuthSessionRedirect);

    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
    expect(getProfile).toHaveBeenCalledTimes(1);
    expect(usersStore.isProfile).toBe(false);
  });

  it("should not redirect when profile request fails", async () => {
    localStorage.setItem("accessToken", "expired-token");
    vi.spyOn(userApi, "getProfile").mockRejectedValue(new Error("Token tidak valid"));

    const { usersStore } = renderWithProviders(AuthSessionRedirect);

    await waitFor(() => expect(usersStore.profileError).toBe("failed"));
    expect(usersStore.isProfile).toBe(false);
    expect(goto).not.toHaveBeenCalled();
  });

  it("should not redirect when profile is ready but token is missing", () => {
    const { usersStore } = renderWithProviders(AuthSessionRedirect);

    usersStore.reset({ profile, isProfile: true });

    expect(usersStore.isProfile).toBe(false);
    expect(goto).not.toHaveBeenCalled();
  });

  it("should redirect when profile and token are ready after login", () => {
    const { usersStore } = renderWithProviders(AuthSessionRedirect);
    localStorage.setItem("accessToken", "fresh-token");

    usersStore.reset({ profile, isProfile: true });

    expect(usersStore.isProfile).toBe(false);
    expect(goto).toHaveBeenCalledWith("/");
  });

  it("should ignore store updates after it is destroyed", () => {
    const { usersStore } = renderWithProviders(AuthSessionRedirect);
    document.body.innerHTML = "";
    localStorage.setItem("accessToken", "fresh-token");

    usersStore.setUsers([]);

    expect(goto).not.toHaveBeenCalled();
  });
});