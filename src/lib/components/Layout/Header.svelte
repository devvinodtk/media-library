<script lang="ts">
  import mediaLibraryLogo from "$assets/app-logo.svg";
  import Button from "$components/Common/Button.svelte";
  import { getUserState } from "$lib/state/user-state.svelte";
  import {
    Avatar,
    Dropdown,
    DropdownDivider,
    DropdownHeader,
    DropdownItem,
  } from "flowbite-svelte";

  let userContext = getUserState();
  let { user, userName } = $derived(userContext);
</script>

<header>
  <a href="/">
    <img class="logo" src={mediaLibraryLogo} alt="Go to Home" />
  </a>
  <nav>
    {#if !user}
      <ul>
        <li>
          <Button isMenu={true} href="/register">Register</Button>
        </li>
        <li>
          <Button isSecondary={true} isMenu={true} href="/login">Login</Button>
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
              <span class="block text-sm">{userName}</span>
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
  </nav>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 4vw;
  }
  ul {
    display: flex;
    align-items: center;
    column-gap: 24px;
  }

  .logo {
    height: 72px;
  }
</style>
