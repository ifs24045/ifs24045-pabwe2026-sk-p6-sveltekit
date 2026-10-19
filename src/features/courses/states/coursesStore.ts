import { writable } from "svelte/store";
import courseApi from "../api/courseApi";
import type { Course, CourseContent } from "../api/courseApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export type CoursesState = {
  courses: Course[];
  course: Course | null;
  content: CourseContent | null;
  isAddCourse: boolean;
  isChangeCourse: boolean;
  isChangeCourseCover: boolean;
  isDeleteCourse: boolean;
  isDeleteAllCourses: boolean;
  isJoinCourse: boolean;
  isLeaveCourse: boolean;
  isChangeRating: boolean;
  isAddContent: boolean;
  isChangeContent: boolean;
  isDeleteContent: boolean;
  isChangeContentStatus: boolean;
};

export type CoursesFlag = Exclude<
  keyof CoursesState,
  "courses" | "course" | "content"
>;

function createCoursesStore() {
  const initial: CoursesState = {
    courses: [],
    course: null,
    content: null,
    isAddCourse: false,
    isChangeCourse: false,
    isChangeCourseCover: false,
    isDeleteCourse: false,
    isDeleteAllCourses: false,
    isJoinCourse: false,
    isLeaveCourse: false,
    isChangeRating: false,
    isAddContent: false,
    isChangeContent: false,
    isDeleteContent: false,
    isChangeContentStatus: false,
  };

  let currentState: CoursesState = { ...initial };
  const innerStore = writable<CoursesState>(currentState);
  innerStore.subscribe((val) => {
    currentState = val;
  });

  // Menjalankan satu mutasi: sukses -> dialog + bendera true, gagal -> dialog + bendera false.
  async function mutate(
    flag: CoursesFlag,
    action: () => Promise<string>,
    defaultMessage: string
  ): Promise<void> {
    try {
      const message = await action();
      showSuccessDialog(message || defaultMessage);
      innerStore.update((s) => ({ ...s, [flag]: true }));
    } catch (error: any) {
      showErrorDialog(error.message);
      innerStore.update((s) => ({ ...s, [flag]: false }));
    }
  }

  return {
    subscribe: innerStore.subscribe,
    get courses() {
      return currentState.courses;
    },
    get course() {
      return currentState.course;
    },
    get content() {
      return currentState.content;
    },
    get $state() {
      return currentState;
    },
    reset(state: Partial<CoursesState> = initial) {
      innerStore.set({ ...initial, ...state });
    },
    setCourses(courses: Course[]) {
      innerStore.update((s) => ({ ...s, courses }));
    },
    setCourse(course: Course | null) {
      innerStore.update((s) => ({ ...s, course }));
    },
    setContent(content: CourseContent | null) {
      innerStore.update((s) => ({ ...s, content }));
    },
    setFlag(flag: CoursesFlag, value: boolean) {
      innerStore.update((s) => ({ ...s, [flag]: value }));
    },
    async asyncSetCourses(isMe = false) {
      try {
        this.setCourses(await courseApi.getCourses(isMe));
      } catch {
        this.setCourses([]);
      }
    },
    async asyncSetCourse(courseId: string) {
      try {
        this.setCourse(await courseApi.getCourseById(courseId));
      } catch {
        this.setCourse(null);
      }
    },
    async asyncSetContent(contentId: string) {
      try {
        this.setContent(await courseApi.getContentById(contentId));
      } catch {
        this.setContent(null);
      }
    },
    asyncAddCourse(title: string, description: string) {
      return mutate(
        "isAddCourse",
        () => courseApi.postCourse(title, description),
        "Kursus berhasil ditambahkan!"
      );
    },
    asyncChangeCourse(courseId: string, title: string, description: string) {
      return mutate(
        "isChangeCourse",
        () => courseApi.putCourse(courseId, title, description),
        "Kursus berhasil diperbarui!"
      );
    },
    asyncChangeCourseCover(courseId: string, cover: File) {
      return mutate(
        "isChangeCourseCover",
        () => courseApi.postCourseCover(courseId, cover),
        "Sampul kursus berhasil diperbarui!"
      );
    },
    asyncDeleteCourse(courseId: string) {
      return mutate(
        "isDeleteCourse",
        () => courseApi.deleteCourse(courseId),
        "Kursus berhasil dihapus!"
      );
    },
    asyncDeleteAllCourses() {
      return mutate(
        "isDeleteAllCourses",
        () => courseApi.deleteAllCourses(),
        "Semua kursus berhasil dihapus!"
      );
    },
    asyncJoinCourse(courseId: string) {
      return mutate(
        "isJoinCourse",
        () => courseApi.postStudent(courseId),
        "Berhasil mendaftar ke kursus!"
      );
    },
    asyncLeaveCourse(courseId: string) {
      return mutate(
        "isLeaveCourse",
        () => courseApi.deleteStudent(courseId),
        "Berhasil keluar dari kursus!"
      );
    },
    asyncChangeRating(courseId: string, ratings: number, comment: string) {
      return mutate(
        "isChangeRating",
        () => courseApi.putRatings(courseId, ratings, comment),
        "Rating berhasil disimpan!"
      );
    },
    asyncAddContent(courseId: string, title: string, youtube: string) {
      return mutate(
        "isAddContent",
        () => courseApi.postContent(courseId, title, youtube),
        "Konten berhasil ditambahkan!"
      );
    },
    asyncChangeContent(contentId: string, title: string, youtube: string) {
      return mutate(
        "isChangeContent",
        () => courseApi.putContent(contentId, title, youtube),
        "Konten berhasil diperbarui!"
      );
    },
    asyncDeleteContent(contentId: string) {
      return mutate(
        "isDeleteContent",
        () => courseApi.deleteContent(contentId),
        "Konten berhasil dihapus!"
      );
    },
    asyncChangeContentStatus(contentId: string, status: 0 | 1) {
      return mutate(
        "isChangeContentStatus",
        () => courseApi.postContentStatus(contentId, status),
        "Status belajar berhasil diperbarui!"
      );
    },
  };
}

export const coursesStore = createCoursesStore();
export const useCoursesStore = () => coursesStore;
export default coursesStore;