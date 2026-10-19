<script lang="ts">
  import { untrack } from "svelte";
  import { LoaderCircle } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import type { CourseContent } from "../api/courseApi";
  import ModalShell from "./ModalShell.svelte";

  let {
    courseId,
    content = null,
    onClose,
    onSuccess,
  }: {
    courseId: string;
    content?: CourseContent | null;
    onClose: () => void;
    onSuccess: () => void;
  } = $props();

  const isEdit = untrack(() => Boolean(content));
  let title = $state(untrack(() => content?.title ?? ""));
  let youtube = $state(untrack(() => content?.youtube ?? ""));
  let loading = $state(false);

  async function onSubmitHandler(event: SubmitEvent) {
    event.preventDefault();
    loading = true;

    const flag = content ? "isChangeContent" : "isAddContent";
    if (content) {
      await coursesStore.asyncChangeContent(content.id, title.trim(), youtube.trim());
    } else {
      await coursesStore.asyncAddContent(courseId, title.trim(), youtube.trim());
    }
    loading = false;

    if (coursesStore.$state[flag]) {
      coursesStore.setFlag(flag, false);
      onSuccess();
    }
  }
</script>

<ModalShell title={isEdit ? "Ubah Konten" : "Tambah Konten"} {onClose}>
  <form onsubmit={onSubmitHandler} class="space-y-4">
    <div>
      <label for="content-title" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Judul Konten</label>
      <input
        id="content-title"
        data-testid="content-title"
        bind:value={title}
        required
        placeholder="Judul materi"
        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
      />
    </div>
    <div>
      <label for="content-youtube" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Tautan YouTube</label>
      <input
        id="content-youtube"
        data-testid="content-youtube"
        type="url"
        bind:value={youtube}
        required
        placeholder="https://www.youtube.com/watch?v=..."
        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
      />
    </div>
    <div class="flex justify-end gap-2 pt-2">
      <button type="button" data-testid="content-cancel" onclick={onClose} class="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl">
        Batal
      </button>
      <button type="submit" data-testid="content-submit" disabled={loading} class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-60">
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