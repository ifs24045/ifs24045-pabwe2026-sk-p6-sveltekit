<script lang="ts">
  import { SearchX } from "lucide-svelte";
</script>

<div class="max-w-md mx-auto text-center py-16" data-testid="not-found-page">
  <div class="inline-flex w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 items-center justify-center mb-4">
    <SearchX size={32} />
  </div>
  <h1 class="text-2xl font-extrabold text-slate-900">Halaman Tidak Ditemukan</h1>
  <p class="mt-2 text-sm text-slate-600">
    Halaman yang Anda cari tidak ada atau sudah dipindahkan.
  </p>
  <a href="/" class="inline-block mt-6 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl">
    Kembali ke Beranda
  </a>
</div>