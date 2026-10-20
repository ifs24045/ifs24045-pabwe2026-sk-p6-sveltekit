<script lang="ts">
  import { onMount } from "svelte";
  import {
    BookOpen,
    GraduationCap,
    LoaderCircle,
    Plus,
    Search,
    Star,
    Trash2,
    Video,
  } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { showConfirmDialog } from "../../../helpers/toolsHelper";
  import { hasCover } from "../helpers/courseHelper";
  import type { Course } from "../api/courseApi";
  import AddModal from "../modals/AddModal.svelte";

  let search = $state("");
  let filterMine = $state(false);
  let loading = $state(false);
  let showAddModal = $state(false);

  const courses = $derived($coursesStore.courses);
  const myId = $derived($usersStore.profile?.id ?? null);

  const filteredCourses = $derived.by(() => {
    const query = search.trim().toLowerCase();
    if (!query) return courses;

    return courses.filter((course) => {
      const titleMatch = course.title
        ? course.title.toLowerCase().includes(query)
        : false;
      const descriptionMatch = (course.description || "").toLowerCase().includes(query);
      return titleMatch || descriptionMatch;
    });
  });

  const hasOwned = $derived(courses.some((course) => course.user_id === myId));
  const totalContents = $derived(
    courses.reduce((total, course) => total + (course.total_contents || 0), 0)
  );

  function loadCourses() {
    loading = true;
    return Promise.resolve(coursesStore.asyncSetCourses(filterMine)).finally(() => {
      loading = false;
    });
  }

  onMount(() => {
    loadCourses();
  });

  function isOwner(course: Course): boolean {
    return Boolean(myId) && course.user_id === myId;
  }

  async function handleDelete(course: Course) {
    const result = await showConfirmDialog(`Hapus kursus "${course.title}"?`);
    if (result.isConfirmed) {
      await coursesStore.asyncDeleteCourse(course.id);
      coursesStore.setFlag("isDeleteCourse", false);
      await loadCourses();
    }
  }

  async function handleDeleteAll() {
    const result = await showConfirmDialog(
      "Semua kursus milik Anda akan dihapus permanen beserta materi dan pesertanya. Lanjutkan?"
    );
    if (result.isConfirmed) {
      await coursesStore.asyncDeleteAllCourses();
      coursesStore.setFlag("isDeleteAllCourses", false);
      await loadCourses();
    }
  }

  function handleAddSuccess() {
    showAddModal = false;
    loadCourses();
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        Semua Kursus
      </h1>
      <p class="text-sm text-slate-600 mt-1">
        Jelajahi kursus, ikuti kelas baru, atau bagikan materi video Anda.
      </p>
    </div>
    <div class="flex items-center gap-3">
      {#if hasOwned}
        <button
          type="button"
          data-testid="delete-all-btn"
          onclick={handleDeleteAll}
          class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-700 border border-red-200 hover:bg-red-50 rounded-xl transition-colors"
        >
          <Trash2 size={16} />
          Hapus Semua
        </button>
      {/if}
      <button
        type="button"
        data-testid="add-course-btn"
        onclick={() => (showAddModal = true)}
        class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all"
      >
        <Plus size={16} />
        Tambah Kursus
      </button>
    </div>
  </div>

  <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
    <div class="bg-white rounded-2xl border border-slate-200/80 p-4">
      <p class="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Kursus</p>
      <p data-testid="stat-total" class="text-2xl font-extrabold text-slate-900 mt-1">{courses.length}</p>
    </div>
    <div class="bg-white rounded-2xl border border-slate-200/80 p-4">
      <p class="text-xs font-bold text-slate-600 uppercase tracking-wider">Milik Saya</p>
      <p data-testid="stat-owned" class="text-2xl font-extrabold text-indigo-600 mt-1">
        {courses.filter((course) => course.user_id === myId).length}
      </p>
    </div>
    <div class="bg-white rounded-2xl border border-slate-200/80 p-4 col-span-2 lg:col-span-1">
      <p class="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Materi</p>
      <p data-testid="stat-contents" class="text-2xl font-extrabold text-emerald-700 mt-1">{totalContents}</p>
    </div>
  </div>

  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
    <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="relative flex-1 max-w-md">
        <Search size={18} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
        <input
          type="text"
          data-testid="search-course-input"
          bind:value={search}
          placeholder="Cari kursus berdasarkan judul atau deskripsi..."
          class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
        />
      </div>
      <label
        for="filter-mine-checkbox"
        class="inline-flex items-center gap-2 text-sm font-medium text-slate-600"
      >
        <input
          id="filter-mine-checkbox"
          type="checkbox"
          data-testid="filter-mine-checkbox"
          bind:checked={filterMine}
          onchange={loadCourses}
          class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        Milik saya
      </label>
    </div>

    <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {#if loading && filteredCourses.length === 0}
        <div class="col-span-full py-16 text-center text-slate-600">
          <LoaderCircle size={36} class="mx-auto text-indigo-600 animate-spin mb-2" />
          <p class="font-medium text-slate-600">Memuat daftar kursus...</p>
        </div>
      {:else if filteredCourses.length === 0}
        <div class="col-span-full py-12 text-center text-slate-600">
          <BookOpen size={40} class="mx-auto text-slate-300 mb-2" />
          <p class="font-medium">Tidak ada kursus ditemukan.</p>
        </div>
      {:else}
        {#each filteredCourses as course (course.id)}
          <article
            data-testid={`course-card-${course.id}`}
            class="rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all bg-white overflow-hidden flex flex-col"
          >
            <a
              href={`/courses/${course.id}`}
              data-testid={`course-open-${course.id}`}
              class="text-left flex-1 flex flex-col"
            >
              {#if hasCover(course.cover)}
                <img
                  src={String(course.cover)}
                  alt=""
                  data-testid={`course-cover-${course.id}`}
                  class="w-full h-32 object-cover"
                />
              {:else}
                <div
                  data-testid={`course-cover-fallback-${course.id}`}
                  class="w-full h-32 bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center"
                >
                  <GraduationCap size={36} class="text-white/80" />
                </div>
              {/if}
              <div class="p-5 space-y-2 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  {#if isOwner(course)}
                    <span
                      data-testid={`course-owned-${course.id}`}
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700"
                    >
                      Milik Saya
                    </span>
                  {/if}
                  <span class="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                    <Star size={13} />
                    <span>{course.avg_ratings ?? "-"}</span>
                  </span>
                </div>
                <h2 class="text-base font-bold text-slate-900 line-clamp-1">{course.title}</h2>
                <p class="text-sm text-slate-600 line-clamp-2">{course.description || "-"}</p>
              </div>
            </a>
            <div class="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span data-testid={`course-meta-${course.id}`} class="flex items-center gap-3">
                <span class="inline-flex items-center gap-1">
                  <Video size={14} />
                  <span>{course.total_contents || 0}</span> materi
                </span>
                <span class="inline-flex items-center gap-1">
                  <BookOpen size={14} />
                  <span>{course.author?.name ?? "Tanpa penulis"}</span>
                </span>
              </span>
              {#if isOwner(course)}
                <button
                  type="button"
                  data-testid={`course-delete-${course.id}`}
                  aria-label={`Hapus ${course.title}`}
                  onclick={() => handleDelete(course)}
                  class="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              {/if}
            </div>
          </article>
        {/each}
      {/if}
    </div>
  </div>
</div>

{#if showAddModal}
  <AddModal onClose={() => (showAddModal = false)} onSuccess={handleAddSuccess} />
{/if}
