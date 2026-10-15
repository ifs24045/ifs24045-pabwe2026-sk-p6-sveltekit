import apiHelper from "../../../helpers/apiHelper";

const authApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/auth`;

  function _url(path: string): string {
    return BASE_URL + path;
  }

  function _isFailed(result: any): boolean {
    return result.status !== "success" && !result.success;
  }

  async function postRegister(name: string, email: string, password: string): Promise<string> {
    const response = await apiHelper.fetchData(_url("/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json();
    if (_isFailed(result)) {
      const errorDetails =
        result.data && typeof result.data === "object"
          ? Object.values(result.data).flat().join(", ")
          : "";
      const baseMsg = result.message || "Gagal melakukan pendaftaran";
      throw new Error(errorDetails ? `${baseMsg}: ${errorDetails}` : baseMsg);
    }

    return result.message;
  }

  async function postLogin(email: string, password: string): Promise<{ token: string }> {
    const response = await apiHelper.fetchData(_url("/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (_isFailed(result)) {
      throw new Error(result.message || "Gagal login");
    }

    return result.data;
  }

  async function postLogout(): Promise<string> {
    const response = await apiHelper.fetchData(_url("/logout"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    if (_isFailed(result)) {
      throw new Error(result.message || "Gagal logout");
    }

    return result.message;
  }

  return {
    postRegister,
    postLogin,
    postLogout,
  };
})();

export default authApi;