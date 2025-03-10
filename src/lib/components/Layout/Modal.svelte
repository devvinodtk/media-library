<script lang="ts">
  import { ManageFolder, ManageMedia } from "$components";
  import type { Folder, Media } from "$lib/state/user-state.svelte";
  import { Modal } from "flowbite-svelte";
  import DeleteConfirmation from "./DeleteConfirmation.svelte";

  let {
    open = $bindable(),
    modalHeading,
    currentForm,
    item,
  }: {
    open: boolean;
    modalHeading: string;
    currentForm: "manage-media" | "manage-folder" | "delete-confirmation";
    item: Folder | Media;
  } = $props();

  const closeModal = () => {
    open = false;
  };
</script>

<Modal bind:open title={modalHeading} size="md" class="m-4">
  {#if currentForm === "manage-media"}
    <ManageMedia itemToEdit={item} {closeModal} />
  {/if}
  {#if currentForm === "manage-folder"}
    <ManageFolder itemToEdit={item} {closeModal} />
  {/if}
  {#if currentForm === "delete-confirmation"}
    <DeleteConfirmation {closeModal} itemToDelete={item} />
  {/if}
</Modal>
