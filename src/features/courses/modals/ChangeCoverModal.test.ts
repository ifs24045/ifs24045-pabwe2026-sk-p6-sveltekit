import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
import ChangeCoverModal from "./ChangeCoverModal.svelte";
import { coursesStore } from "../states/coursesStore";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";

function setFiles(input: Element, files: File[]) {
  Object.defineProperty(input, "files", {
    value: files,
    configurable: true,
  });
}

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(toolsHelper, "showWarningDialog").mockResolvedValue({} as any);
  });

  it("should render the cover form and close from cancel", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { courseId: "1", onClose, onSuccess: vi.fn() },
    });

    expect(wrapper.text()).toContain("Ubah Sampul Kursus");
    await wrapper.find('[data-testid="change-cover-cancel"]').trigger("click");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should warn when submitting without a file", async () => {
    const warningSpy = vi
      .spyOn(toolsHelper, "showWarningDialog")
      .mockResolvedValue({} as any);
    const uploadSpy = vi.spyOn(coursesStore, "asyncChangeCourseCover");
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { courseId: "1", onClose: vi.fn(), onSuccess: vi.fn() },
    });

    await wrapper.find("form").trigger("submit");

    expect(warningSpy).toHaveBeenCalledWith("Pilih berkas gambar terlebih dahulu!");
    expect(uploadSpy).not.toHaveBeenCalled();
  });

  it("should upload the selected file and call onSuccess", async () => {
    const file = new File(["x"], "cover.png", { type: "image/png" });
    const uploadSpy = vi
      .spyOn(coursesStore, "asyncChangeCourseCover")
      .mockImplementation(async () => {
        coursesStore.setFlag("isChangeCourseCover", true);
      });
    const onSuccess = vi.fn();
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { courseId: "1", onClose: vi.fn(), onSuccess },
    });

    const input = wrapper.find('[data-testid="change-cover-file"]').element;
    setFiles(input, [file]);
    await wrapper.find('[data-testid="change-cover-file"]').trigger("change");
    await wrapper.find("form").trigger("submit");

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(uploadSpy).toHaveBeenCalledWith("1", file);
    expect(coursesStore.$state.isChangeCourseCover).toBe(false);
  });

  it("should show the loading state and stay open when the api fails", async () => {
    let resolveUpload: (value: void) => void = () => {};
    vi.spyOn(coursesStore, "asyncChangeCourseCover").mockReturnValue(
      new Promise<void>((resolve) => {
        resolveUpload = resolve;
      })
    );
    const onSuccess = vi.fn();
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { courseId: "1", onClose: vi.fn(), onSuccess },
    });

    const input = wrapper.find('[data-testid="change-cover-file"]').element;
    setFiles(input, [new File(["x"], "cover.png", { type: "image/png" })]);
    await wrapper.find('[data-testid="change-cover-file"]').trigger("change");
    await wrapper.find("form").trigger("submit");

    expect(wrapper.text()).toContain("Mengunggah...");
    resolveUpload();
    await waitFor(() => expect(wrapper.text()).toContain("Unggah Sampul"));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("should clear the selected file when the input is emptied", async () => {
    const uploadSpy = vi.spyOn(coursesStore, "asyncChangeCourseCover");
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { courseId: "1", onClose: vi.fn(), onSuccess: vi.fn() },
    });

    const input = wrapper.find('[data-testid="change-cover-file"]').element;
    setFiles(input, []);
    await wrapper.find('[data-testid="change-cover-file"]').trigger("change");
    await wrapper.find("form").trigger("submit");

    expect(uploadSpy).not.toHaveBeenCalled();
  });
});
