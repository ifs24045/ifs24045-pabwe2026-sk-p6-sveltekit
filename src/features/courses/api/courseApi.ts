import apiHelper from "../../../helpers/apiHelper";

export type Rating = {
  name: string;
  ratings: number;
  comment: string;
};

export type CourseContent = {
  id: string;
  course_id: string;
  title: string;
  youtube: string;
  created_at?: string;
  updated_at?: string;
  my_status_finished?: number | boolean;
};

export type Course = {
  id: string;
  user_id: string;
  title: string;
  cover?: string | null;
  description: string;
  created_at?: string;
  updated_at?: string;
  author?: { name: string; photo?: string | null };
  students?: any[];
  total_contents?: number;
  avg_ratings?: string | null;
  contents?: CourseContent[];
  ratings?: Rating[];
  my_percentage_finished?: string;
};

const courseApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/courses`;

  function _url(path: string): string {
    return BASE_URL + path;
  }

  function _isFailed(result: any): boolean {
    return result.status !== "success" && !result.success;
  }

  function _json(method: string, body?: unknown): RequestInit {
    return {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    };
  }

  async function _call(path: string, options: RequestInit, fallback: string): Promise<any> {
    const response = await apiHelper.fetchData(_url(path), options);
    const result = await response.json();
    if (_isFailed(result)) {
      throw new Error(result.message || fallback);
    }
    return result;
  }

  async function getCourses(isMe = false): Promise<Course[]> {
    const result = await _call(
      isMe ? "?is_me=1" : "",
      { method: "GET" },
      "Gagal mengambil data kursus"
    );
    return result.data?.courses || [];
  }

  async function getCourseById(courseId: string): Promise<Course> {
    const result = await _call(`/${courseId}`, { method: "GET" }, "Gagal mengambil detail kursus");
    return result.data?.course;
  }

  async function postCourse(title: string, description: string): Promise<string> {
    const result = await _call("", _json("POST", { title, description }), "Gagal menambah kursus");
    return result.message;
  }

  async function postCourseCover(courseId: string, cover: File): Promise<string> {
    const formData = new FormData();
    formData.append("cover", cover, cover.name || "cover.png");
    const result = await _call(
      `/${courseId}/cover`,
      { method: "POST", body: formData },
      "Gagal mengubah sampul kursus"
    );
    return result.message;
  }

  async function putCourse(courseId: string, title: string, description: string): Promise<string> {
    const result = await _call(
      `/${courseId}`,
      _json("PUT", { title, description }),
      "Gagal mengubah kursus"
    );
    return result.message;
  }

  async function deleteCourse(courseId: string): Promise<string> {
    const result = await _call(`/${courseId}`, { method: "DELETE" }, "Gagal menghapus kursus");
    return result.message;
  }

  async function deleteAllCourses(): Promise<string> {
    const result = await _call("", { method: "DELETE" }, "Gagal menghapus semua kursus");
    return result.message;
  }

  async function postStudent(courseId: string): Promise<string> {
    const result = await _call(
      `/${courseId}/students`,
      { method: "POST" },
      "Gagal mendaftar ke kursus"
    );
    return result.message;
  }

  async function deleteStudent(courseId: string): Promise<string> {
    const result = await _call(
      `/${courseId}/students`,
      { method: "DELETE" },
      "Gagal keluar dari kursus"
    );
    return result.message;
  }

  async function putRatings(courseId: string, ratings: number, comment: string): Promise<string> {
    const result = await _call(
      `/${courseId}/students/ratings`,
      _json("PUT", { ratings, comment }),
      "Gagal mengubah rating kursus"
    );
    return result.message;
  }

  async function postContent(courseId: string, title: string, youtube: string): Promise<string> {
    const result = await _call(
      `/${courseId}/contents`,
      _json("POST", { title, youtube }),
      "Gagal menambah konten"
    );
    return result.message;
  }

  async function putContent(contentId: string, title: string, youtube: string): Promise<string> {
    const result = await _call(
      `/-/contents/${contentId}`,
      _json("PUT", { title, youtube }),
      "Gagal mengubah konten"
    );
    return result.message;
  }

  async function getContentById(contentId: string): Promise<CourseContent> {
    const result = await _call(
      `/-/contents/${contentId}`,
      { method: "GET" },
      "Gagal mengambil detail konten"
    );
    return result.data?.course_content;
  }

  async function deleteContent(contentId: string): Promise<string> {
    const result = await _call(
      `/-/contents/${contentId}`,
      _json("DELETE"),
      "Gagal menghapus konten"
    );
    return result.message;
  }

  async function postContentStatus(contentId: string, status: 0 | 1): Promise<string> {
    const result = await _call(
      `/-/contents/${contentId}/learns`,
      _json("POST", { status }),
      "Gagal mengubah status belajar"
    );
    return result.message;
  }

  return {
    getCourses,
    getCourseById,
    postCourse,
    postCourseCover,
    putCourse,
    deleteCourse,
    deleteAllCourses,
    postStudent,
    deleteStudent,
    putRatings,
    postContent,
    putContent,
    getContentById,
    deleteContent,
    postContentStatus,
  };
})();

export default courseApi;