<script lang="ts">
  import { untrack } from "svelte";
  import { LoaderCircle } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import type { Course } from "../api/courseApi";
  import ModalShell from "./ModalShell.svelte";

  let {
    course,
    onClose,
    onSuccess,
  }: { course: Course; onClose: () => void; onSuccess: () => void } = $props();

  let title = $state(untrack(() => course.title));
  let description = $state(untrack(() => course.description));
  let loading = $state(false);

  async function onSubmitHandler(event: SubmitEvent) {
    event.preventDefault();
    loading = true;
    await coursesStore.asyncChangeCourse(course.id, title.trim(), description.trim());
    loading = false;

    if (coursesStore.$state.isChangeCourse) {
      coursesStore.setFlag("isChangeCourse", false);
      onSuccess();
    }
  }
</script>

<ModalShell title="Ubah Kursus" {onClose}>
  <form onsubmit={onSubmitHandler} class="space-y-4">
    <div>
      <label for="change-course-title" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Judul</label>
      <input
        id="change-course-title"
        data-testid="change-course-title"
        bind:value={title}
        required
        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
      />
    </div>
    <div>
      <label for="change-course-description" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Deskripsi</label>
      <textarea
        id="change-course-description"
        data-testid="change-course-description"
        bind:value={description}
        required
        rows="4"
        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
      ></textarea>
    </div>
    <div class="flex justify-end gap-2 pt-2">
      <button type="button" data-testid="change-course-cancel" onclick={onClose} class="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl">
        Batal
      </button>
      <button type="submit" data-testid="change-course-submit" disabled={loading} class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-60">
        {#if loading}
          <LoaderCircle size={16} class="animate-spin" />
          <span>Menyimpan...</span>
        {:else}
          <span>Simpan Perubahan</span>
        {/if}
      </button>
    </div>
  </form>
</ModalShell>