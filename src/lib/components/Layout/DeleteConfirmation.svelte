<script lang="ts">
  import {
    type Folder,
    type Media,
    getUserState,
  } from "$lib/state/user-state.svelte";
  import { Button } from "flowbite-svelte";
  import { ExclamationCircleOutline } from "flowbite-svelte-icons";

  let userContext = getUserState();
  let {
    closeModal,
    itemToDelete,
  }: {
    closeModal: any;
    itemToDelete: Media | Folder;
  } = $props();
  const handleDeleteConfirmation = async () => {
    const response =
      "folder_name" in itemToDelete
        ? await userContext.deleteFolder(itemToDelete.id)
        : await userContext.deleteMedia(itemToDelete.id);

    console.log(response);
    if (response && response.error) {
      console.log("An error occurred during delete", response.error);
    } else if (response && response.status === 204) {
      closeModal();
    }
  };
</script>

<ExclamationCircleOutline class="mx-auto mb-4 h-10 w-10 text-red-600" />

<h3 class="mb-6 text-center text-lg text-gray-500 dark:text-gray-400">
  Are you sure you want to delete the {"display_name" in itemToDelete
    ? `media  '${itemToDelete.display_name}'`
    : `folder  '${itemToDelete.folder_name}'`}
</h3>

<div class="flex items-center justify-center">
  <Button color="red" class="mr-2" on:click={handleDeleteConfirmation}
    >Delete</Button
  >
  <Button color="alternative" on:click={() => closeModal()}>Cancel</Button>
</div>
