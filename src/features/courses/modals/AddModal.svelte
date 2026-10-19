<script lang="ts">
  import { LoaderCircle } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import ModalShell from "./ModalShell.svelte";

  let { onClose, onSuccess }: { onClose: () => void; onSuccess: () => void } = $props();

  let title = $state("");
  let description = $state("");
  let loading = $state(false);

  async function onSubmitHandler(event: SubmitEvent) {
    event.preventDefault();
    loading = true;
    await coursesStore.asyncAddCourse(title.trim(), description.trim());
    loading = false;

    if (coursesStore.$state.isAddCourse) {
      coursesStore.setFlag("isAddCourse", false);
      onSuccess();
    }
  }
</script>

<ModalShell title="Tambah Kursus" {onClose}>
  <form onsubmit={onSubmitHandler} class="space-y-4">
    <div>
      <label for="add-course-title" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Judul</label>
      <input
        id="add-course-title"
        data-testid="add-course-title"
        bind:value={title}
        required
        placeholder="Judul kursus"
        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
      />
    </div>
    <div>
      <label for="add-course-description" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Deskripsi</label>
      <textarea
        id="add-course-description"
        data-testid="add-course-description"
        bind:value={description}
        required
        rows="4"
        placeholder="Deskripsi kursus"
        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
      ></textarea>
    </div>
    <div class="flex justify-end gap-2 pt-2">
      <button type="button" data-testid="add-course-cancel" onclick={onClose} class="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl">
        Batal
      </button>
      <button type="submit" data-testid="add-course-submit" disabled={loading} class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-60">
        {#if loading}
          <LoaderCircle size={16} class="animate-spin" />
          <span>Menyimpan...</span>
        {:else}
          <span>Simpan</span>
        {/if}
      </button>
    </div>
  </form>
</ModalShell>