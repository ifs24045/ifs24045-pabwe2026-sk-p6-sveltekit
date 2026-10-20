import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import { goto } from "$app/navigation";
import DetailPage from "./DetailPage.svelte";
import { coursesStore } from "../states/coursesStore";
import { usersStore } from "../../users/states/usersStore";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";

const users = [
  { id: "2", name: "Budi", email: "budi@del.org" },
  { id: "3", name: "Citra", email: "citra@del.org" },
];

const course = {
  id: "7",
  user_id: "1",
  title: "Kursus Hebat",
  description: "Deskripsi kursus",
  cover: "https://example.com/cover.jpg",
  author: { name: "Abdullah" },
  total_contents: 2,
  avg_ratings: "4.50",
  my_percentage_finished: "50",
  students: ["2"],
  contents: [
    {
      id: "11",
      course_id: "7",
      title: "Materi Satu",
      youtube: "https://youtu.be/dQw4w9WgXcQ",
      my_status_finished: false,
    },
    {
      id: "12",
      course_id: "7",
      title: "Materi Dua",
      youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      my_status_finished: true,
    },
  ],
  ratings: [
    { name: "Budi", ratings: 5, comment: "Mantap" },
    { name: "Tanpa Nilai", ratings: undefined, comment: "" },
  ],
};

const owner = { id: "1", name: "Abdullah", email: "abdullah@del.org" };
const student = { id: "2", name: "Budi", email: "budi@del.org" };
const stranger = { id: "9", name: "Orang", email: "orang@del.org" };

const renderPage = ({
  courseData = course,
  currentProfile = owner,
  courseId = "7",
  userList = users,
}: any = {}) => {
  return renderWithProviders(DetailPage, {
    params: { courseId },
    preloadedState: {
      course: courseData,
      profile: currentProfile,
      users: userList,
    },
  });
};

