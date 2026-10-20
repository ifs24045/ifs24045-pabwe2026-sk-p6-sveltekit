<script lang="ts">
  import { onMount } from "svelte";
  import {
    ArrowLeft,
    BookOpen,
    CircleCheck,
    GraduationCap,
    ImagePlus,
    LoaderCircle,
    LogOut,
    Pencil,
    Plus,
    Star,
    Trash2,
    UserPlus,
    Users,
    Video,
  } from "lucide-svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { coursesStore } from "../states/coursesStore";
  import { usersStore } from "../../users/states/usersStore";
  import {
    hasCover,
    isCourseOwner,
    isCourseStudent,
    isFinished,
  } from "../helpers/courseHelper";
  import { showConfirmDialog } from "../../../helpers/toolsHelper";
  import type { Course, CourseContent } from "../api/courseApi";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ContentModal from "../modals/ContentModal.svelte";

  const courseId = $derived(page.params.courseId);
  const stored = $derived($coursesStore.course);
  const course = $derived(
    stored && String(stored.id) === String(courseId) ? stored : null
  );
  const profile = $derived($usersStore.profile);
  const isOwner = $derived(isCourseOwner(course, profile));
  const isStudent = $derived(isCourseStudent(course, profile));
  // Turunan ini hanya dipakai pada cabang template ketika `course` sudah ada.
  const contents = $derived((course as Course).contents ?? []);
  const ratings = $derived((course as Course).ratings ?? []);
  const students = $derived((course as Course).students ?? []);

  let loading = $state(false);
  let loadingAction = $state(false);
  let showChangeModal = $state(false);
  let showCoverModal = $state(false);
  let showContentModal = $state(false);
  let editingContent = $state<CourseContent | null>(null);
  let rating = $state(5);
  let comment = $state("");

  function loadCourse() {
    loading = true;
    return Promise.resolve(coursesStore.asyncSetCourse(String(courseId))).finally(() => {
      loading = false;
    });
  }

  onMount(() => {
    loadCourse();
    usersStore.asyncSetUsers();
  });

  function participantName(student: unknown): string {
    const id =
      typeof student === "object" && student !== null
        ? ((student as { id?: string | number }).id ??
          (student as { user_id?: string | number }).user_id)
        : student;
    const found = $usersStore.users.find((user) => String(user.id) === String(id));
    return found ? found.name : `Pengguna #${id}`;
  }

  async function handleJoin() {
    loadingAction = true;
    await coursesStore.asyncJoinCourse(String(courseId));
    coursesStore.setFlag("isJoinCourse", false);
    await loadCourse();
    loadingAction = false;
  }

  async function handleLeave() {
    loadingAction = true;
    await coursesStore.asyncLeaveCourse(String(courseId));
    coursesStore.setFlag("isLeaveCourse", false);
    await loadCourse();
    loadingAction = false;
  }

  async function handleRating(event: SubmitEvent) {
    event.preventDefault();

    const activeCourse = course!;
    loadingAction = true;
    await coursesStore.asyncChangeRating(activeCourse.id, Number(rating), comment.trim());
    coursesStore.setFlag("isChangeRating", false);
    comment = "";
    await loadCourse();
    loadingAction = false;
  }

  async function handleDeleteCourse() {
    const activeCourse = course!;
    const result = await showConfirmDialog(
      `Hapus kursus "${activeCourse.title}" beserta seluruh materinya?`
    );
    if (result.isConfirmed) {
      await coursesStore.asyncDeleteCourse(activeCourse.id);
      coursesStore.setFlag("isDeleteCourse", false);
      goto("/");
    }
  }

  async function handleDeleteContent(content: CourseContent) {
    const result = await showConfirmDialog(`Hapus materi "${content.title}"?`);
    if (result.isConfirmed) {
      await coursesStore.asyncDeleteContent(content.id);
      coursesStore.setFlag("isDeleteContent", false);
      await loadCourse();
    }
  }

  function openAddContent() {
    editingContent = null;
    showContentModal = true;
  }

  function openEditContent(content: CourseContent) {
    editingContent = content;
    showContentModal = true;
  }

  function closeContentModal() {
    showContentModal = false;
    editingContent = null;
  }

  function handleContentSuccess() {
    closeContentModal();
    loadCourse();
  }

  function handleChangeSuccess() {
    showChangeModal = false;
    loadCourse();
  }

  function handleCoverSuccess() {
    showCoverModal = false;
    loadCourse();
  }
