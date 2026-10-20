import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import ProfilePage from "./ProfilePage.svelte";
import { usersStore } from "../states/usersStore";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";

const profile = {
  id: "1",
  name: "Abdullah Ubaid",
  email: "ifs18005@del.ac.id",
  photo: "https://example.com/photo.jpg",
};

function setFiles(input: Element, files: File[]) {
  Object.defineProperty(input, "files", { value: files, configurable: true });
}

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
  });

  it("should show a loading indicator when the profile is null", () => {
    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: { profile: null },
    });

    expect(wrapper.text()).toContain("Memuat data profil...");
  });

  it("should display the profile and profile photo", () => {
    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: { profile },
    });

    expect(wrapper.text()).toContain("Abdullah Ubaid");
    expect(wrapper.text()).toContain("ifs18005@del.ac.id");
    expect(wrapper.find(`img[src="${profile.photo}"]`).exists()).toBe(true);
  });

  it("should show an initial avatar when the photo or name is missing", () => {
    const noPhoto = renderWithProviders(ProfilePage, {
      preloadedState: { profile: { ...profile, photo: null } },
    });
    expect(noPhoto.wrapper.text()).toContain("A");

    const noName = renderWithProviders(ProfilePage, {
      preloadedState: { profile: { ...profile, name: "", photo: null } },
    });
    expect(noName.wrapper.text()).toContain("U");
  });

  it("should fall back to empty form values when name and email are missing", async () => {
    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: { profile: { ...profile, name: "", email: "" } },
    });
    await tick();

    expect(
      (wrapper.find('[data-testid="profile-name-input"]').element as HTMLInputElement)
        .value
    ).toBe("");
    expect(
      (wrapper.find('[data-testid="profile-email-input"]').element as HTMLInputElement)
        .value
    ).toBe("");
  });

  it("should validate and submit profile updates", async () => {
    const putSpy = vi.spyOn(usersStore, "asyncPutProfile").mockResolvedValue();
    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: { profile },
    });
    const form = wrapper.findAll("form")[0];

    await wrapper.find('[data-testid="profile-name-input"]').setValue("   ");
    await form.trigger("submit");
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
      "Nama tidak boleh kosong!"
    );

    await wrapper.find('[data-testid="profile-name-input"]').setValue("Abdullah Baru");
    await wrapper.find('[data-testid="profile-email-input"]').setValue("   ");
    await form.trigger("submit");
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
      "Email tidak boleh kosong!"
    );

    await wrapper.find('[data-testid="profile-email-input"]').setValue("baru@del.ac.id");
    await form.trigger("submit");
    await waitFor(() =>
      expect(putSpy).toHaveBeenCalledWith("Abdullah Baru", "baru@del.ac.id")
    );
  });

  it("should show the saving state while updating the profile", async () => {
    let resolveUpdate: (value: void) => void = () => {};
    vi.spyOn(usersStore, "asyncPutProfile").mockReturnValue(
      new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      })
    );
    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: { profile },
    });

    await wrapper.findAll("form")[0].trigger("submit");
    expect(wrapper.text()).toContain("Menyimpan Perubahan...");

    resolveUpdate();
    await waitFor(() => expect(wrapper.text()).toContain("Simpan Perubahan"));
  });

  it("should validate and upload a profile photo", async () => {
    const photoSpy = vi.spyOn(usersStore, "asyncPostProfilePhoto").mockResolvedValue();
    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: { profile },
    });
    const input = wrapper.find('[data-testid="profile-photo-file-input"]');

    setFiles(input.element, []);
    await input.trigger("change");
    expect(photoSpy).not.toHaveBeenCalled();

    setFiles(input.element, [new File(["x"], "file.txt", { type: "text/plain" })]);
    await input.trigger("change");
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
      "Pilih file gambar yang valid!"
    );

    setFiles(input.element, [
      new File([new Uint8Array(4 * 1024 * 1024)], "large.png", { type: "image/png" }),
    ]);
    await input.trigger("change");
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
      "Ukuran file foto maksimal 3MB!"
    );

    const validFile = new File(["img"], "profile.png", { type: "image/png" });
    setFiles(input.element, [validFile]);
    await input.trigger("change");
    await waitFor(() => expect(photoSpy).toHaveBeenCalledWith(validFile));
  });

  it("should validate and submit password updates", async () => {
    const passwordSpy = vi
      .spyOn(usersStore, "asyncPutProfilePassword")
      .mockImplementation(async () => {
        usersStore.setIsChangeProfilePassword(true);
      });
    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: { profile },
    });
    const form = wrapper.findAll("form")[1];

    await form.trigger("submit");
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
      "Kata sandi lama wajib diisi!"
    );

    await wrapper.find('[data-testid="current-password-input"]').setValue("old123");
    await wrapper.find('[data-testid="new-password-input"]').setValue("123");
    await form.trigger("submit");
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
      "Kata sandi baru minimal 6 karakter!"
    );

    await wrapper.find('[data-testid="new-password-input"]').setValue("password123");
    await wrapper.find('[data-testid="confirm-password-input"]').setValue("mismatch");
    await form.trigger("submit");
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
      "Konfirmasi kata sandi tidak cocok!"
    );

    await wrapper.find('[data-testid="confirm-password-input"]').setValue("password123");
    await form.trigger("submit");
    await waitFor(() =>
      expect(passwordSpy).toHaveBeenCalledWith("old123", "password123", "password123")
    );
    expect(
      (wrapper.find('[data-testid="current-password-input"]').element as HTMLInputElement)
        .value
    ).toBe("");
    expect(usersStore.$state.isChangeProfilePassword).toBe(false);
  });

  it("should keep the password fields when the update fails", async () => {
    vi.spyOn(usersStore, "asyncPutProfilePassword").mockImplementation(async () => {
      usersStore.setIsChangeProfilePassword(false);
    });
    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: { profile },
    });
    const form = wrapper.findAll("form")[1];

    await wrapper.find('[data-testid="current-password-input"]').setValue("old123");
    await wrapper.find('[data-testid="new-password-input"]').setValue("password123");
    await wrapper.find('[data-testid="confirm-password-input"]').setValue("password123");
    await form.trigger("submit");

    await waitFor(() =>
      expect(usersStore.$state.isChangeProfilePassword).toBe(false)
    );
    expect(
      (wrapper.find('[data-testid="current-password-input"]').element as HTMLInputElement)
        .value
    ).toBe("old123");
  });

  it("should show the password saving state", async () => {
    let resolvePassword: (value: void) => void = () => {};
    vi.spyOn(usersStore, "asyncPutProfilePassword").mockReturnValue(
      new Promise<void>((resolve) => {
        resolvePassword = resolve;
      })
    );
    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: { profile },
    });
    const form = wrapper.findAll("form")[1];

    await wrapper.find('[data-testid="current-password-input"]').setValue("old123");
    await wrapper.find('[data-testid="new-password-input"]').setValue("password123");
    await wrapper.find('[data-testid="confirm-password-input"]').setValue("password123");
    await form.trigger("submit");

    expect(wrapper.text()).toContain("Memperbarui Password...");
    resolvePassword();
    await waitFor(() => expect(wrapper.text()).toContain("Perbarui Password"));
  });

  it("should sync the form when the profile changes", async () => {
    const { wrapper, usersStore: store } = renderWithProviders(ProfilePage, {
      preloadedState: { profile },
    });

    store.setProfile({
      id: "1",
      name: "Updated Name",
      email: "updated@del.org",
      photo: null,
    });
    await waitFor(() =>
      expect(
        (
          wrapper.find('[data-testid="profile-name-input"]')
            .element as HTMLInputElement
        ).value
      ).toBe("Updated Name")
    );
    expect(
      (wrapper.find('[data-testid="profile-email-input"]').element as HTMLInputElement)
        .value
    ).toBe("updated@del.org");
  });
});
