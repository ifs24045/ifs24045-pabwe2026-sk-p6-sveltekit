import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
import ChangeModal from "./ChangeModal.svelte";
import { coursesStore } from "../states/coursesStore";
import { renderWithProviders } from "../../../test-utils";

const course = {
  id: "1",
  user_id: "1",
  title: "Kursus Lama",
  description: "Deskripsi lama",
};

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should prefill the form with the course data", () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { course, onClose: vi.fn(), onSuccess: vi.fn() },
    });

    expect(wrapper.text()).toContain("Ubah Kursus");
    expect(
      (wrapper.find('[data-testid="change-course-title"]').element as HTMLInputElement).value
    ).toBe("Kursus Lama");
    expect(
      (
        wrapper.find('[data-testid="change-course-description"]')
          .element as HTMLTextAreaElement
      ).value
    ).toBe("Deskripsi lama");
  });

  it("should close when the cancel button is clicked", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { course, onClose, onSuccess: vi.fn() },
    });

    await wrapper.find('[data-testid="change-course-cancel"]').trigger("click");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should submit the updated values and call onSuccess", async () => {
    const changeSpy = vi
      .spyOn(coursesStore, "asyncChangeCourse")
      .mockImplementation(async () => {
        coursesStore.setFlag("isChangeCourse", true);
      });
    const onSuccess = vi.fn();
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { course, onClose: vi.fn(), onSuccess },
    });

    await wrapper.find('[data-testid="change-course-title"]').setValue("  Judul Baru  ");
    await wrapper
      .find('[data-testid="change-course-description"]')
      .setValue("  Deskripsi baru  ");
    await wrapper.find("form").trigger("submit");

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(changeSpy).toHaveBeenCalledWith("1", "Judul Baru", "Deskripsi baru");
    expect(coursesStore.$state.isChangeCourse).toBe(false);
  });

  it("should show the loading state and stay open when the api fails", async () => {
    let resolveChange: (value: void) => void = () => {};
    vi.spyOn(coursesStore, "asyncChangeCourse").mockReturnValue(
      new Promise<void>((resolve) => {
        resolveChange = resolve;
      })
    );
    const onSuccess = vi.fn();
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { course, onClose: vi.fn(), onSuccess },
    });

    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("Menyimpan...");

    resolveChange();
    await waitFor(() => expect(wrapper.text()).toContain("Simpan Perubahan"));
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