</script>

<div class="space-y-6">
  <a
    href="/"
    data-testid="back-btn"
    class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
  >
    <ArrowLeft size={16} />
    Kembali
  </a>

  {#if !course && loading}
    <div class="flex flex-col items-center justify-center py-24">
      <h1 class="sr-only">Detail Kursus</h1>
      <LoaderCircle size={36} class="text-indigo-600 animate-spin mb-2" />
      <p class="text-sm font-medium text-slate-600">Memuat detail kursus...</p>
    </div>
  {:else if !course}
    <div class="py-16 text-center text-slate-600">
      <h1 class="sr-only">Detail Kursus</h1>
      <BookOpen size={40} class="mx-auto text-slate-300 mb-2" />
      <p class="font-medium">Kursus tidak ditemukan.</p>
    </div>
  {:else}
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {#if hasCover(course.cover)}
        <img
          src={String(course.cover)}
          alt=""
          decoding="async"
          fetchpriority="high"
          data-testid="detail-cover"
          class="w-full h-48 sm:h-64 object-cover"
        />
      {:else}
        <div
          data-testid="detail-cover-fallback"
          class="w-full h-48 sm:h-64 bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center"
        >
          <GraduationCap size={56} class="text-white/80" />
        </div>
      {/if}

      <div class="p-6 sm:p-8 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <span class="inline-flex items-center gap-1 text-amber-700">
                <Star size={14} />
                <span data-testid="detail-rating">{course.avg_ratings ?? "-"}</span>
              </span>
              <span class="inline-flex items-center gap-1 text-slate-600">
                <Video size={14} />
                <span data-testid="detail-total-contents">{course.total_contents ?? contents.length}</span>
                materi
              </span>
              <span class="inline-flex items-center gap-1 text-slate-600">
                <Users size={14} />
                <span data-testid="detail-total-students">{students.length}</span>
                peserta
              </span>
              {#if isOwner}
                <span
                  data-testid="detail-owner-badge"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700"
                >
                  Milik Saya
                </span>
              {:else if isStudent}
                <span
                  data-testid="detail-student-badge"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700"
                >
                  Diikuti
                </span>
              {/if}
            </div>
            <h1 data-testid="detail-title" class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {course.title}
            </h1>
            <p data-testid="detail-author" class="text-sm text-slate-600">
              Oleh <span>{course.author?.name ?? "Tanpa penulis"}</span>
            </p>
            <p
              data-testid="detail-progress"
              class="text-sm font-semibold text-emerald-700"
            >
              <span>{course.my_percentage_finished ?? "0"}</span>% selesai
            </p>
          </div>

          {#if isOwner}
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-testid="change-btn"
                onclick={() => (showChangeModal = true)}
                class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <Pencil size={16} />
                Ubah Data
              </button>
              <button
                type="button"
                data-testid="change-cover-btn"
                onclick={() => (showCoverModal = true)}
                class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <ImagePlus size={16} />
                Ubah Sampul
              </button>
              <button
                type="button"
                data-testid="delete-course-btn"
                onclick={handleDeleteCourse}
                class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-red-700 border border-red-200 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 size={16} />
                Hapus
              </button>
            </div>
          {:else if isStudent}
            <button
              type="button"
              data-testid="leave-course-btn"
              onclick={handleLeave}
              disabled={loadingAction}
              class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-red-700 border border-red-200 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-60"
            >
              <LogOut size={16} />
              Keluar dari Kursus
            </button>
          {:else}
            <button
              type="button"
              data-testid="join-course-btn"
              onclick={handleJoin}
              disabled={loadingAction}
              class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
            >
              <UserPlus size={16} />
              Ikuti Kursus
            </button>
          {/if}
        </div>

        <p data-testid="detail-description" class="text-sm text-slate-600 leading-relaxed">
          {course.description || "-"}
        </p>
      </div>
    </div>

    {#if isStudent && !isOwner}
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-4">
        <h2 class="text-lg font-bold text-slate-900">Beri Rating</h2>
        <form onsubmit={handleRating} class="space-y-4" data-testid="rating-form">
          <div class="flex flex-col sm:flex-row gap-3">
            <select
              data-testid="rating-select"
              bind:value={rating}
              class="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            >
              <option value={5}>5 - Sangat Baik</option>
              <option value={4}>4 - Baik</option>
              <option value={3}>3 - Cukup</option>
              <option value={2}>2 - Kurang</option>
              <option value={1}>1 - Buruk</option>
            </select>
            <input
              type="text"
              data-testid="rating-comment"
              bind:value={comment}
              placeholder="Tulis komentar Anda..."
              class="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <button
            type="submit"
            data-testid="rating-submit"
            disabled={loadingAction}
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-60"
          >
            <Star size={16} />
            Simpan Rating
          </button>
        </form>

        {#if ratings.length === 0}
          <p data-testid="ratings-empty" class="text-sm text-slate-600">Belum ada rating.</p>
        {:else}
          <ul class="space-y-2">
            {#each ratings as item, index (index)}
              <li data-testid={`rating-item-${index}`} class="p-3 rounded-xl bg-slate-50 text-sm">
                <span class="font-semibold text-slate-800">{item.name}</span>
                <span class="text-amber-700 font-semibold">
                  · <span>{item.ratings ?? "-"}</span>/5
                </span>
                <span class="text-slate-600">
                  · <span>{item.comment || "-"}</span>
                </span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}

    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-4">
      <div class="flex items-center justify-between gap-4">
        <h2 class="text-lg font-bold text-slate-900">Daftar Materi</h2>
        {#if isOwner}
          <button
            type="button"
            data-testid="add-content-btn"
            onclick={openAddContent}
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all"
          >
            <Plus size={16} />
            Tambah Materi
          </button>
        {/if}
      </div>

      {#if contents.length === 0}
        <p data-testid="contents-empty" class="py-8 text-center text-sm text-slate-600">
          Belum ada materi pada kursus ini.
        </p>
      {:else}
        <ul class="space-y-3">
          {#each contents as content (content.id)}
            <li
              data-testid={`content-${content.id}`}
              class="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition-colors"
            >
              <a
                href={`/courses/${course.id}/contents/${content.id}`}
                data-testid={`content-open-${content.id}`}
                class="flex-1 min-w-0 flex items-center gap-3"
              >
                <span class="shrink-0 p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Video size={16} />
                </span>
                <span class="min-w-0">
                  <span class="block text-sm font-semibold text-slate-900 truncate">{content.title}</span>
                  <span class="block text-xs text-slate-600 truncate">{content.youtube}</span>
                </span>
              </a>
              <div class="flex items-center gap-1">
                {#if isStudent && !isOwner}
                  <span
                    data-testid={`content-finished-${content.id}`}
                    class={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      isFinished(content.my_status_finished)
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <CircleCheck size={13} />
                    {isFinished(content.my_status_finished) ? "Selesai" : "Belum"}
                  </span>
                {/if}
                {#if isOwner}
                  <button
                    type="button"
                    data-testid={`content-edit-${content.id}`}
                    aria-label={`Ubah ${content.title}`}
                    onclick={() => openEditContent(content)}
                    class="p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    data-testid={`content-delete-${content.id}`}
                    aria-label={`Hapus ${content.title}`}
                    onclick={() => handleDeleteContent(content)}
                    class="p-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-4">
      <h2 class="text-lg font-bold text-slate-900">Peserta</h2>
      {#if students.length === 0}
        <p data-testid="students-empty" class="py-6 text-center text-sm text-slate-600">
          Belum ada peserta pada kursus ini.
        </p>
      {:else}
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {#each students as student, index (index)}
            <li
              data-testid={`participant-${index}`}
              class="flex items-center gap-2 p-3 rounded-xl bg-slate-50 text-sm font-medium text-slate-700"
            >
              <Users size={16} class="text-slate-500" />
              <span>{participantName(student)}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>

{#if course && showChangeModal}
  <ChangeModal course={course} onClose={() => (showChangeModal = false)} onSuccess={handleChangeSuccess} />
{/if}

{#if course && showCoverModal}
  <ChangeCoverModal courseId={course.id} onClose={() => (showCoverModal = false)} onSuccess={handleCoverSuccess} />
{/if}

{#if course && showContentModal}
  <ContentModal
    courseId={course.id}
    content={editingContent}
    onClose={closeContentModal}
    onSuccess={handleContentSuccess}
  />
{/if}
