import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
import CourseDetailRoute from "./[courseId]/+page.svelte";
import CourseContentRoute from "./[courseId]/contents/[contentId]/+page.svelte";
import { coursesStore } from "../../features/courses/states/coursesStore";
import { usersStore } from "../../features/users/states/usersStore";
import { renderWithProviders } from "../../test-utils";

const profile = { id: "1", name: "Abdullah", email: "abdullah@del.org" };

const course = {
  id: "7",
  user_id: "1",
  title: "Kursus Hebat",
  description: "Deskripsi",
  students: [],
  contents: [],
  ratings: [],
};

const content = {
  id: "3",
  course_id: "7",
  title: "Materi Hebat",
  youtube: "https://youtu.be/dQw4w9WgXcQ",
  my_status_finished: false,
};

describe("course routes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(coursesStore, "asyncSetCourse").mockResolvedValue();
    vi.spyOn(coursesStore, "asyncSetContent").mockResolvedValue();
    vi.spyOn(usersStore, "asyncSetUsers").mockResolvedValue();
  });

  it("should render the course detail page for /courses/[courseId]", async () => {
    const { wrapper } = renderWithProviders(CourseDetailRoute, {
      params: { courseId: "7" },
      preloadedState: { course, profile },
    });

    await waitFor(() =>
      expect(wrapper.find('[data-testid="detail-title"]').text()).toBe("Kursus Hebat")
    );
  });

  it("should render the content page for /courses/[courseId]/contents/[contentId]", async () => {
    const { wrapper } = renderWithProviders(CourseContentRoute, {
      params: { courseId: "7", contentId: "3" },
      preloadedState: { content, profile },
    });

    await waitFor(() =>
      expect(wrapper.find('[data-testid="content-title"]').text()).toBe("Materi Hebat")
    );
  });
});
