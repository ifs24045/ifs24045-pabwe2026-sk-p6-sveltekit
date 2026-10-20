import { describe, it, expect, vi } from "vitest";
import { createRawSnippet } from "svelte";
import ModalShell from "./ModalShell.svelte";
import { renderWithProviders } from "../../../test-utils";

const children = createRawSnippet(() => ({
  render: () => `<p data-testid="modal-body">Isi dialog</p>`,
}));

describe("ModalShell", () => {
  it("should render the title and children", () => {
    const { wrapper } = renderWithProviders(ModalShell, {
      props: { title: "Judul Dialog", onClose: vi.fn(), children },
    });

    expect(wrapper.text()).toContain("Judul Dialog");
    expect(wrapper.find('[data-testid="modal-body"]').text()).toBe("Isi dialog");
    expect(wrapper.find('[role="dialog"]').element.getAttribute("aria-label")).toBe(
      "Judul Dialog"
    );
  });

  it("should close from the close button", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(ModalShell, {
      props: { title: "Judul Dialog", onClose, children },
    });

    await wrapper.find('[data-testid="modal-close"]').trigger("click");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should close from the backdrop", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(ModalShell, {
      props: { title: "Judul Dialog", onClose, children },
    });

    await wrapper.find('[data-testid="modal-backdrop"]').trigger("click");

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
