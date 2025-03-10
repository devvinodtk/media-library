<script lang="ts">
  import {
    Avatar,
    Button,
    Dropdown,
    DropdownHeader,
    DropdownItem,
    Navbar,
    NavBrand,
    NavHamburger,
  } from "flowbite-svelte";
  import mediaLibraryLogo from "$assets/app-logo.svg";
  import { getUserState } from "$lib/state/user-state.svelte";
  import { goto } from "$app/navigation";
  let userContext = getUserState();
  let { user, userName } = $derived(userContext);
  let { drawerHidden = $bindable() } = $props();
  let fluid = $state(false);
</script>

<Navbar {fluid} class="w-full text-black" color="default">
  <NavHamburger
    onClick={() => (drawerHidden = !drawerHidden)}
    class="m-0 me-3 md:block lg:hidden"
  />
  <NavBrand>
    <img
      src={mediaLibraryLogo}
      class="me-2.5 h-6 sm:h-8"
      alt="Media library Logo"
    />
    <span
      class="ml-px self-center whitespace-nowrap text-xl font-semibold dark:text-white sm:text-2xl"
    >
      Media Library
    </span>
  </NavBrand>
  <div class="hidden lg:block lg:ps-3"></div>
  <div
    class="ms-auto flex items-center text-gray-500 dark:text-gray-400 sm:order-2"
  >
    {#if !user}
      <ul>
        <li>
          <button
            class="ms-3 rounded-full ring-gray-400 focus:ring-4 dark:ring-gray-600"
          >
            <Avatar size="sm" src="" tabindex={0} />
          </button>
          <Dropdown placement="bottom-end">
            <DropdownHeader>
              <span class="block text-sm">Hello Guest</span>
              <span class="block truncate text-sm font-medium"
                >Welcome to Media Library app</span
              >
            </DropdownHeader>
            <DropdownItem on:click={() => goto("/login")}>Login</DropdownItem>
            <DropdownItem on:click={() => goto("/register")}
              >Register</DropdownItem
            >
          </Dropdown>
        </li>
      </ul>
    {:else}
      <ul>
        <li>
          <button
            class="ms-3 rounded-full ring-gray-400 focus:ring-4 dark:ring-gray-600"
          >
            <Avatar size="sm" src="" tabindex={0} />
          </button>
          <Dropdown placement="bottom-end">
            <DropdownHeader>
              <span class="block text-sm">Hello {userName}</span>
              <span class="block truncate text-sm font-medium"
                >{user.email}</span
              >
            </DropdownHeader>
            <DropdownItem on:click={() => userContext.logout()}
              >Sign out</DropdownItem
            >
          </Dropdown>
        </li>
      </ul>
    {/if}
  </div>
</Navbar>
