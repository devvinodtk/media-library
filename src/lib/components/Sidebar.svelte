<script lang="ts">
  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper
  } from "flowbite-svelte";
  import {
    FileCloneOutline,
    FolderDuplicateOutline,
    RectangleListOutline
  } from "flowbite-svelte-icons";

  let { drawerHidden = $bindable() } = $props();

  const closeDrawer = () => {
    drawerHidden = true;
  };

  let posts = [
    { name: "Media", icon: FileCloneOutline, href: "/media" },
    {
      name: "Folders",
      icon: FolderDuplicateOutline,
      href: "/folders"
    },
    { name: "Reports", icon: RectangleListOutline, href: "/reports" }
  ];
  let iconClass =
    "flex-shrink-0 w-6 h-6 mx-3 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white";
  let itemClass =
    "flex items-center p-2 text-base text-gray-900 transition duration-75 rounded-lg hover:bg-[#f0f4e1] group dark:text-gray-200 dark:hover:bg-[#f0f4e1]";
  let groupClass = "pt-2 space-y-2";
</script>

<Sidebar
  class={drawerHidden ? "hidden" : ""}
  activeClass="bg-gray-100 dark:bg-gray-700"
  asideClass="fixed inset-0 z-30 flex-none h-full w-64 lg:h-auto border-e border-gray-200 dark:border-gray-600 lg:overflow-y-visible lg:pt-16 lg:block"
>
  <h4 class="sr-only">Main menu</h4>
  <SidebarWrapper
    divClass="overflow-y-auto px-3 pt-20 lg:pt-5 h-full bg-white scrolling-touch max-w-2xs lg:h-[calc(100vh-4rem)] lg:block dark:bg-gray-800 lg:me-0 lg:sticky top-2"
  >
    <nav class="divide-y divide-gray-200 dark:divide-gray-700">
      <SidebarGroup ulClass={groupClass} class="mb-3">
        {#each posts as { name, icon: Icon, href } (name)}
          <SidebarItem
            label={name}
            {href}
            spanClass="m-2 font-thin"
            class={itemClass}
            on:click={closeDrawer}
          >
            <Icon slot="icon" class={iconClass} />
          </SidebarItem>
        {/each}
      </SidebarGroup>
    </nav>
  </SidebarWrapper>
</Sidebar>

<div
  hidden={drawerHidden}
  class="fixed inset-0 z-20 bg-gray-900/50 dark:bg-gray-900/60"
  onclick={closeDrawer}
  onkeydown={closeDrawer}
  role="presentation"
></div>
