import type { Course } from "../api/courseApi";
import type { User } from "../../users/api/userApi";

export function isCourseOwner(
  course: Pick<Course, "user_id"> | null | undefined,
  profile: Pick<User, "id"> | null | undefined
): boolean {
  return Boolean(course && profile && course.user_id === profile.id);
}

export function isCourseStudent(
  course: Pick<Course, "students"> | null | undefined,
  profile: Pick<User, "id"> | null | undefined
): boolean {
  if (!course || !profile) return false;
  return (course.students || []).some(
    (student: any) => (student?.user_id ?? student?.id ?? student) === profile.id
  );
}

export function isFinished(status: unknown): boolean {
  return Number(status) === 1;
}

export function getYoutubeEmbedUrl(url?: string | null): string | null {
  const match = (url || "").match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}