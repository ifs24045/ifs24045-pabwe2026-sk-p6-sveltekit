import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
import AddModal from "./AddModal.svelte";
import { coursesStore } from "../states/coursesStore";
import { renderWithProviders } from "../../../test-utils";

describe("AddModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render the add course form", () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { onClose: vi.fn(), onSuccess: vi.fn() },
    });

    expect(wrapper.text()).toContain("Tambah Kursus");
    expect(wrapper.find('[data-testid="add-course-title"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="add-course-description"]').exists()).toBe(true);
  });

  it("should close when the cancel button is clicked", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(AddModal, {
      props: { onClose, onSuccess: vi.fn() },
    });

    await wrapper.find('[data-testid="add-course-cancel"]').trigger("click");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should submit the trimmed values and call onSuccess on success", async () => {
    const addSpy = vi
      .spyOn(coursesStore, "asyncAddCourse")
      .mockImplementation(async () => {
        coursesStore.setFlag("isAddCourse", true);
      });
    const onSuccess = vi.fn();
    const { wrapper } = renderWithProviders(AddModal, {
      props: { onClose: vi.fn(), onSuccess },
    });

    await wrapper.find('[data-testid="add-course-title"]').setValue("  Kursus Baru  ");
    await wrapper
      .find('[data-testid="add-course-description"]')
      .setValue("  Deskripsi baru  ");
    await wrapper.find("form").trigger("submit");

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(addSpy).toHaveBeenCalledWith("Kursus Baru", "Deskripsi baru");
    expect(coursesStore.$state.isAddCourse).toBe(false);
  });

  it("should keep the modal open and show the loading state while saving", async () => {
    let resolveAdd: (value: void) => void = () => {};
    vi.spyOn(coursesStore, "asyncAddCourse").mockReturnValue(
      new Promise<void>((resolve) => {
        resolveAdd = resolve;
      })
    );
    const onSuccess = vi.fn();
    const { wrapper } = renderWithProviders(AddModal, {
      props: { onClose: vi.fn(), onSuccess },
    });

    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("Menyimpan...");
    expect(
      wrapper.find('[data-testid="add-course-submit"]').element.hasAttribute("disabled")
    ).toBe(true);

    resolveAdd();
    await waitFor(() => expect(wrapper.text()).toContain("Simpan"));
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
