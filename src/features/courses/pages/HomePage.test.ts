import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import HomePage from "./HomePage.svelte";
import { coursesStore } from "../states/coursesStore";
import { usersStore } from "../../users/states/usersStore";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";

const courses = [
  {
    id: "1",
    user_id: "1",
    title: "Kursus Saya",
    description: "Deskripsi kursus",
    cover: "https://example.com/cover.jpg",
    author: { name: "Abdullah" },
    total_contents: 2,
    avg_ratings: "4.50",
  },
  {
    id: "2",
    user_id: "2",
    title: "Kursus Orang",
    description: null,
    cover: null,
    author: null,
    total_contents: null,
    avg_ratings: null,
  },
  {
    id: "3",
    user_id: "2",
    title: "",
    description: "Tanpa judul",
    cover: "http://localhost:8000/",
    author: { name: "Ubaid" },
    total_contents: 1,
    avg_ratings: "5.00",
  },
];

const profile = { id: "1", name: "Abdullah", email: "abdullah@del.org" };

const renderPage = ({
  courseList = courses,
  currentProfile = profile,
  ...state
}: any = {}) => {
  return renderWithProviders(HomePage, {
    preloadedState: { courses: courseList, profile: currentProfile, ...state },
  });
};

describe("HomePage", () => {
  let loadSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    loadSpy = vi.spyOn(coursesStore, "asyncSetCourses").mockResolvedValue();
  });

  it("should load courses on mount and show a loading indicator", async () => {
    loadSpy.mockReturnValue(new Promise(() => {}) as any);
    const { wrapper } = renderPage({ courseList: [] });
    await tick();

    expect(loadSpy).toHaveBeenCalledWith(false);
    expect(wrapper.text()).toContain("Memuat daftar kursus...");
  });

  it("should show the empty state when there are no courses", async () => {
    const { wrapper } = renderPage({ courseList: [] });

    await waitFor(() => expect(wrapper.text()).toContain("Tidak ada kursus ditemukan."));
    expect(wrapper.find('[data-testid="stat-total"]').text()).toBe("0");
    expect(wrapper.find('[data-testid="stat-owned"]').text()).toBe("0");
    expect(wrapper.find('[data-testid="stat-contents"]').text()).toBe("0");
  });

  it("should render cards, stats, covers, and owner badges", () => {
    const { wrapper } = renderPage();

    expect(wrapper.find('[data-testid="stat-total"]').text()).toBe("3");
    expect(wrapper.find('[data-testid="stat-owned"]').text()).toBe("1");
    expect(wrapper.find('[data-testid="stat-contents"]').text()).toBe("3");

    expect(wrapper.find('[data-testid="course-cover-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="course-cover-fallback-2"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="course-cover-fallback-3"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="course-owned-1"]').text()).toBe("Milik Saya");
    expect(wrapper.find('[data-testid="course-owned-2"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="course-card-2"]').text()).toContain("-");
    expect(wrapper.find('[data-testid="course-meta-2"]').text()).toContain(
      "Tanpa penulis"
    );
    expect(wrapper.find('[data-testid="course-meta-2"]').text()).toContain("0 materi");
  });

  it("should update cards when the store changes", async () => {
    const { wrapper } = renderPage();

    coursesStore.setCourses([{ ...courses[0], title: "Judul Baru", total_contents: 9 }]);
    await tick();

    expect(wrapper.find('[data-testid="course-card-1"]').text()).toContain("Judul Baru");
    expect(wrapper.find('[data-testid="course-card-2"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="stat-contents"]').text()).toBe("9");
  });

  it("should filter courses by title, description, and empty search", async () => {
    const { wrapper } = renderPage();
    const search = wrapper.find('[data-testid="search-course-input"]');

    await search.setValue("saya");
    expect(wrapper.find('[data-testid="course-card-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="course-card-2"]').exists()).toBe(false);

    await search.setValue("tanpa judul");
    expect(wrapper.find('[data-testid="course-card-3"]').exists()).toBe(true);

    await search.setValue("tidak ada");
    expect(wrapper.text()).toContain("Tidak ada kursus ditemukan.");

    await search.setValue("   ");
    expect(wrapper.find('[data-testid="course-card-1"]').exists()).toBe(true);
  });

  it("should reload with the own-data filter when toggled", async () => {
    const { wrapper } = renderPage();

    await wrapper.find('[data-testid="filter-mine-checkbox"]').trigger("click");

    expect(loadSpy).toHaveBeenNthCalledWith(1, false);
    expect(loadSpy).toHaveBeenNthCalledWith(2, true);
  });

  it("should hide owner actions when the profile is missing", () => {
    const { wrapper } = renderPage({ currentProfile: null });

    expect(wrapper.find('[data-testid="course-delete-1"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="delete-all-btn"]').exists()).toBe(false);
  });

  it("should delete a course only after confirmation", async () => {
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false } as any)
      .mockResolvedValueOnce({ isConfirmed: true } as any);
    const deleteSpy = vi
      .spyOn(coursesStore, "asyncDeleteCourse")
      .mockImplementation(async () => {
        coursesStore.setFlag("isDeleteCourse", true);
      });
    const { wrapper } = renderPage();
    const button = wrapper.find('[data-testid="course-delete-1"]');

    await button.trigger("click");
    await waitFor(() => expect(confirmSpy).toHaveBeenCalledTimes(1));
    expect(deleteSpy).not.toHaveBeenCalled();

    await button.trigger("click");
    await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith("1"));
    expect(confirmSpy).toHaveBeenLastCalledWith('Hapus kursus "Kursus Saya"?');
    expect(coursesStore.$state.isDeleteCourse).toBe(false);
    await waitFor(() => expect(loadSpy).toHaveBeenCalledTimes(2));
  });

  it("should delete all owned courses only after confirmation", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false } as any)
      .mockResolvedValueOnce({ isConfirmed: true } as any);
    const deleteAllSpy = vi
      .spyOn(coursesStore, "asyncDeleteAllCourses")
      .mockImplementation(async () => {
        coursesStore.setFlag("isDeleteAllCourses", true);
      });
    const { wrapper } = renderPage();
    const button = wrapper.find('[data-testid="delete-all-btn"]');

    await button.trigger("click");
    await waitFor(() =>
      expect(toolsHelper.showConfirmDialog).toHaveBeenCalledTimes(1)
    );
    expect(deleteAllSpy).not.toHaveBeenCalled();

    await button.trigger("click");
    await waitFor(() => expect(deleteAllSpy).toHaveBeenCalledTimes(1));
    expect(coursesStore.$state.isDeleteAllCourses).toBe(false);
    await waitFor(() => expect(loadSpy).toHaveBeenCalledTimes(2));
  });

  it("should open and close the add modal", async () => {
    const { wrapper } = renderPage();
    expect(wrapper.find('[data-testid="modal-backdrop"]').exists()).toBe(false);

    await wrapper.find('[data-testid="add-course-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="add-course-title"]').exists()).toBe(true);

    await wrapper.find('[data-testid="modal-close"]').trigger("click");
    expect(wrapper.find('[data-testid="modal-backdrop"]').exists()).toBe(false);
  });

  it("should close the add modal and reload after a successful add", async () => {
    vi.spyOn(coursesStore, "asyncAddCourse").mockImplementation(async () => {
      coursesStore.setFlag("isAddCourse", true);
    });
    const { wrapper } = renderPage();
    await wrapper.find('[data-testid="add-course-btn"]').trigger("click");
    await wrapper.find('[data-testid="add-course-title"]').setValue("Baru");
    await wrapper.find('[data-testid="add-course-description"]').setValue("Deskripsi");
    await wrapper.find("form").trigger("submit");

    await waitFor(() =>
      expect(wrapper.find('[data-testid="modal-backdrop"]').exists()).toBe(false)
    );
    await waitFor(() => expect(loadSpy).toHaveBeenCalledTimes(2));
  });
});
