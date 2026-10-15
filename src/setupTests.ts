import "@testing-library/jest-dom";
import { beforeEach, vi } from "vitest";

vi.mock("$app/navigation", () => ({
  goto: vi.fn(),
}));

vi.mock("$app/state", () => ({
  page: {
    url: new URL("http://localhost/"),
    params: {} as Record<string, string>,
    route: { id: "/" },
    status: 200,
    error: null,
    data: {},
    form: null,
    state: {},
  },
}));

beforeEach(async () => {
  const { goto } = await import("$app/navigation");
  const { page } = await import("$app/state");
  const { authStore } = await import("./features/auth/states/authStore");
  const { usersStore } = await import("./features/users/states/usersStore");

  localStorage.clear();
  authStore.reset();
  usersStore.reset();
  vi.mocked(goto).mockReset();
  (page as any).url = new URL("http://localhost/");
  (page as any).params = {};
});