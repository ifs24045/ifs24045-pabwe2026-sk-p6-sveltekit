<script lang="ts">
  import { BookOpen, Users, UserRound } from "lucide-svelte";
  import { page } from "$app/state";

  let { open = false, onNavigate }: { open?: boolean; onNavigate: () => void } = $props();

  const pathname = $derived(page.url.pathname);

  const links = [
    {
      href: "/",
      label: "Semua Kursus",
      icon: BookOpen,
      isActive: (path: string) => path === "/" || path.startsWith("/courses"),
    },
    {
      href: "/users",
      label: "Pengguna",
      icon: Users,
      isActive: (path: string) => path.startsWith("/users"),
    },
    {
      href: "/profile",
      label: "Profil Saya",
      icon: UserRound,
      isActive: (path: string) => path.startsWith("/profile"),
    },
  ];
</script>

<aside
  data-testid="sidebar"
  class="{open ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0 bg-white border-r border-slate-200 md:min-h-[calc(100vh-4rem)] p-4"
>
  <nav class="space-y-1.5">
    {#each links as link (link.href)}
      <a
        href={link.href}
        data-testid="sidebar-link"
        onclick={onNavigate}
        class={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          link.isActive(pathname)
            ? "bg-indigo-50 text-indigo-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <link.icon size={18} />
        <span>{link.label}</span>
      </a>
    {/each}
  </nav>
</aside>