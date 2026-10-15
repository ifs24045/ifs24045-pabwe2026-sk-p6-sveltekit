<script lang="ts">
  import AuthLayout from "../../features/auth/layouts/AuthLayout.svelte";

  let { children } = $props();
</script>

<AuthLayout>
  {@render children()}
</AuthLayout>