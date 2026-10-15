import { describe, it, expect, vi, beforeEach } from "vitest";
import Swal from "sweetalert2";
import {
  showErrorDialog,
  showWarningDialog,
  showSuccessDialog,
  showConfirmDialog,
  formatDate,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
    close: vi.fn(),
  },
}));

const fire = vi.mocked(Swal.fire);
const close = vi.mocked(Swal.close);

describe("toolsHelper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call Swal.fire for showErrorDialog and handle confirmation", async () => {
    fire.mockResolvedValue({ isConfirmed: true } as any);
    await showErrorDialog("Error test");
    expect(fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Terjadi Kesalahan",
        text: "Error test",
        icon: "error",
      })
    );
    expect(close).toHaveBeenCalledTimes(1);

    fire.mockResolvedValue({ isConfirmed: false } as any);
    await showErrorDialog("Error test");
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("should call Swal.fire for showWarningDialog and handle confirmation", async () => {
    fire.mockResolvedValue({ isConfirmed: true } as any);
    await showWarningDialog("Warning test");
    expect(fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Peringatan",
        text: "Warning test",
        icon: "warning",
      })
    );
    expect(close).toHaveBeenCalledTimes(1);

    fire.mockResolvedValue({ isConfirmed: false } as any);
    await showWarningDialog("Warning test");
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("should call Swal.fire for showSuccessDialog and handle confirmation", async () => {
    fire.mockResolvedValue({ isConfirmed: true } as any);
    await showSuccessDialog("Success test");
    expect(fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Tindakan Berhasil",
        text: "Success test",
        icon: "success",
      })
    );
    expect(close).toHaveBeenCalledTimes(1);

    fire.mockResolvedValue({ isConfirmed: false } as any);
    await showSuccessDialog("Success test");
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("should call Swal.fire for showConfirmDialog", async () => {
    fire.mockResolvedValue({ isConfirmed: true } as any);
    const res = await showConfirmDialog("Confirm test?");
    expect(fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Konfirmasi",
        text: "Confirm test?",
        icon: "question",
      })
    );
    expect(res.isConfirmed).toBe(true);
  });

  it("should format date correctly or return fallback for empty date", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    const formatted = formatDate("2024-02-26T02:34:26.000000Z");
    expect(typeof formatted).toBe("string");
    expect(formatted).toContain("2024");
  });
});