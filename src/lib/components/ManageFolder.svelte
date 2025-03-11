<script lang="ts">
  import { Badge, Button, Helper, Input, Label, Select } from "flowbite-svelte";
  import { createForm } from "svelte-forms-lib";
  import { getUserState } from "$lib/state/user-state.svelte";

  let userContext = getUserState();
  const { mediaTypes, folders } = $derived(userContext);
  let inputValue = $state<String>("");
  let { closeModal, itemToEdit } = $props();
  let isEditMode = $derived(!!itemToEdit);

  type FormData = {
    folderName: string;
    mediaTypeId: number | null;
    parentFolderId: number | null;
    tagNames: string[];
  };

  function handleBlur(field: keyof FormData) {
    validateField(field);
  }

  const parseTagNames = (tagString: string): string[] => {
    if (!tagString) return [];
    return tagString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");
  };

  const getInitialValues = (): FormData => {
    if (isEditMode && itemToEdit) {
      return {
        folderName: itemToEdit.folder_name,
        mediaTypeId: itemToEdit.media_type_id,
        parentFolderId: itemToEdit.parent_folder_id,
        tagNames: parseTagNames(itemToEdit.tag_names || ""),
      };
    }
    return {
      folderName: "",
      mediaTypeId: null,
      parentFolderId: null,
      tagNames: [],
    };
  };

  const { validateField, form, errors, handleSubmit } = createForm<FormData>({
    initialValues: getInitialValues(),
    validate: (values) => {
      const errors: Partial<Record<keyof FormData, string>> = {};
      if (!values.folderName) {
        errors.folderName = "Folder name is required";
      }

      if (!values.mediaTypeId) {
        errors.mediaTypeId = "Media type is required";
      }

      if (!values.parentFolderId) {
        errors.parentFolderId = "Parent folder is required";
      }
      return errors;
    },
    onSubmit: async (values) => {
      const folderObject = {
        folder_name: values.folderName,
        parent_folder_id: values.parentFolderId,
        tag_names: values.tagNames.join(","),
        media_type_id: values.mediaTypeId!,
      };

      const response = isEditMode
        ? await userContext.updateFolder(itemToEdit.id, folderObject)
        : await userContext.insertNewFolder(folderObject);
      if ((response && response?.status === 201) || response?.status === 204) {
        closeModal();
      } else if (response && response.status === 409) {
        console.log(response.error);
      }
    },
  });

  const mediaTypeOptions = $derived.by(() => {
    let mediaTypeOptions: { value: number; name: string }[] = [];
    if (mediaTypes) {
      mediaTypes.forEach((type) => {
        mediaTypeOptions.push({ value: type.id, name: type.name });
      });
    }
    return mediaTypeOptions;
  });

  const folderOptions = $derived.by(() => {
    let folderOptions: { value: number; name: string }[] = [];
    if (folders) {
      const mediaFolder = folders?.find((folder) => folder.id === 1);
      if (mediaFolder) {
        folderOptions.push({
          value: mediaFolder.id,
          name: mediaFolder.folder_path ? mediaFolder.folder_path : "",
        });
      }
      folders.filter((folder) => {
        folder.id !== 1 &&
          folder.parent_folder_id !== $form.parentFolderId &&
          folder.media_type_id === $form.mediaTypeId &&
          folderOptions.push({
            value: folder.id,
            name: folder.folder_path ? folder.folder_path : "",
          });
      });
    }
    return folderOptions;
  });

  function handleSelectOptionChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = parseInt(select.value);
    const fieldName = select.name as keyof FormData;

    if (select.name === "parentFolderId") {
      $form.parentFolderId = value === 0 ? null : value;
    } else if (fieldName === "mediaTypeId") {
      $form.mediaTypeId = value === 0 ? null : value;
    }

    validateField(fieldName);
  }

  const removeTag = (index: number) => {
    $form.tagNames = $form.tagNames.filter((_, i) => i !== index);
  };

  const handleAddTag = (e: KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!$form.tagNames.includes(inputValue.trim())) {
        $form.tagNames = [...$form.tagNames, inputValue.trim()];
      }
      inputValue = "";
    }
  };
</script>

<form onsubmit={handleSubmit}>
  <div class="grid grid-cols-6 gap-6 mb-5">
    <Label class="col-span-6 space-y-2">
      <span>Folder name</span>
      <Input
        id="folderName"
        name="folderName"
        class="border outline-none"
        bind:value={$form.folderName}
        on:blur={() => handleBlur("folderName")}
        color={$errors.folderName ? "red" : "base"}
      />
      {#if $errors.folderName}
        <Helper class="mt-2" color="red">
          <span class="font-medium">{$errors.folderName}</span>
        </Helper>
      {/if}
    </Label>

    <Label class="col-span-6 space-y-2">
      <span>Select media type</span>
      <Select
        id="mediaTypeId"
        name="mediaTypeId"
        items={mediaTypeOptions}
        class={$errors.mediaTypeId ? "select-error" : "font-normal"}
        value={$form.mediaTypeId ?? 0}
        on:blur={() => handleBlur("mediaTypeId")}
        on:change={handleSelectOptionChange}
        color={$errors.mediaTypeId ? "red" : "base"}
      ></Select>
      {#if $errors.mediaTypeId}
        <Helper class="mt-2" color="red">
          <span class="font-medium">{$errors.mediaTypeId}</span>
        </Helper>
      {/if}
    </Label>

    <Label class="col-span-6 space-y-2">
      <span>Select parent folder</span>
      <Select
        id="parentFolderId"
        name="parentFolderId"
        items={folderOptions}
        class="font-normal"
        on:blur={() => handleBlur("parentFolderId")}
        bind:value={$form.parentFolderId}
      ></Select>
      {#if $errors.parentFolderId}
        <Helper class="mt-2" color="red">
          <span class="font-medium">{$errors.parentFolderId}</span>
        </Helper>
      {/if}
    </Label>

    <Label class="col-span-6 space-y-2">
      <span>Tag names</span>
      <Input
        name="tagNames"
        id="tagNames"
        class="border outline-none"
        placeholder="Add a tag and press Enter"
        bind:value={inputValue}
        onkeydown={handleAddTag}
        onblur={() => handleBlur("tagNames")}
      />
      <Helper class="mt-2">
        {#each $form.tagNames as tag, index (tag)}
          <Badge
            dismissable
            color="dark"
            class="mr-1"
            on:close={() => {
              removeTag(index);
            }}>{tag}</Badge
          >
        {/each}
      </Helper>
    </Label>
  </div>
  <Button type="submit">{isEditMode ? "Update" : "Save"} Media</Button>
</form>
