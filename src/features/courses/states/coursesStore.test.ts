import { describe, it, expect, vi, beforeEach } from "vitest";
import { coursesStore, useCoursesStore } from "./coursesStore";
import courseApi from "../api/courseApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

const course = {
  id: "1",
  user_id: "1",
  title: "Kursus",
  description: "Deskripsi",
};

const content = {
  id: "3",
  course_id: "1",
  title: "Materi",
  youtube: "https://youtu.be/dQw4w9WgXcQ",
};

const mutationCases: Array<{
  name: string;
  flag: string;
  apiMethod: keyof typeof courseApi;
  call: () => Promise<void>;
  defaultMessage: string;
  apiArgs: any[];
}> = [
  {
    name: "asyncAddCourse",
    flag: "isAddCourse",
    apiMethod: "postCourse",
    call: () => coursesStore.asyncAddCourse("Judul", "Deskripsi"),
    defaultMessage: "Kursus berhasil ditambahkan!",
    apiArgs: ["Judul", "Deskripsi"],
  },
  {
    name: "asyncChangeCourse",
    flag: "isChangeCourse",
    apiMethod: "putCourse",
    call: () => coursesStore.asyncChangeCourse("1", "Judul", "Deskripsi"),
    defaultMessage: "Kursus berhasil diperbarui!",
    apiArgs: ["1", "Judul", "Deskripsi"],
  },
  {
    name: "asyncChangeCourseCover",
    flag: "isChangeCourseCover",
    apiMethod: "postCourseCover",
    call: () => coursesStore.asyncChangeCourseCover("1", new File(["x"], "c.png")),
    defaultMessage: "Sampul kursus berhasil diperbarui!",
    apiArgs: ["1", expect.any(File)],
  },
  {
    name: "asyncDeleteCourse",
    flag: "isDeleteCourse",
    apiMethod: "deleteCourse",
    call: () => coursesStore.asyncDeleteCourse("1"),
    defaultMessage: "Kursus berhasil dihapus!",
    apiArgs: ["1"],
  },
  {
    name: "asyncDeleteAllCourses",
    flag: "isDeleteAllCourses",
    apiMethod: "deleteAllCourses",
    call: () => coursesStore.asyncDeleteAllCourses(),
    defaultMessage: "Semua kursus berhasil dihapus!",
    apiArgs: [],
  },
  {
    name: "asyncJoinCourse",
    flag: "isJoinCourse",
    apiMethod: "postStudent",
    call: () => coursesStore.asyncJoinCourse("1"),
    defaultMessage: "Berhasil mendaftar ke kursus!",
    apiArgs: ["1"],
  },
  {
    name: "asyncLeaveCourse",
    flag: "isLeaveCourse",
    apiMethod: "deleteStudent",
    call: () => coursesStore.asyncLeaveCourse("1"),
    defaultMessage: "Berhasil keluar dari kursus!",
    apiArgs: ["1"],
  },
  {
    name: "asyncChangeRating",
    flag: "isChangeRating",
    apiMethod: "putRatings",
    call: () => coursesStore.asyncChangeRating("1", 5, "Mantap"),
    defaultMessage: "Rating berhasil disimpan!",
    apiArgs: ["1", 5, "Mantap"],
  },
  {
    name: "asyncAddContent",
    flag: "isAddContent",
    apiMethod: "postContent",
    call: () => coursesStore.asyncAddContent("1", "Materi", "https://youtu.be/x"),
    defaultMessage: "Konten berhasil ditambahkan!",
    apiArgs: ["1", "Materi", "https://youtu.be/x"],
  },
  {
    name: "asyncChangeContent",
    flag: "isChangeContent",
    apiMethod: "putContent",
    call: () => coursesStore.asyncChangeContent("3", "Materi", "https://youtu.be/x"),
    defaultMessage: "Konten berhasil diperbarui!",
    apiArgs: ["3", "Materi", "https://youtu.be/x"],
  },
  {
    name: "asyncDeleteContent",
    flag: "isDeleteContent",
    apiMethod: "deleteContent",
    call: () => coursesStore.asyncDeleteContent("3"),
    defaultMessage: "Konten berhasil dihapus!",
    apiArgs: ["3"],
  },
  {
    name: "asyncChangeContentStatus",
    flag: "isChangeContentStatus",
    apiMethod: "postContentStatus",
    call: () => coursesStore.asyncChangeContentStatus("3", 1),
    defaultMessage: "Status belajar berhasil diperbarui!",
    apiArgs: ["3", 1],
  },
];

