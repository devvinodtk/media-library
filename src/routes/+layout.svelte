<script lang="ts">
  import { invalidate } from "$app/navigation";
  import { Navbar, Sidebar } from "$components";
  import { setUserState } from "$lib/state/user-state.svelte";
  import "../app.css";

  let { data, children } = $props();
  let { session, supabase } = $derived(data);
  let drawerHidden = $state(true);
  let userState = setUserState({
    session: data.session,
    supabase: data.supabase,
    user: data.user
  });

  $effect(() => {
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      userState.updateState({
        session: newSession,
        supabase,
        user: newSession?.user || null
      });
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate("supabase:auth");
      }
    });

    return () => data.subscription.unsubscribe();
  });

  const isAuthenticated = $derived.by(() => {
    return !!session && !!session.user;
  });
</script>

<header
  class="fixed top-0 z-40 mx-auto w-full flex-none border-b border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800"
>
  <Navbar bind:drawerHidden />
</header>
<div class="overflow-hidden lg:flex">
  {#if isAuthenticated}
    <Sidebar bind:drawerHidden />
  {/if}
  <div
    class={`relative h-full w-full overflow-y-auto ${isAuthenticated ? "lg:ml-64" : ""}  pt-[70px]`}
  >
    {@render children()}
  </div>
</div>
