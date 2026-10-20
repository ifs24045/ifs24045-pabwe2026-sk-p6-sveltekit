import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
import UsersPage from "./UsersPage.svelte";
import { usersStore } from "../states/usersStore";
import { renderWithProviders } from "../../../test-utils";

const users = [
  {
    id: "1",
    name: "Abdullah",
    email: "abdullah@delcom.org",
    photo: "https://example.com/photo.jpg",
    created_at: "2024-10-05T02:53:38.000000Z",
  },
  {
    id: "2",
    name: "Ubaid",
    email: "ubaid@delcom.org",
    photo: null,
    created_at: "2024-10-05T03:18:14.000000Z",
  },
  {
    id: "3",
    name: "",
    email: "",
    photo: null,
    created_at: null,
  },
];

describe("UsersPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(usersStore, "asyncSetUsers").mockResolvedValue();
  });

  it("should render the users list with photos, initials, and dates", () => {
    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: { users },
    });

    expect(wrapper.text()).toContain("Semua Pengguna");
    expect(wrapper.text()).toContain("Abdullah");
    expect(wrapper.text()).toContain("Ubaid");
    expect(wrapper.find('[data-testid="user-card-1"] img').exists()).toBe(true);
    expect(wrapper.find('[data-testid="user-card-2"]').text()).toContain("U");
    expect(wrapper.find('[data-testid="user-card-3"]').text()).toContain("U");
    expect(wrapper.find('[data-testid="user-card-3"]').text()).toContain("-");
  });

  it("should search users by name, email, and empty query", async () => {
    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: { users },
    });
    const search = wrapper.find('[data-testid="search-user-input"]');

    await search.setValue("abdullah");
    expect(wrapper.find('[data-testid="user-card-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="user-card-2"]').exists()).toBe(false);

    await search.setValue("ubaid@delcom");
    expect(wrapper.find('[data-testid="user-card-2"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="user-card-1"]').exists()).toBe(false);

    await search.setValue("tidak-ada");
    expect(wrapper.text()).toContain("Tidak ada data pengguna ditemukan.");

    await search.setValue("   ");
    expect(wrapper.find('[data-testid="user-card-1"]').exists()).toBe(true);
  });

  it("should render an empty list when users are null", async () => {
    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: { users: null },
    });

    await waitFor(() =>
      expect(wrapper.text()).toContain("Tidak ada data pengguna ditemukan.")
    );
  });

  it("should show a loading indicator while users are being fetched", async () => {
    let resolveLoad: (value: void) => void = () => {};
    vi.spyOn(usersStore, "asyncSetUsers").mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLoad = resolve;
      })
    );

    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: { users: [] },
    });

    expect(wrapper.text()).toContain("Memuat daftar pengguna...");

    resolveLoad();
    await waitFor(() => expect(wrapper.text()).not.toContain("Memuat daftar pengguna..."));
  });
});
