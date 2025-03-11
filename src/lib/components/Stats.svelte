<script lang="ts">
  import { Change, More } from "$components";
  import { Badge, Card, Heading, TabItem, Tabs } from "flowbite-svelte";
  import {
    getUserState,
    type Folder,
    type Media,
  } from "$lib/state/user-state.svelte";
  import {
    getFormattedDate,
    getFormattedTime,
  } from "$lib/utils/utility-functions";
  let userContext = getUserState();
  let { media, folders, user } = $derived(userContext);

  let topMedia = $derived.by(() =>
    media
      ?.filter((file) => file.created_at)
      .sort(
        (a, z) =>
          new Date(z.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 5),
  );

  const tagNamesForMedia = (folderId: number) =>
    folders?.find((folder) => folder.parent_folder_id === folderId)?.tag_names;
</script>

<Card size="xl" class="mx-2">
  <div class="mb-4 items-center justify-between sm:flex">
    <div class="mb-4 w-full sm:mb-0">
      <span
        class="text-2xl font-bold leading-none text-gray-900 dark:text-white sm:text-3xl"
        >Top 5 Items</span
      >
      <h3 class="text-base font-thin text-gray-500 dark:text-gray-400">
        Showing items sorted by created date
      </h3>
    </div>
  </div>
  <Tabs
    style="full"
    defaultClass="flex divide-x rtl:divide-x-reverse divide-gray-200 shadow dark:divide-gray-700"
    contentClass="p-3 mt-4"
  >
    <TabItem class="w-full" open>
      <span slot="title">Top Media</span>
      {#if topMedia}
        <ul
          class="-m-3 divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-800"
        >
          {#each topMedia as file}
            <li class="py-3 sm:py-4">
              <div class="flex items-center justify-between">
                <div class="flex min-w-0 items-center">
                  <img
                    src={file.thumbnail}
                    alt={file.display_name}
                    class="h-10 w-10 flex-shrink-0"
                  />
                  <div class="ml-3">
                    <p
                      class="truncate font-medium text-gray-900 dark:text-white"
                    >
                      {file.display_name}
                    </p>
                    {#if file.folder_id && tagNamesForMedia(file.folder_id)}
                      {#each tagNamesForMedia(file.folder_id)?.split(",") ?? [] as tagName (tagName)}
                        <Badge class="mr-2" color="dark">{tagName}</Badge>
                      {/each}
                    {/if}
                  </div>
                </div>
                <div
                  class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white"
                >
                  {getFormattedDate(file.created_at)}
                  {getFormattedTime(file.created_at)}
                </div>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </TabItem>
    <TabItem class="w-full">
      <span slot="title">Top Folders</span>
      <ul
        class="-m-3 divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800"
      >
        <li class="py-3 sm:py-3.5">
          <div class="flex items-center justify-between">
            <div class="flex min-w-0 items-center">
              <!-- <Avatar src={imagesPath(avatar, 'users')} /> -->
              <div class="ml-3">
                <p class="truncate font-medium text-gray-900 dark:text-white">
                  <!-- {name} -->
                </p>
                <!-- <span class="text-gray-500">{email}</span> -->
              </div>
            </div>
          </div>
        </li>
      </ul>
    </TabItem>
  </Tabs>
  <div
    class="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700 sm:pt-6"
  >
    <More title="Full Report" href="/private/media" />
  </div>
</Card>
