import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
import ContentModal from "./ContentModal.svelte";
import { coursesStore } from "../states/coursesStore";
import { renderWithProviders } from "../../../test-utils";

const content = {
  id: "3",
  course_id: "1",
  title: "Materi Lama",
  youtube: "https://youtu.be/dQw4w9WgXcQ",
};

describe("ContentModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render the add form with empty fields", () => {
    const { wrapper } = renderWithProviders(ContentModal, {
      props: { courseId: "1", onClose: vi.fn(), onSuccess: vi.fn() },
    });

    expect(wrapper.text()).toContain("Tambah Konten");
    expect(
      (wrapper.find('[data-testid="content-title"]').element as HTMLInputElement).value
    ).toBe("");
  });

  it("should prefill the form in edit mode", () => {
    const { wrapper } = renderWithProviders(ContentModal, {
      props: { courseId: "1", content, onClose: vi.fn(), onSuccess: vi.fn() },
    });

    expect(wrapper.text()).toContain("Ubah Konten");
    expect(
      (wrapper.find('[data-testid="content-title"]').element as HTMLInputElement).value
    ).toBe("Materi Lama");
  });

  it("should close from the cancel button", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(ContentModal, {
      props: { courseId: "1", onClose, onSuccess: vi.fn() },
    });

    await wrapper.find('[data-testid="content-cancel"]').trigger("click");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should add new content and call onSuccess", async () => {
    const addSpy = vi
      .spyOn(coursesStore, "asyncAddContent")
      .mockImplementation(async () => {
        coursesStore.setFlag("isAddContent", true);
      });
    const onSuccess = vi.fn();
    const { wrapper } = renderWithProviders(ContentModal, {
      props: { courseId: "1", onClose: vi.fn(), onSuccess },
    });

    await wrapper.find('[data-testid="content-title"]').setValue("  Materi Baru  ");
    await wrapper
      .find('[data-testid="content-youtube"]')
      .setValue("  https://youtu.be/dQw4w9WgXcQ  ");
    await wrapper.find("form").trigger("submit");

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(addSpy).toHaveBeenCalledWith(
      "1",
      "Materi Baru",
      "https://youtu.be/dQw4w9WgXcQ"
    );
    expect(coursesStore.$state.isAddContent).toBe(false);
  });

  it("should update existing content and call onSuccess", async () => {
    const changeSpy = vi
      .spyOn(coursesStore, "asyncChangeContent")
      .mockImplementation(async () => {
        coursesStore.setFlag("isChangeContent", true);
      });
    const onSuccess = vi.fn();
    const { wrapper } = renderWithProviders(ContentModal, {
      props: { courseId: "1", content, onClose: vi.fn(), onSuccess },
    });

    await wrapper.find('[data-testid="content-title"]').setValue("Materi Baru");
    await wrapper.find("form").trigger("submit");

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(changeSpy).toHaveBeenCalledWith("3", "Materi Baru", content.youtube);
    expect(coursesStore.$state.isChangeContent).toBe(false);
  });

  it("should show the loading state and stay open when the api fails", async () => {
    let resolveSave: (value: void) => void = () => {};
    vi.spyOn(coursesStore, "asyncAddContent").mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSave = resolve;
      })
    );
    const onSuccess = vi.fn();
    const { wrapper } = renderWithProviders(ContentModal, {
      props: { courseId: "1", onClose: vi.fn(), onSuccess },
    });

    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("Menyimpan...");

    resolveSave();
    await waitFor(() => expect(wrapper.text()).toContain("Simpan"));
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