describe("DetailPage", () => {
  let loadSpy: ReturnType<typeof vi.spyOn>;
  let usersSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    loadSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockResolvedValue();
    usersSpy = vi.spyOn(usersStore, "asyncSetUsers").mockResolvedValue();
  });

  it("should load the course and users on mount with a loading indicator", async () => {
    loadSpy.mockReturnValue(new Promise(() => {}) as any);
    const { wrapper } = renderPage({ courseData: null });
    await tick();

    expect(loadSpy).toHaveBeenCalledWith("7");
    expect(usersSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain("Memuat detail kursus...");
  });

  it("should show not found when the course is missing or has another id", async () => {
    const missing = renderPage({ courseData: null });
    await waitFor(() =>
      expect(missing.wrapper.text()).toContain("Kursus tidak ditemukan.")
    );

    const other = renderPage({ courseId: "99" });
    await waitFor(() =>
      expect(other.wrapper.text()).toContain("Kursus tidak ditemukan.")
    );
  });

  it("should render the owner view with cover, metadata, contents, and participants", () => {
    const { wrapper } = renderPage();

    expect(wrapper.find('[data-testid="detail-title"]').text()).toBe("Kursus Hebat");
    expect(wrapper.find('[data-testid="detail-author"]').text()).toBe("Oleh Abdullah");
    expect(wrapper.find('[data-testid="detail-description"]').text()).toBe(
      "Deskripsi kursus"
    );
    expect(wrapper.find('[data-testid="detail-rating"]').text()).toBe("4.50");
    expect(wrapper.find('[data-testid="detail-total-contents"]').text()).toBe("2");
    expect(wrapper.find('[data-testid="detail-total-students"]').text()).toBe("1");
    expect(wrapper.find('[data-testid="detail-progress"]').text()).toContain("50% selesai");
    expect(wrapper.find('[data-testid="detail-cover"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="detail-owner-badge"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="change-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="change-cover-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="delete-course-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="add-content-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="content-edit-11"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="content-delete-11"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="rating-form"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="join-course-btn"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="leave-course-btn"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="participant-0"]').text()).toContain("Budi");
    expect(wrapper.find('[data-testid="content-open-11"]').element.getAttribute("href")).toBe(
      "/courses/7/contents/11"
    );
  });

  it("should render the student view with rating form and completion badges", () => {
    const { wrapper } = renderPage({ currentProfile: student });

    expect(wrapper.find('[data-testid="detail-student-badge"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="leave-course-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="rating-form"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="rating-item-0"]').text()).toContain("Mantap");
    expect(wrapper.find('[data-testid="rating-item-1"]').text()).toContain("-");
    expect(wrapper.find('[data-testid="content-finished-11"]').text()).toContain("Belum");
    expect(wrapper.find('[data-testid="content-finished-12"]').text()).toContain("Selesai");
    expect(wrapper.find('[data-testid="change-btn"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="add-content-btn"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="content-edit-11"]').exists()).toBe(false);
  });

  it("should render the stranger view with join button and no participant-only tools", () => {
    const { wrapper } = renderPage({ currentProfile: stranger });

    expect(wrapper.find('[data-testid="join-course-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="rating-form"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="content-finished-11"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="detail-owner-badge"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="detail-student-badge"]').exists()).toBe(false);
  });

  it("should prioritize the owner view when the user is also a student", () => {
    const { wrapper } = renderPage({
      courseData: { ...course, students: ["1", "2"] },
    });

    expect(wrapper.find('[data-testid="detail-owner-badge"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="change-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="rating-form"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="leave-course-btn"]').exists()).toBe(false);
  });

  it("should render a fallback cover, placeholder copy, empty lists, and participant names", () => {
    const { wrapper } = renderPage({
      courseData: {
        ...course,
        cover: "http://localhost:8000/",
        description: null,
        author: null,
        total_contents: null,
        avg_ratings: null,
        my_percentage_finished: null,
        students: [{ id: "2" }, { user_id: "3" }, "5"],
        contents: [],
        ratings: [],
      },
      currentProfile: student,
    });

    expect(wrapper.find('[data-testid="detail-cover-fallback"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="detail-description"]').text()).toBe("-");
    expect(wrapper.find('[data-testid="detail-author"]').text()).toBe("Oleh Tanpa penulis");
    expect(wrapper.find('[data-testid="detail-rating"]').text()).toBe("-");
    expect(wrapper.find('[data-testid="detail-total-contents"]').text()).toBe("0");
    expect(wrapper.find('[data-testid="detail-progress"]').text()).toContain("0% selesai");
    expect(wrapper.find('[data-testid="contents-empty"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="ratings-empty"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="participant-0"]').text()).toContain("Budi");
    expect(wrapper.find('[data-testid="participant-1"]').text()).toContain("Citra");
    expect(wrapper.find('[data-testid="participant-2"]').text()).toContain("Pengguna #5");
  });

  it("should handle missing relation lists", () => {
    const { wrapper } = renderPage({
      courseData: {
        ...course,
        contents: undefined,
        ratings: undefined,
        students: undefined,
      },
      currentProfile: student,
    });

    expect(wrapper.find('[data-testid="contents-empty"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="students-empty"]').exists()).toBe(true);
  });

  it("should show the empty rating state when ratings are missing", () => {
    const { wrapper } = renderPage({
      courseData: {
        ...course,
        ratings: undefined,
        students: ["2"],
      },
      currentProfile: student,
    });

    expect(wrapper.find('[data-testid="ratings-empty"]').exists()).toBe(true);
  });

  it("should join a course and reload the detail", async () => {
    const joinSpy = vi
      .spyOn(coursesStore, "asyncJoinCourse")
      .mockImplementation(async () => {
        coursesStore.setFlag("isJoinCourse", true);
      });
    const { wrapper } = renderPage({ currentProfile: stranger });

    await wrapper.find('[data-testid="join-course-btn"]').trigger("click");

    await waitFor(() => expect(joinSpy).toHaveBeenCalledWith("7"));
    expect(coursesStore.$state.isJoinCourse).toBe(false);
    await waitFor(() => expect(loadSpy).toHaveBeenCalledTimes(2));
  });

  it("should leave a course and reload the detail", async () => {
    const leaveSpy = vi
      .spyOn(coursesStore, "asyncLeaveCourse")
      .mockImplementation(async () => {
        coursesStore.setFlag("isLeaveCourse", true);
      });
    const { wrapper } = renderPage({ currentProfile: student });

    await wrapper.find('[data-testid="leave-course-btn"]').trigger("click");

    await waitFor(() => expect(leaveSpy).toHaveBeenCalledWith("7"));
    expect(coursesStore.$state.isLeaveCourse).toBe(false);
    await waitFor(() => expect(loadSpy).toHaveBeenCalledTimes(2));
  });

  it("should submit a rating and reload the detail", async () => {
    const ratingSpy = vi
      .spyOn(coursesStore, "asyncChangeRating")
      .mockImplementation(async () => {
        coursesStore.setFlag("isChangeRating", true);
      });
    const { wrapper } = renderPage({ currentProfile: student });

    await wrapper.find('[data-testid="rating-select"]').setValue("4");
    await wrapper.find('[data-testid="rating-comment"]').setValue("  Bagus  ");
    await wrapper.find('[data-testid="rating-form"]').trigger("submit");

    await waitFor(() => expect(ratingSpy).toHaveBeenCalledWith("7", 4, "Bagus"));
    expect(coursesStore.$state.isChangeRating).toBe(false);
    await waitFor(() => expect(loadSpy).toHaveBeenCalledTimes(2));
  });

  it("should delete the course only after confirmation", async () => {
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false } as any)
      .mockResolvedValueOnce({ isConfirmed: true } as any);
    const deleteSpy = vi.spyOn(coursesStore, "asyncDeleteCourse").mockResolvedValue();
    const { wrapper } = renderPage();
    const button = wrapper.find('[data-testid="delete-course-btn"]');

    await button.trigger("click");
    await waitFor(() => expect(confirmSpy).toHaveBeenCalledTimes(1));
    expect(deleteSpy).not.toHaveBeenCalled();

    await button.trigger("click");
    await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith("7"));
    expect(confirmSpy).toHaveBeenLastCalledWith(
      'Hapus kursus "Kursus Hebat" beserta seluruh materinya?'
    );
    expect(goto).toHaveBeenCalledWith("/");
  });

  it("should delete content only after confirmation and reload", async () => {
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false } as any)
      .mockResolvedValueOnce({ isConfirmed: true } as any);
    const deleteSpy = vi
      .spyOn(coursesStore, "asyncDeleteContent")
      .mockImplementation(async () => {
        coursesStore.setFlag("isDeleteContent", true);
      });
    const { wrapper } = renderPage();
    const button = wrapper.find('[data-testid="content-delete-11"]');

    await button.trigger("click");
    await waitFor(() => expect(confirmSpy).toHaveBeenCalledTimes(1));
    expect(deleteSpy).not.toHaveBeenCalled();

    await button.trigger("click");
    await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith("11"));
    expect(confirmSpy).toHaveBeenLastCalledWith('Hapus materi "Materi Satu"?');
    expect(coursesStore.$state.isDeleteContent).toBe(false);
    await waitFor(() => expect(loadSpy).toHaveBeenCalledTimes(2));
  });

  it("should open and close the change and cover modals", async () => {
    const { wrapper } = renderPage();

    await wrapper.find('[data-testid="change-btn"]').trigger("click");
    expect(wrapper.text()).toContain("Ubah Kursus");
    await wrapper.find('[data-testid="change-course-cancel"]').trigger("click");
    expect(wrapper.text()).not.toContain("Ubah Kursus");

    await wrapper.find('[data-testid="change-cover-btn"]').trigger("click");
    expect(wrapper.text()).toContain("Ubah Sampul Kursus");
    await wrapper.find('[data-testid="change-cover-cancel"]').trigger("click");
    expect(wrapper.text()).not.toContain("Ubah Sampul Kursus");
  });

  it("should close the change modal and reload after a successful change", async () => {
    vi.spyOn(coursesStore, "asyncChangeCourse").mockImplementation(async () => {
      coursesStore.setFlag("isChangeCourse", true);
    });
    const { wrapper } = renderPage();

    await wrapper.find('[data-testid="change-btn"]').trigger("click");
    await wrapper.find("form").trigger("submit");

    await waitFor(() => expect(wrapper.text()).not.toContain("Ubah Kursus"));
    await waitFor(() => expect(loadSpy).toHaveBeenCalledTimes(2));
  });

  it("should close the cover modal and reload after a successful cover change", async () => {
    vi.spyOn(coursesStore, "asyncChangeCourseCover").mockImplementation(async () => {
      coursesStore.setFlag("isChangeCourseCover", true);
    });
    const { wrapper } = renderPage();

    await wrapper.find('[data-testid="change-cover-btn"]').trigger("click");
    const input = wrapper.find('[data-testid="change-cover-file"]').element;
    Object.defineProperty(input, "files", {
      value: [new File(["x"], "cover.png", { type: "image/png" })],
      configurable: true,
    });
    await wrapper.find('[data-testid="change-cover-file"]').trigger("change");
    await wrapper.find("form").trigger("submit");

    await waitFor(() => expect(wrapper.text()).not.toContain("Ubah Sampul Kursus"));
    await waitFor(() => expect(loadSpy).toHaveBeenCalledTimes(2));
  });

  it("should open the add content modal and close it", async () => {
    const { wrapper } = renderPage();

    await wrapper.find('[data-testid="add-content-btn"]').trigger("click");
    expect(wrapper.text()).toContain("Tambah Konten");

    await wrapper.find('[data-testid="content-cancel"]').trigger("click");
    expect(wrapper.text()).not.toContain("Tambah Konten");
  });

  it("should open the edit content modal prefilled and close it", async () => {
    const { wrapper } = renderPage();

    await wrapper.find('[data-testid="content-edit-11"]').trigger("click");
    expect(wrapper.text()).toContain("Ubah Konten");
    expect(
      (wrapper.find('[data-testid="content-title"]').element as HTMLInputElement).value
    ).toBe("Materi Satu");

    await wrapper.find('[data-testid="content-cancel"]').trigger("click");
    expect(wrapper.text()).not.toContain("Ubah Konten");
  });

  it("should close the content modal and reload after adding content", async () => {
    vi.spyOn(coursesStore, "asyncAddContent").mockImplementation(async () => {
      coursesStore.setFlag("isAddContent", true);
    });
    const { wrapper } = renderPage();

    await wrapper.find('[data-testid="add-content-btn"]').trigger("click");
    await wrapper.find('[data-testid="content-title"]').setValue("Materi Baru");
    await wrapper
      .find('[data-testid="content-youtube"]')
      .setValue("https://youtu.be/dQw4w9WgXcQ");
    await wrapper.find("form").trigger("submit");

    await waitFor(() => expect(wrapper.text()).not.toContain("Tambah Konten"));
    await waitFor(() => expect(loadSpy).toHaveBeenCalledTimes(2));
  });
});
