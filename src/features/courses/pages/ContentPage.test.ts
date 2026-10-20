import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import ContentPage from "./ContentPage.svelte";
import { coursesStore } from "../states/coursesStore";
import { renderWithProviders } from "../../../test-utils";

const content = {
  id: "3",
  course_id: "7",
  title: "Materi Hebat",
  youtube: "https://youtu.be/dQw4w9WgXcQ",
  my_status_finished: false,
};

const renderPage = ({ contentData = content, contentId = "3", courseId = "7" }: any = {}) => {
  return renderWithProviders(ContentPage, {
    params: { contentId, courseId },
    preloadedState: { content: contentData },
  });
};

describe("ContentPage", () => {
  let loadSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    loadSpy = vi.spyOn(coursesStore, "asyncSetContent").mockResolvedValue();
  });

  it("should load the content on mount and show a loading indicator", async () => {
    loadSpy.mockReturnValue(new Promise(() => {}) as any);
    const { wrapper } = renderPage({ contentData: null });
    await tick();

    expect(loadSpy).toHaveBeenCalledWith("3");
    expect(wrapper.text()).toContain("Memuat materi kursus...");
  });

  it("should show not found when the content is missing or has another id", async () => {
    const missing = renderPage({ contentData: null });
    await waitFor(() =>
      expect(missing.wrapper.text()).toContain("Materi tidak ditemukan.")
    );

    const other = renderPage({ contentId: "99" });
    await waitFor(() =>
      expect(other.wrapper.text()).toContain("Materi tidak ditemukan.")
    );
  });

  it("should show a playable YouTube iframe and the unfinished state", () => {
    const { wrapper } = renderPage();

    expect(wrapper.find('[data-testid="content-title"]').text()).toBe("Materi Hebat");
    expect(wrapper.find('[data-testid="content-youtube"]').text()).toContain("youtu.be");
    expect(wrapper.find('[data-testid="content-iframe"]').element.getAttribute("src")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
    expect(wrapper.find('[data-testid="content-status"]').text()).toContain(
      "Belum selesai"
    );
    expect(wrapper.find('[data-testid="toggle-finished-btn"]').text()).toContain(
      "Tandai Selesai"
    );
    expect(
      wrapper.find('[data-testid="back-to-course-btn"]').element.getAttribute("href")
    ).toBe("/courses/7");
  });

  it("should show the finished state and allow marking it unfinished", async () => {
    const statusSpy = vi
      .spyOn(coursesStore, "asyncChangeContentStatus")
      .mockImplementation(async () => {
        coursesStore.setFlag("isChangeContentStatus", true);
      });
    const { wrapper } = renderPage({
      contentData: { ...content, my_status_finished: true },
    });

    expect(wrapper.find('[data-testid="content-status"]').text()).toContain(
      "Sudah selesai"
    );
    expect(wrapper.find('[data-testid="toggle-finished-btn"]').text()).toContain(
      "Tandai Belum Selesai"
    );

    await wrapper.find('[data-testid="toggle-finished-btn"]').trigger("click");

    await waitFor(() => expect(statusSpy).toHaveBeenCalledWith("3", 0));
    expect(coursesStore.$state.isChangeContentStatus).toBe(false);
    await waitFor(() => expect(loadSpy).toHaveBeenCalledTimes(2));
  });

  it("should mark content as finished", async () => {
    const statusSpy = vi
      .spyOn(coursesStore, "asyncChangeContentStatus")
      .mockResolvedValue();
    const { wrapper } = renderPage();

    await wrapper.find('[data-testid="toggle-finished-btn"]').trigger("click");

    await waitFor(() => expect(statusSpy).toHaveBeenCalledWith("3", 1));
  });

  it("should show a fallback when the YouTube link cannot be embedded", () => {
    const { wrapper } = renderPage({
      contentData: { ...content, youtube: "https://example.com/video" },
    });

    expect(wrapper.find('[data-testid="content-iframe"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="content-no-video"]').text()).toContain(
      "Tautan video tidak dapat diputar."
    );
    expect(wrapper.find('[data-testid="content-no-video"] a').element.getAttribute("href")).toBe(
      "https://example.com/video"
    );
  });

  it("should show the saving state while updating the status", async () => {
    let resolveStatus: (value: void) => void = () => {};
    vi.spyOn(coursesStore, "asyncChangeContentStatus").mockReturnValue(
      new Promise<void>((resolve) => {
        resolveStatus = resolve;
      })
    );
    const { wrapper } = renderPage();

    await wrapper.find('[data-testid="toggle-finished-btn"]').trigger("click");
    expect(wrapper.text()).toContain("Menyimpan...");

    resolveStatus();
    await waitFor(() => expect(wrapper.text()).toContain("Tandai Selesai"));
  });
});
