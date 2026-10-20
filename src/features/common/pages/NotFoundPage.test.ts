import { describe, it, expect } from "vitest";
import NotFoundPage from "./NotFoundPage.svelte";
import { renderWithProviders } from "../../../test-utils";

describe("NotFoundPage", () => {
  it("should render the not found message and a home link", () => {
    const { wrapper } = renderWithProviders(NotFoundPage);

    expect(wrapper.find('[data-testid="not-found-page"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Halaman Tidak Ditemukan");
    expect(wrapper.find("a").element.getAttribute("href")).toBe("/");
    expect(wrapper.text()).toContain("Kembali ke Beranda");
  });
});
