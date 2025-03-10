<script lang="ts">
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Tooltip,
  } from "flowbite-svelte";

  import { Button, Avatar, Heading, Toolbar, Badge } from "flowbite-svelte";
  import {
    PlusOutline,
    EditOutline,
    TrashBinOutline,
  } from "flowbite-svelte-icons";
  import {
    getUserState,
    type Folder,
    type Media,
  } from "$lib/state/user-state.svelte";
  import { Modal } from "$components";
  let userContext = getUserState();
  let openModal = $state(false);
  let modalHeading = $state<string>("");
  let currentForm = $state<
    "manage-media" | "manage-folder" | "delete-confirmation"
  >("manage-media");
  let itemToEdit = $state<Folder | Media>();
  let { media, folders, user } = $derived(userContext);

  const folderPath = (parentFolderId: number) =>
    folders?.find((folder) => folder.id == parentFolderId)?.folder_path;
</script>

<main class="relative h-full w-full overflow-y-aut dark:bg-gray-800 p-4">
  <div class="p-4">
    <Heading
      tag="h1"
      class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl"
    >
      All Media
    </Heading>
    <Toolbar embedded class="w-full py-4 text-gray-500  dark:text-gray-400">
      <div slot="end" class="flex items-center space-x-2">
        <Button
          size="sm"
          class="gap-2 whitespace-nowrap px-3"
          on:click={() => {
            openModal = true;
            modalHeading = "Add Media";
            currentForm = "manage-media";
            itemToEdit = undefined;
          }}
        >
          <PlusOutline size="sm" />Add Media
        </Button>
      </div>
    </Toolbar>
  </div>
  <Table shadow hoverable={true}>
    <TableHead>
      <TableHeadCell></TableHeadCell>
      <TableHeadCell>Name</TableHeadCell>
      <TableHeadCell>Media Type</TableHeadCell>
      <TableHeadCell>Folder Path</TableHeadCell>
      <TableHeadCell>Description</TableHeadCell>
      <TableHeadCell>
        <span class="sr-only">Edit</span>
      </TableHeadCell>
    </TableHead>
    {#if media}
      <TableBody tableBodyClass="divide-y">
        {#each media.sort( (a, z) => a.display_name.localeCompare(z.display_name), ) as item (item)}
          <TableBodyRow>
            <TableBodyCell>
              {#if item.thumbnail}
                <Avatar src={item.thumbnail} />
              {/if}
            </TableBodyCell>
            <TableBodyCell>{item.display_name}</TableBodyCell>
            <TableBodyCell>Image</TableBodyCell>
            <TableBodyCell>{folderPath(item.folder_id)}</TableBodyCell>
            <TableBodyCell>{item.description}</TableBodyCell>
            <TableBodyCell>
              <button
                onclick={() => {
                  openModal = true;
                  modalHeading = "Edit Media";
                  currentForm = "manage-media";
                  itemToEdit = item;
                }}
                class="font-medium mr-2 text-primary-600 hover:underline dark:text-primary-500"
                ><EditOutline /></button
              >

              <button
                id={`delete_${item.id}`}
                title="Delete"
                onclick={() => {
                  openModal = true;
                  modalHeading = "Delete Media";
                  currentForm = "delete-confirmation";
                  itemToEdit = item;
                }}
                class="font-medium text-primary-600 hover:underline dark:text-primary-500"
                ><TrashBinOutline /></button
              >
              <Tooltip triggeredBy={`delete_${item.id}`}>Delete</Tooltip>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    {/if}
  </Table>
</main>

<main class="relative h-full w-full overflow-y-aut dark:bg-gray-800 p-4">
  <div class="p-4">
    <Heading
      tag="h1"
      class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl"
    >
      All Folders
    </Heading>
    <Toolbar embedded class="w-full py-4 text-gray-500  dark:text-gray-400">
      <div slot="end" class="flex items-center space-x-2">
        <Button
          size="sm"
          class="gap-2 whitespace-nowrap px-3"
          on:click={() => {
            openModal = true;
            modalHeading = "Add Folder";
            currentForm = "manage-folder";
            itemToEdit = undefined;
          }}
        >
          <PlusOutline size="sm" />Add Folder
        </Button>
      </div>
    </Toolbar>
  </div>
  <Table shadow hoverable={true}>
    <TableHead>
      <TableHeadCell>Folder Name</TableHeadCell>
      <TableHeadCell>Parent Folder</TableHeadCell>
      <TableHeadCell>Media Type</TableHeadCell>
      <TableHeadCell>Tags</TableHeadCell>
      <TableHeadCell>
        <span class="sr-only">Edit</span>
      </TableHeadCell>
    </TableHead>
    {#if folders}
      <TableBody tableBodyClass="divide-y">
        {#each folders.sort( (a, z) => a.folder_name.localeCompare(z.folder_name), ) as item (item)}
          <TableBodyRow>
            <TableBodyCell>{item.folder_name}</TableBodyCell>
            <TableBodyCell>{item.parent_folder_name}</TableBodyCell>
            <TableBodyCell>{item.media_type_name}</TableBodyCell>
            <TableBodyCell>
              {#if item.tag_names}
                {#each item.tag_names.split(",") as tagName (tagName)}
                  <Badge class="mr-2" color="dark">{tagName}</Badge>
                {/each}
              {/if}
            </TableBodyCell>
            <TableBodyCell>
              <button
                onclick={() => {
                  openModal = true;
                  itemToEdit = item;
                  modalHeading = "Edit Folder";
                  currentForm = "manage-folder";
                }}
                class="font-medium mr-2 text-primary-600 hover:underline dark:text-primary-500"
                ><EditOutline /></button
              >

              <button
                id={`delete_${item.id}`}
                title="Delete"
                onclick={() => {
                  openModal = true;
                  modalHeading = "Delete Folder";
                  currentForm = "delete-confirmation";
                  itemToEdit = item;
                }}
                class="font-medium text-primary-600 hover:underline dark:text-primary-500"
                ><TrashBinOutline /></button
              >
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    {/if}
  </Table>
</main>

<Modal bind:open={openModal} item={itemToEdit} {currentForm} {modalHeading}
></Modal>
