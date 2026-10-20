import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
import UsersRoute from "./+page.svelte";
import ProfileRoute from "../profile/+page.svelte";
import ErrorRoute from "../+error.svelte";
import { usersStore } from "../../features/users/states/usersStore";
import { renderWithProviders } from "../../test-utils";

const users = [{ id: "1", name: "Abdullah", email: "abdullah@del.org" }];
const profile = { id: "1", name: "Abdullah", email: "abdullah@del.org" };

describe("user routes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(usersStore, "asyncSetUsers").mockResolvedValue();
  });

  it("should render the users page on /users", async () => {
    const { wrapper } = renderWithProviders(UsersRoute, {
      preloadedState: { users },
    });

    await waitFor(() => expect(wrapper.text()).toContain("Semua Pengguna"));
    expect(wrapper.text()).toContain("Abdullah");
  });

  it("should render the profile page on /profile", () => {
    const { wrapper } = renderWithProviders(ProfileRoute, {
      preloadedState: { profile },
    });

    expect(wrapper.text()).toContain("Profil Akun");
    expect(wrapper.text()).toContain("Abdullah");
  });

  it("should render the not found page on errors", () => {
    const { wrapper } = renderWithProviders(ErrorRoute);

    expect(wrapper.find('[data-testid="not-found-page"]').exists()).toBe(true);
  });
});
