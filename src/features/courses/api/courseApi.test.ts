import { describe, it, expect, vi, beforeEach } from "vitest";
import courseApi from "./courseApi";
import apiHelper from "../../../helpers/apiHelper";

function mockResponse(body: any, status = 200) {
  vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
    status,
    json: async () => body,
  } as unknown as Response);
}

describe("courseApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getCourses", () => {
    it("should return courses on success", async () => {
      mockResponse({ status: "success", data: { courses: [{ id: "1" }] } });
      expect(await courseApi.getCourses()).toEqual([{ id: "1" }]);
    });

    it("should append the is_me parameter when requested", async () => {
      mockResponse({ status: "success", data: { courses: [] } });
      await courseApi.getCourses(true);
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/courses?is_me=1"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should return empty array when courses are missing", async () => {
      mockResponse({ success: true });
      expect(await courseApi.getCourses()).toEqual([]);
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Gagal custom" });
      await expect(courseApi.getCourses()).rejects.toThrow("Gagal custom");
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(courseApi.getCourses()).rejects.toThrow("Gagal mengambil data kursus");
    });
  });

  describe("getCourseById", () => {
    it("should return the course detail", async () => {
      mockResponse({ status: "success", data: { course: { id: "7" } } });
      expect(await courseApi.getCourseById("7")).toEqual({ id: "7" });
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/courses/7"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Tidak ada" });
      await expect(courseApi.getCourseById("7")).rejects.toThrow("Tidak ada");
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(courseApi.getCourseById("7")).rejects.toThrow(
        "Gagal mengambil detail kursus"
      );
    });
  });

  describe("postCourse", () => {
    it("should send title and description and return the message", async () => {
      mockResponse({ status: "success", message: "Kursus dibuat" });
      expect(await courseApi.postCourse("Judul", "Deskripsi")).toBe("Kursus dibuat");

      const options = vi.mocked(apiHelper.fetchData).mock.calls[0][1] as RequestInit;
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body as string)).toEqual({
        title: "Judul",
        description: "Deskripsi",
      });
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Data tidak valid" });
      await expect(courseApi.postCourse("a", "b")).rejects.toThrow("Data tidak valid");
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(courseApi.postCourse("a", "b")).rejects.toThrow(
        "Gagal menambah kursus"
      );
    });
  });

  describe("postCourseCover", () => {
    it("should upload the cover using its own filename", async () => {
      mockResponse({ status: "success", message: "Cover diubah" });
      const file = new File(["x"], "cover.png", { type: "image/png" });
      expect(await courseApi.postCourseCover("1", file)).toBe("Cover diubah");

      const options = vi.mocked(apiHelper.fetchData).mock.calls[0][1] as RequestInit;
      expect(options.method).toBe("POST");
      expect((options.body as FormData).get("cover")).toBeInstanceOf(File);
    });

    it("should fall back to cover.png when the file has no name", async () => {
      mockResponse({ status: "success", message: "ok" });
      const blob = new Blob(["x"], { type: "image/png" }) as File;
      await courseApi.postCourseCover("1", blob);

      const options = vi.mocked(apiHelper.fetchData).mock.calls[0][1] as RequestInit;
      expect(((options.body as FormData).get("cover") as File).name).toBe("cover.png");
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Berkas terlalu besar" });
      const file = new File(["x"], "cover.png");
      await expect(courseApi.postCourseCover("1", file)).rejects.toThrow(
        "Berkas terlalu besar"
      );
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      const file = new File(["x"], "cover.png");
      await expect(courseApi.postCourseCover("1", file)).rejects.toThrow(
        "Gagal mengubah sampul kursus"
      );
    });
  });

  describe("putCourse", () => {
    it("should send the updated course data", async () => {
      mockResponse({ status: "success", message: "Kursus diubah" });
      expect(await courseApi.putCourse("1", "Baru", "Deskripsi baru")).toBe(
        "Kursus diubah"
      );

      const options = vi.mocked(apiHelper.fetchData).mock.calls[0][1] as RequestInit;
      expect(options.method).toBe("PUT");
      expect(JSON.parse(options.body as string)).toEqual({
        title: "Baru",
        description: "Deskripsi baru",
      });
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Data tidak valid" });
      await expect(courseApi.putCourse("1", "a", "b")).rejects.toThrow(
        "Data tidak valid"
      );
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(courseApi.putCourse("1", "a", "b")).rejects.toThrow(
        "Gagal mengubah kursus"
      );
    });
  });

  describe("deleteCourse", () => {
    it("should delete a single course", async () => {
      mockResponse({ status: "success", message: "Kursus dihapus" });
      expect(await courseApi.deleteCourse("1")).toBe("Kursus dihapus");
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/courses/1"),
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Tidak ditemukan" });
      await expect(courseApi.deleteCourse("1")).rejects.toThrow("Tidak ditemukan");
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(courseApi.deleteCourse("1")).rejects.toThrow(
        "Gagal menghapus kursus"
      );
    });
  });

  describe("deleteAllCourses", () => {
    it("should delete all courses", async () => {
      mockResponse({ status: "success", message: "Semua dihapus" });
      expect(await courseApi.deleteAllCourses()).toBe("Semua dihapus");
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/courses"),
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Unauthenticated." });
      await expect(courseApi.deleteAllCourses()).rejects.toThrow("Unauthenticated.");
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(courseApi.deleteAllCourses()).rejects.toThrow(
        "Gagal menghapus semua kursus"
      );
    });
  });

  describe("postStudent", () => {
    it("should join a course", async () => {
      mockResponse({ status: "success", message: "Bergabung" });
      expect(await courseApi.postStudent("1")).toBe("Bergabung");
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/courses/1/students"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Sudah terdaftar" });
      await expect(courseApi.postStudent("1")).rejects.toThrow("Sudah terdaftar");
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(courseApi.postStudent("1")).rejects.toThrow(
        "Gagal mendaftar ke kursus"
      );
    });
  });

  describe("deleteStudent", () => {
    it("should leave a course", async () => {
      mockResponse({ status: "success", message: "Keluar" });
      expect(await courseApi.deleteStudent("1")).toBe("Keluar");
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/courses/1/students"),
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Bukan peserta" });
      await expect(courseApi.deleteStudent("1")).rejects.toThrow("Bukan peserta");
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(courseApi.deleteStudent("1")).rejects.toThrow(
        "Gagal keluar dari kursus"
      );
    });
  });

  describe("putRatings", () => {
    it("should send ratings and comment", async () => {
      mockResponse({ status: "success", message: "Rating disimpan" });
      expect(await courseApi.putRatings("1", 5, "Mantap")).toBe("Rating disimpan");

      const options = vi.mocked(apiHelper.fetchData).mock.calls[0][1] as RequestInit;
      expect(options.method).toBe("PUT");
      expect(JSON.parse(options.body as string)).toEqual({
        ratings: 5,
        comment: "Mantap",
      });
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Rating tidak valid" });
      await expect(courseApi.putRatings("1", 9, "")).rejects.toThrow(
        "Rating tidak valid"
      );
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(courseApi.putRatings("1", 5, "")).rejects.toThrow(
        "Gagal mengubah rating kursus"
      );
    });
  });

  describe("postContent", () => {
    it("should add new content", async () => {
      mockResponse({ status: "success", message: "Konten dibuat" });
      expect(await courseApi.postContent("1", "Materi", "https://youtu.be/abc")).toBe(
        "Konten dibuat"
      );

      const options = vi.mocked(apiHelper.fetchData).mock.calls[0][1] as RequestInit;
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body as string)).toEqual({
        title: "Materi",
        youtube: "https://youtu.be/abc",
      });
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Data tidak valid" });
      await expect(courseApi.postContent("1", "a", "b")).rejects.toThrow(
        "Data tidak valid"
      );
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(courseApi.postContent("1", "a", "b")).rejects.toThrow(
        "Gagal menambah konten"
      );
    });
  });

  describe("putContent", () => {
    it("should update content", async () => {
      mockResponse({ status: "success", message: "Konten diubah" });
      expect(await courseApi.putContent("3", "Baru", "https://youtu.be/abc")).toBe(
        "Konten diubah"
      );
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/courses/-/contents/3"),
        expect.objectContaining({ method: "PUT" })
      );
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Data tidak valid" });
      await expect(courseApi.putContent("3", "a", "b")).rejects.toThrow(
        "Data tidak valid"
      );
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(courseApi.putContent("3", "a", "b")).rejects.toThrow(
        "Gagal mengubah konten"
      );
    });
  });

  describe("getContentById", () => {
    it("should return course content", async () => {
      mockResponse({ status: "success", data: { course_content: { id: "3" } } });
      expect(await courseApi.getContentById("3")).toEqual({ id: "3" });
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/courses/-/contents/3"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Tidak ada" });
      await expect(courseApi.getContentById("3")).rejects.toThrow("Tidak ada");
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(courseApi.getContentById("3")).rejects.toThrow(
        "Gagal mengambil detail konten"
      );
    });
  });

  describe("deleteContent", () => {
    it("should delete content", async () => {
      mockResponse({ status: "success", message: "Konten dihapus" });
      expect(await courseApi.deleteContent("3")).toBe("Konten dihapus");
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/courses/-/contents/3"),
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Tidak ditemukan" });
      await expect(courseApi.deleteContent("3")).rejects.toThrow("Tidak ditemukan");
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(courseApi.deleteContent("3")).rejects.toThrow(
        "Gagal menghapus konten"
      );
    });
  });

  describe("postContentStatus", () => {
    it("should update the learning status", async () => {
      mockResponse({ status: "success", message: "Status diubah" });
      expect(await courseApi.postContentStatus("3", 1)).toBe("Status diubah");

      const options = vi.mocked(apiHelper.fetchData).mock.calls[0][1] as RequestInit;
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body as string)).toEqual({ status: 1 });
      expect(apiHelper.fetchData).toHaveBeenCalledWith(
        expect.stringContaining("/courses/-/contents/3/learns"),
        expect.anything()
      );
    });

    it("should throw message from api on failure", async () => {
      mockResponse({ status: "fail", message: "Bukan peserta" });
      await expect(courseApi.postContentStatus("3", 0)).rejects.toThrow("Bukan peserta");
    });

    it("should throw default message on failure without message", async () => {
      mockResponse({ status: "fail" });
      await expect(courseApi.postContentStatus("3", 0)).rejects.toThrow(
        "Gagal mengubah status belajar"
      );
    });
  });
});
