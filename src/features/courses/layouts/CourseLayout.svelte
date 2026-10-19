<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";
  import { LoaderCircle } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import apiHelper from "../../../helpers/apiHelper";
  import { usersStore } from "../../users/states/usersStore";
  import Navbar from "../components/Navbar.svelte";
  import Sidebar from "../components/Sidebar.svelte";

  let { children }: { children: Snippet } = $props();

  let sidebarOpen = $state(false);

  // Halaman hanya ditampilkan setelah profil pengguna siap.
  // Tanpa token, atau bila profil gagal dimuat, pengguna dikembalikan ke login.
  onMount(() => {
    if (!apiHelper.getAccessToken()) {
      goto("/auth/login");
      return;
    }

    const unsubscribe = usersStore.subscribe((state) => {
      if (state.isProfile && !state.profile) {
        apiHelper.putAccessToken("");
        goto("/auth/login");
      }
    });

    usersStore.asyncSetProfile();

    return unsubscribe;
  });
</script>

{#if $usersStore.profile}
  <div class="min-h-screen bg-slate-50">
    <Navbar onToggleSidebar={() => (sidebarOpen = !sidebarOpen)} />
    <div class="md:flex">
      <Sidebar open={sidebarOpen} onNavigate={() => (sidebarOpen = false)} />
      <main class="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        {@render children()}
      </main>
    </div>
  </div>
{:else}
  <div class="min-h-screen flex items-center justify-center text-slate-500" data-testid="layout-loading">
    <LoaderCircle size={28} class="animate-spin" />
  </div>
{/if}