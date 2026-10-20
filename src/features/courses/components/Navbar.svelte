<script lang="ts">
  import { GraduationCap, LogOut, Menu } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { authStore } from "../../auth/states/authStore";
  import { usersStore } from "../../users/states/usersStore";

  let { onToggleSidebar }: { onToggleSidebar: () => void } = $props();

  const profile = $derived($usersStore.profile);

  async function onLogout() {
    await authStore.asyncSetIsAuthLogout();
    authStore.setIsAuthLogout(false);
    usersStore.reset();
    goto("/auth/login");
  }
</script>

<header class="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
  <div class="flex items-center gap-3">
    <button
      type="button"
      data-testid="navbar-toggle"
      aria-label="Buka menu"
      class="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
      onclick={onToggleSidebar}
    >
      <Menu size={20} />
    </button>
    <a href="/" class="flex items-center gap-2.5">
      <span class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
        <GraduationCap size={20} strokeWidth={2.5} />
      </span>
      <span class="font-extrabold text-slate-900 tracking-tight">Delcom Courses</span>
    </a>
  </div>

  <div class="flex items-center gap-3">
    {#if profile}
      <a href="/profile" data-testid="navbar-profile" class="flex items-center gap-2.5">
        {#if profile.photo}
                    <img src={profile.photo} alt="" width="36" height="36" class="w-9 h-9 rounded-full object-cover border border-slate-200" />
        {:else}
          <span class="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center" aria-hidden="true">
            {profile.name.charAt(0).toUpperCase()}
          </span>
        {/if}
        <span class="sr-only sm:not-sr-only text-sm font-semibold text-slate-700">{profile.name}</span>
      </a>
    {/if}
    <button
      type="button"
      data-testid="navbar-logout"
      aria-label="Keluar"
      class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
      onclick={onLogout}
    >
      <LogOut size={16} />
      <span class="hidden sm:inline" aria-hidden="true">Keluar</span>
    </button>
  </div>
</header>