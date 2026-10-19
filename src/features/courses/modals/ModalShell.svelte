<script lang="ts">
  import type { Snippet } from "svelte";
  import { X } from "lucide-svelte";

  let {
    title,
    onClose,
    children,
  }: { title: string; onClose: () => void; children: Snippet } = $props();
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
  <button
    type="button"
    aria-label="Tutup dialog"
    data-testid="modal-backdrop"
    class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
    onclick={onClose}
  ></button>
  <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6">
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-lg font-extrabold text-slate-900">{title}</h2>
      <button
        type="button"
        data-testid="modal-close"
        aria-label="Tutup"
        class="p-2 rounded-xl text-slate-500 hover:bg-slate-100"
        onclick={onClose}
      >
        <X size={18} />
      </button>
    </div>
    {@render children()}
  </div>
</div>