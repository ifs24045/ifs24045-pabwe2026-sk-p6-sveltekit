<script lang="ts">
  import { LoaderCircle } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import { showWarningDialog } from "../../../helpers/toolsHelper";
  import ModalShell from "./ModalShell.svelte";

  let {
    courseId,
    onClose,
    onSuccess,
  }: { courseId: string; onClose: () => void; onSuccess: () => void } = $props();

  let file = $state<File | null>(null);
  let loading = $state(false);

  function onFileChange(event: Event) {
    file = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  async function onSubmitHandler(event: SubmitEvent) {
    event.preventDefault();

    if (!file) {
      showWarningDialog("Pilih berkas gambar terlebih dahulu!");
      return;
    }

    loading = true;
    await coursesStore.asyncChangeCourseCover(courseId, file);
    loading = false;

    if (coursesStore.$state.isChangeCourseCover) {
      coursesStore.setFlag("isChangeCourseCover", false);
      onSuccess();
    }
  }
</script>

<ModalShell title="Ubah Sampul Kursus" {onClose}>
  <form onsubmit={onSubmitHandler} class="space-y-4">
    <div>
      <label for="change-cover-file" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Berkas Gambar</label>
      <input
        id="change-cover-file"
        data-testid="change-cover-file"
        type="file"
        accept="image/*"
        onchange={onFileChange}
        class="w-full text-sm text-slate-600 file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold"
      />
    </div>
    <div class="flex justify-end gap-2 pt-2">
      <button type="button" data-testid="change-cover-cancel" onclick={onClose} class="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl">
        Batal
      </button>
      <button type="submit" data-testid="change-cover-submit" disabled={loading} class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-60">
        {#if loading}
          <LoaderCircle size={16} class="animate-spin" />
          <span>Mengunggah...</span>
        {:else}
          <span>Unggah Sampul</span>
        {/if}
      </button>
    </div>
  </form>
</ModalShell>