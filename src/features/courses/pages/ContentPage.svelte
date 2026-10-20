<script lang="ts">
  import { onMount } from "svelte";
  import {
    ArrowLeft,
    CircleCheck,
    CirclePlay,
    GraduationCap,
    LoaderCircle,
    Video,
  } from "lucide-svelte";
  import { page } from "$app/state";
  import { coursesStore } from "../states/coursesStore";
  import { getYoutubeEmbedUrl, isFinished } from "../helpers/courseHelper";

  const contentId = $derived(page.params.contentId);
  const courseId = $derived(page.params.courseId);
  const stored = $derived($coursesStore.content);
  const content = $derived(
    stored && String(stored.id) === String(contentId) ? stored : null
  );
  const embedUrl = $derived(getYoutubeEmbedUrl(content?.youtube));

  let loading = $state(false);
  let loadingStatus = $state(false);

  function loadContent() {
    loading = true;
    return Promise.resolve(coursesStore.asyncSetContent(String(contentId))).finally(() => {
      loading = false;
    });
  }

  onMount(() => {
    loadContent();
  });

  async function toggleFinished() {
    const activeContent = content!;
    const nextStatus = isFinished(activeContent.my_status_finished) ? 0 : 1;
    loadingStatus = true;
    await coursesStore.asyncChangeContentStatus(activeContent.id, nextStatus);
    coursesStore.setFlag("isChangeContentStatus", false);
    await loadContent();
    loadingStatus = false;
  }
</script>

<div class="space-y-6">
  <a
    href={`/courses/${courseId}`}
    data-testid="back-to-course-btn"
    class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
  >
    <ArrowLeft size={16} />
    Kembali ke Kursus
  </a>

  {#if !content && loading}
    <div class="flex flex-col items-center justify-center py-24">
      <h1 class="sr-only">Materi Kursus</h1>
      <LoaderCircle size={36} class="text-indigo-600 animate-spin mb-2" />
      <p class="text-sm font-medium text-slate-600">Memuat materi kursus...</p>
    </div>
  {:else if !content}
    <div class="py-16 text-center text-slate-600">
      <h1 class="sr-only">Materi Kursus</h1>
      <Video size={40} class="mx-auto text-slate-300 mb-2" />
      <p class="font-medium">Materi tidak ditemukan.</p>
    </div>
  {:else}
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="p-6 sm:p-8 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="space-y-2">
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
              <GraduationCap size={13} />
              Materi Kursus
            </span>
            <h1 data-testid="content-title" class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {content.title}
            </h1>
            <p data-testid="content-youtube" class="text-sm text-slate-600 break-all">
              {content.youtube}
            </p>
          </div>

          <button
            type="button"
            data-testid="toggle-finished-btn"
            onclick={toggleFinished}
            disabled={loadingStatus}
            class={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 ${
              isFinished(content.my_status_finished)
                ? "text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                : "text-white bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {#if loadingStatus}
              <LoaderCircle size={16} class="animate-spin" />
              <span>Menyimpan...</span>
            {:else}
              <CircleCheck size={16} />
              <span>
                {isFinished(content.my_status_finished)
                  ? "Tandai Belum Selesai"
                  : "Tandai Selesai"}
              </span>
            {/if}
          </button>
        </div>

        <div
          data-testid="content-status"
          class={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isFinished(content.my_status_finished)
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          <CircleCheck size={14} />
          {isFinished(content.my_status_finished) ? "Sudah selesai" : "Belum selesai"}
        </div>
      </div>

      {#if embedUrl}
        <div class="aspect-video w-full bg-slate-900">
          <iframe
            data-testid="content-iframe"
            src={embedUrl}
            title={content.title}
            class="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      {:else}
        <div data-testid="content-no-video" class="p-8 text-center text-slate-600">
          <CirclePlay size={40} class="mx-auto text-slate-300 mb-2" />
          <p class="font-medium">Tautan video tidak dapat diputar.</p>
          <a
            href={content.youtube}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Buka tautan video
          </a>
        </div>
      {/if}
    </div>
  {/if}
</div>