describe("coursesStore", () => {
  beforeEach(() => {
    coursesStore.reset();
    vi.restoreAllMocks();
    vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => ({}) as any);
    vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => ({}) as any);
  });

  it("should have correct default state", () => {
    const store = useCoursesStore();
    expect(store.courses).toEqual([]);
    expect(store.course).toBeNull();
    expect(store.content).toBeNull();
    expect(store.$state.isAddCourse).toBe(false);
    expect(store.$state.isChangeCourse).toBe(false);
    expect(store.$state.isChangeCourseCover).toBe(false);
    expect(store.$state.isDeleteCourse).toBe(false);
    expect(store.$state.isDeleteAllCourses).toBe(false);
    expect(store.$state.isJoinCourse).toBe(false);
    expect(store.$state.isLeaveCourse).toBe(false);
    expect(store.$state.isChangeRating).toBe(false);
    expect(store.$state.isAddContent).toBe(false);
    expect(store.$state.isChangeContent).toBe(false);
    expect(store.$state.isDeleteContent).toBe(false);
    expect(store.$state.isChangeContentStatus).toBe(false);
  });

  it("should update state with setters", () => {
    coursesStore.setCourses([course]);
    coursesStore.setCourse(course);
    coursesStore.setContent(content);
    coursesStore.setFlag("isAddCourse", true);

    expect(coursesStore.courses).toEqual([course]);
    expect(coursesStore.course).toEqual(course);
    expect(coursesStore.content).toEqual(content);
    expect(coursesStore.$state.isAddCourse).toBe(true);
  });

  it("should reset with default and partial state", () => {
    coursesStore.setCourses([course]);
    coursesStore.reset({ course });
    expect(coursesStore.course).toEqual(course);
    expect(coursesStore.courses).toEqual([]);

    coursesStore.reset();
    expect(coursesStore.course).toBeNull();
  });

  describe("asyncSetCourses", () => {
    it("should store courses on success", async () => {
      vi.spyOn(courseApi, "getCourses").mockResolvedValue([course]);
      await coursesStore.asyncSetCourses(true);
      expect(courseApi.getCourses).toHaveBeenCalledWith(true);
      expect(coursesStore.courses).toEqual([course]);
    });

    it("should store an empty list on failure", async () => {
      vi.spyOn(courseApi, "getCourses").mockRejectedValue(new Error("x"));
      coursesStore.setCourses([course]);
      await coursesStore.asyncSetCourses();
      expect(coursesStore.courses).toEqual([]);
    });
  });

  describe("asyncSetCourse", () => {
    it("should store a course on success", async () => {
      vi.spyOn(courseApi, "getCourseById").mockResolvedValue(course);
      await coursesStore.asyncSetCourse("1");
      expect(coursesStore.course).toEqual(course);
    });

    it("should store null on failure", async () => {
      vi.spyOn(courseApi, "getCourseById").mockRejectedValue(new Error("x"));
      coursesStore.setCourse(course);
      await coursesStore.asyncSetCourse("1");
      expect(coursesStore.course).toBeNull();
    });
  });

  describe("asyncSetContent", () => {
    it("should store a content on success", async () => {
      vi.spyOn(courseApi, "getContentById").mockResolvedValue(content);
      await coursesStore.asyncSetContent("3");
      expect(coursesStore.content).toEqual(content);
    });

    it("should store null on failure", async () => {
      vi.spyOn(courseApi, "getContentById").mockRejectedValue(new Error("x"));
      coursesStore.setContent(content);
      await coursesStore.asyncSetContent("3");
      expect(coursesStore.content).toBeNull();
    });
  });

  describe("mutations", () => {
    mutationCases.forEach(({ name, flag, apiMethod, call, defaultMessage, apiArgs }) => {
      describe(name, () => {
        it("should call the api, show success, and set the flag", async () => {
          vi.spyOn(courseApi, apiMethod as any).mockResolvedValue("Pesan API");
          await call();

          expect((courseApi as any)[apiMethod]).toHaveBeenCalledWith(...apiArgs);
          expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Pesan API");
          expect((coursesStore.$state as any)[flag]).toBe(true);
        });

        it("should use the default message when the api returns an empty message", async () => {
          vi.spyOn(courseApi, apiMethod as any).mockResolvedValue("");
          await call();

          expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith(defaultMessage);
        });

        it("should show the error and clear the flag on failure", async () => {
          vi.spyOn(courseApi, apiMethod as any).mockRejectedValue(
            new Error("Gagal mutasi")
          );
          coursesStore.setFlag(flag as any, true);
          await call();

          expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal mutasi");
          expect((coursesStore.$state as any)[flag]).toBe(false);
        });
      });
    });
  });
});
