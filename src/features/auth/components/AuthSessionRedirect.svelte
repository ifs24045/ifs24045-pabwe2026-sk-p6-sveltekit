<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import apiHelper from "../../../helpers/apiHelper";
  import { usersStore } from "../../users/states/usersStore";

  // Satu-satunya pemilik bendera isProfile di rute /auth.
  // Pengalihan hanya terjadi bila token, status login, dan profil sudah siap,
  // lalu bendera direset pada langkah yang sama (tanpa $effect yang berlomba).
  onMount(() => {
    const unsubscribe = usersStore.subscribe((state) => {
      if (!state.isProfile) return;

      usersStore.setIsProfile(false);
      if (state.profile && apiHelper.getAccessToken()) {
        goto("/");
      }
    });

    if (apiHelper.getAccessToken()) {
      usersStore.asyncSetProfile();
    }

    return unsubscribe;
  });
</script>