import { describe, it, expect } from "vitest";
import {
  getYoutubeEmbedUrl,
  hasCover,
  isCourseOwner,
  isCourseStudent,
  isFinished,
} from "./courseHelper";

describe("courseHelper", () => {
  describe("isCourseOwner", () => {
    it("should return true when the course belongs to the profile", () => {
      expect(isCourseOwner({ user_id: "1" }, { id: "1" })).toBe(true);
    });

    it("should return false when ids differ", () => {
      expect(isCourseOwner({ user_id: "1" }, { id: "2" })).toBe(false);
    });

    it("should return false when the course or profile is missing", () => {
      expect(isCourseOwner(null, { id: "1" })).toBe(false);
      expect(isCourseOwner({ user_id: "1" }, null)).toBe(false);
    });
  });

  describe("isCourseStudent", () => {
    it("should detect students stored as primitive ids", () => {
      expect(isCourseStudent({ students: ["1", "2"] }, { id: "2" })).toBe(true);
    });

    it("should detect students stored as objects", () => {
      expect(isCourseStudent({ students: [{ id: "3" }] }, { id: "3" })).toBe(true);
      expect(
        isCourseStudent({ students: [{ user_id: "4" }] }, { id: "4" })
      ).toBe(true);
    });

    it("should return false when the user is not a student", () => {
      expect(isCourseStudent({ students: ["1"] }, { id: "9" })).toBe(false);
      expect(isCourseStudent({ students: [] }, { id: "1" })).toBe(false);
    });

    it("should return false when the course, students, or profile is missing", () => {
      expect(isCourseStudent(null, { id: "1" })).toBe(false);
      expect(isCourseStudent({}, { id: "1" })).toBe(false);
      expect(isCourseStudent({ students: ["1"] }, null)).toBe(false);
    });
  });

  describe("isFinished", () => {
    it("should return true only for status 1", () => {
      expect(isFinished(1)).toBe(true);
      expect(isFinished("1")).toBe(true);
      expect(isFinished(true)).toBe(true);
      expect(isFinished(0)).toBe(false);
      expect(isFinished(false)).toBe(false);
      expect(isFinished(undefined)).toBe(false);
    });
  });

  describe("hasCover", () => {
    it("should return true for a real cover url", () => {
      expect(hasCover("https://example.com/cover.jpg")).toBe(true);
    });

    it("should return false for missing or default empty covers", () => {
      expect(hasCover(null)).toBe(false);
      expect(hasCover(undefined)).toBe(false);
      expect(hasCover("http://localhost:8000/")).toBe(false);
    });
  });

  describe("getYoutubeEmbedUrl", () => {
    it("should convert watch urls", () => {
      expect(getYoutubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
        "https://www.youtube.com/embed/dQw4w9WgXcQ"
      );
      expect(
        getYoutubeEmbedUrl("https://www.youtube.com/watch?list=abc&v=dQw4w9WgXcQ")
      ).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
    });

    it("should convert embed, shorts, and short urls", () => {
      expect(getYoutubeEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(
        "https://www.youtube.com/embed/dQw4w9WgXcQ"
      );
      expect(getYoutubeEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(
        "https://www.youtube.com/embed/dQw4w9WgXcQ"
      );
      expect(getYoutubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
        "https://www.youtube.com/embed/dQw4w9WgXcQ"
      );
    });

    it("should return null for unsupported or empty urls", () => {
      expect(getYoutubeEmbedUrl("https://example.com/video")).toBeNull();
      expect(getYoutubeEmbedUrl("")).toBeNull();
      expect(getYoutubeEmbedUrl(null)).toBeNull();
      expect(getYoutubeEmbedUrl(undefined)).toBeNull();
    });
  });
});
