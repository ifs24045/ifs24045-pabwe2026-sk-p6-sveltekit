import apiHelper from "../../../helpers/apiHelper";

export type User = {
  id: string;
  name: string;
  email: string;
  photo?: string | null;
  created_at?: string;
  updated_at?: string;
};

const userApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/users`;

  function _url(path: string): string {
    return BASE_URL + path;
  }

  function _isFailed(result: any): boolean {
    return result.status !== "success" && !result.success;
  }

  async function getUsers(): Promise<User[]> {
    const response = await apiHelper.fetchData(_url("/"), { method: "GET" });
    const result = await response.json();
    if (_isFailed(result)) {
      throw new Error(result.message || "Gagal mengambil data pengguna");
    }
    return result.data?.users || [];
  }

  async function getUserById(userId: string): Promise<User> {
    const response = await apiHelper.fetchData(_url(`/${userId}`), { method: "GET" });
    const result = await response.json();
    if (_isFailed(result)) {
      throw new Error(result.message || "Gagal mengambil detail pengguna");
    }
    return result.data?.user;
  }

  async function getProfile(): Promise<User> {
    const response = await apiHelper.fetchData(_url("/me"), { method: "GET" });
    const result = await response.json();
    if (_isFailed(result)) {
      const error: Error & { status?: number } = new Error(
        result.message || "Gagal mengambil data profil"
      );
      error.status = response.status;
      throw error;
    }
    return result.data?.user;
  }

  async function putProfile(name: string, email: string): Promise<User> {
    const response = await apiHelper.fetchData(_url("/me"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const result = await response.json();
    if (_isFailed(result)) {
      throw new Error(result.message || "Gagal mengubah profil");
    }
    return result.data?.user;
  }

  async function postProfilePhoto(photo: File): Promise<string> {
    const formData = new FormData();
    formData.append("photo", photo, photo.name || "profile.png");
    const response = await apiHelper.fetchData(_url("/me/photo"), {
      method: "PUT",
      body: formData,
    });
    const result = await response.json();
    if (_isFailed(result)) {
      throw new Error(result.message || "Gagal mengubah foto profil");
    }
    return result.message;
  }

  async function putProfilePassword(
    password: string,
    newPassword: string,
    newPasswordConfirmation?: string
  ): Promise<string> {
    const response = await apiHelper.fetchData(_url("/password"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation || newPassword,
      }),
    });
    const result = await response.json();
    if (_isFailed(result)) {
      throw new Error(result.message || "Gagal mengubah kata sandi");
    }
    return result.message;
  }

  return {
    getUsers,
    getUserById,
    getProfile,
    putProfile,
    postProfilePhoto,
    putProfilePassword,
  };
})();

export default userApi;