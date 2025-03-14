<script lang="ts">
  import {
    getUserState,
    type Media,
    type UpdatableMedia
  } from "$lib/state/user-state.svelte";
  import {
    Avatar,
    Button,
    Helper,
    Input,
    Label,
    Select,
    Spinner,
    Textarea
  } from "flowbite-svelte";
  import { createForm } from "svelte-forms-lib";
  import {
    generatePlaceholderThumbnail,
    generateImageThumbnail,
    generatePDFThumbnails,
    generateVideoThumbnail
  } from "$lib/utils/utility-functions";
  import DropZone from "svelte-file-dropzone";
  import { allowedFileTypes } from "$lib/utils/constants";
  import { Loader } from "$components";

  type FormData = {
    mediaName: string;
    description: string;
    mediaTypeId: number | null;
    parentFolderId: number | null;
    thumbnailUrl: string | null;
    fileSize: number | null;
    fileName: string;
  };

  type SelectOption = {
    value: number;
    name: string;
  };

  type ManageMediaProps = {
    itemToEdit: Media;
    closeModal: () => void;
  };

  let userContext = getUserState();
  const { mediaTypes, folders } = $derived(userContext);
  let { closeModal, itemToEdit }: ManageMediaProps = $props();
  let isEditMode = $derived(!!itemToEdit);
  let fileToUpload = $state<File | null>(null);
  let thumbnailToUpload = $state<File | null>(null);
  let errorMessage = $state<string>("");
  let fileTypeError = $state<string>("");
  let isLoading = $state(false);
  let isMediaProcessing = $state(false);

  // Get currently selected media type info
  const getSelectedMediaTypeInfo = (mediaTypeId: number | null) => {
    if (!mediaTypeId) return null;

    const mediaType = mediaTypes
      ?.find((type) => type.id === mediaTypeId)
      ?.name.toLowerCase();
    if (
      !mediaType ||
      !allowedFileTypes[mediaType as keyof typeof allowedFileTypes]
    ) {
      return null;
    }

    return {
      type: mediaType,
      ...allowedFileTypes[mediaType as keyof typeof allowedFileTypes]
    };
  };

  // Get file type description for error messages
  const getFileTypeDescription = (mediaTypeId: number | null): string => {
    const mediaTypeInfo = getSelectedMediaTypeInfo(mediaTypeId);
    return mediaTypeInfo
      ? `${mediaTypeInfo.displayName} (${mediaTypeInfo.extensions})`
      : "files";
  };

  // Check if file is allowed for selected media type
  const isFileTypeAllowed = (
    file: File,
    mediaTypeId: number | null
  ): boolean => {
    const mediaTypeInfo = getSelectedMediaTypeInfo(mediaTypeId);
    if (!mediaTypeInfo) return false;

    return mediaTypeInfo.mimeTypes.includes(file.type);
  };

  const getInitialValues = (): FormData => {
    if (isEditMode && itemToEdit) {
      return {
        mediaName: itemToEdit.display_name,
        description: itemToEdit.description || "",
        mediaTypeId:
          folders?.find((folder) => folder.id === itemToEdit.folder_id)
            ?.media_type_id || null,
        parentFolderId: itemToEdit.folder_id,
        thumbnailUrl: itemToEdit.thumbnail,
        fileSize: itemToEdit.size,
        fileName: itemToEdit.name
      };
    }
    return {
      mediaName: "",
      description: "",
      mediaTypeId: null,
      parentFolderId: null,
      fileSize: null,
      thumbnailUrl: null,
      fileName: ""
    };
  };

  const { handleSubmit, errors, form, validateField } = createForm<FormData>({
    initialValues: getInitialValues(),
    validate: (values) => {
      const errors: Partial<Record<keyof FormData, string>> = {};
      if (!values.mediaName) {
        errors.mediaName = "Folder name is required";
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
      try {
        isLoading = true;
        if (
          fileToUpload &&
          values.mediaTypeId &&
          !isFileTypeAllowed(fileToUpload, values.mediaTypeId)
        ) {
          const mediaTypeInfo = getSelectedMediaTypeInfo(values.mediaTypeId);
          fileTypeError = `Invalid file type. Please upload ${mediaTypeInfo?.displayName.toLowerCase()} (${mediaTypeInfo?.extensions}).`;
          return;
        }

        if (isEditMode) {
          await handleEditMediaSave(values);
        } else {
          await handleNewMediaSave(values);
        }
      } catch (error) {
        errorMessage = "An error occurred while saving the media.";
        console.error(error);
      } finally {
        isLoading = false;
      }
    }
  });

  const mediaTypeOptions = $derived.by(() => {
    let mediaTypeOptions: SelectOption[] = [];
    if (mediaTypes) {
      mediaTypes.forEach((type) => {
        mediaTypeOptions.push({ value: type.id, name: type.name });
      });
    }
    return mediaTypeOptions;
  });

  const folderOptions = $derived.by(() => {
    let folderOptions: SelectOption[] = [];
    if (folders) {
      folders.filter((folder) => {
        folder.media_type_id === $form.mediaTypeId &&
          folderOptions.push({
            value: folder.id,
            name: folder.folder_path ? folder.folder_path : ""
          });
      });
    }
    return folderOptions;
  });

  // Derived property for the current media type info
  const currentMediaTypeInfo = $derived.by(() => {
    return getSelectedMediaTypeInfo($form.mediaTypeId);
  });

  function handleBlur(field: keyof FormData) {
    validateField(field);
  }

  const handleFileDrop = async (event: CustomEvent<any>) => {
    try {
      isMediaProcessing = true;
      const { acceptedFiles } = event.detail;
      if (acceptedFiles.length) {
        const file = acceptedFiles[0] as File;

        // Validate file type against selected media type
        if ($form.mediaTypeId && !isFileTypeAllowed(file, $form.mediaTypeId)) {
          const mediaTypeInfo = getSelectedMediaTypeInfo($form.mediaTypeId);
          fileTypeError = `Invalid file type. Please upload ${mediaTypeInfo?.displayName.toLowerCase()} (${mediaTypeInfo?.extensions}).`;
          return;
        }

        fileTypeError = ""; // Clear error if file is valid
        fileToUpload = file;

        // Only generate thumbnail for images; for other types, create a default thumbnail based on type
        if (file.type.startsWith("image/")) {
          thumbnailToUpload = await generateImageThumbnail(fileToUpload);
        } else if (file.type.includes("application/pdf")) {
          thumbnailToUpload = await generatePDFThumbnails(fileToUpload);
        } else if (file.type.startsWith("video/")) {
          thumbnailToUpload = await generateVideoThumbnail(fileToUpload);
        } else {
          //
          // For other types use placeholder thumbnails based on file type
          thumbnailToUpload = await generatePlaceholderThumbnail(file.type);
        }
      }
    } catch (err) {
    } finally {
      isMediaProcessing = false;
    }
  };

  function handleSelectOptionChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = parseInt(select.value);
    const fieldName = select.name as keyof FormData;

    if (select.name === "parentFolderId") {
      $form.parentFolderId = value === 0 ? null : value;
    } else if (fieldName === "mediaTypeId") {
      $form.mediaTypeId = value === 0 ? null : value;

      // Clear file if media type changes and current file is not compatible
      if (
        fileToUpload &&
        !isFileTypeAllowed(fileToUpload, value === 0 ? null : value)
      ) {
        fileToUpload = null;
        thumbnailToUpload = null;
        fileTypeError = "";
      }
    }

    validateField(fieldName);
  }

  const folderPath = $derived.by(
    () =>
      folders?.find((folder) => folder.id == $form.parentFolderId)?.folder_path
  );

  const handleNewMediaSave = async (values: typeof $form) => {
    if (
      fileToUpload &&
      thumbnailToUpload &&
      values.mediaTypeId &&
      values.parentFolderId &&
      values.mediaName &&
      folderPath
    ) {
      const res = await userContext.saveNewMedia(
        fileToUpload,
        values.mediaName,
        values.description,
        thumbnailToUpload,
        values.parentFolderId,
        folderPath ?? null
      );

      if (res && res.error) {
        errorMessage = "An error occurred while saving the media.";
      } else if (res && res.status === 201) {
        closeModal();
      }
    } else {
      if (!fileToUpload || !thumbnailToUpload) {
        errorMessage = "Please upload a media file.";
      } else {
        errorMessage = "Please fill in all required fields.";
      }
    }
  };

  const handleEditMediaSave = async (values: typeof $form) => {
    try {
      const media: UpdatableMedia = {
        description: values.description,
        display_name: values.mediaName,
        folder_id: values.parentFolderId || 0,
        thumbnail: values.thumbnailUrl || null,
        size: values.fileSize,
        name: values.fileName
      };

      const res = await userContext.updateMedia(
        itemToEdit.id,
        media,
        fileToUpload,
        thumbnailToUpload,
        folderPath ?? null
      );

      if (res && res.error) {
        errorMessage = "An error occurred while updating the media.";
      } else if (res && (res.status === 200 || res.status === 204)) {
        closeModal();
      }
    } catch (error) {
      errorMessage = "An error occurred while updating the media.";
      console.error(error);
    }
  };
</script>

{#if isLoading}
  <Loader />
{/if}
<form onsubmit={handleSubmit}>
  <div class="grid grid-cols-6 gap-6 mb-5">
    <Label class="col-span-6 space-y-2">
      <span>Media name</span>
      <Input
        id="mediaName"
        name="mediaName"
        class="border outline-none"
        bind:value={$form.mediaName}
        on:blur={() => handleBlur("mediaName")}
        color={$errors.mediaName ? "red" : "base"}
      />
      {#if $errors.mediaName}
        <Helper class="mt-2" color="red">
          <span class="font-medium">{$errors.mediaName}</span>
        </Helper>
      {/if}
    </Label>
    <Label class="col-span-6 space-y-2">
      <span>Description</span>
      <Textarea
        id="description"
        name="description"
        rows={4}
        class="bg-gray-50 outline-none dark:bg-gray-700"
        placeholder="Provide a description about the media"
        bind:value={$form.description}
      ></Textarea>
    </Label>

    <Label class="col-span-6 space-y-2">
      <span>Select media type</span>
      <Select
        disabled={isEditMode}
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
        disabled={isEditMode}
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
    {#if fileToUpload}
      <div class="col-span-6 space-y-2 sm:col-span-4">
        <p class="text-sm text-gray-600">
          Current file: {fileToUpload?.name}
        </p>
        {#if currentMediaTypeInfo}
          <p class="text-xs text-gray-600">
            File type: {currentMediaTypeInfo.displayName}
          </p>
        {/if}
        <Button
          type="button"
          size="sm"
          color="light"
          on:click={() => ((fileToUpload = null), (thumbnailToUpload = null))}
        >
          Change File
        </Button>
      </div>
    {:else if !isEditMode || (isEditMode && !fileToUpload)}
      <DropZone
        disabled={!$form.mediaTypeId}
        on:drop={handleFileDrop}
        multiple={false}
        maxSize={10 * 1024 * 1024}
        containerClasses="col-span-6 space-y-2 sm:col-span-4"
      >
        <div class="text-center">
          <svg
            class="mx-auto size-12 text-gray-300"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            data-slot="icon"
          >
            <path
              fill-rule="evenodd"
              d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
              clip-rule="evenodd"
            />
          </svg>

          <div class="mt-4 flex text-sm/6 text-gray-600">
            {#if currentMediaTypeInfo}
              <label
                for="file-upload"
                class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 focus-within:outline-hidden hover:text-indigo-500"
              >
                <span>Upload a file / Drag and drop a file</span>
              </label>
            {/if}
          </div>

          {#if currentMediaTypeInfo}
            <div class="mt-1">
              <p class="text-xs/5 font-medium text-indigo-600">
                {currentMediaTypeInfo.displayName} only
              </p>
              <p class="text-xs/5 text-gray-600">
                Supported formats: {currentMediaTypeInfo.extensions}
              </p>
              <p class="text-xs/5 text-gray-600">Max size: 10MB</p>
            </div>
          {:else}
            <p class="text-xs/5 text-gray-600">
              Please select a media type first
            </p>
          {/if}
        </div>
      </DropZone>
    {/if}
    {#if fileTypeError}
      <div class="col-span-6">
        <Helper color="red">
          <span class="font-medium">{fileTypeError}</span>
        </Helper>
      </div>
    {/if}

    <div
      class="border-gray-200 border-2 border-dashed col-span-6 space-y-2 sm:col-span-2 flex flex-col items-center justify-center"
    >
      <div class="flex flex-col items-center text-center justify-center w-full">
        <Avatar
          class="mb-4 h-15 w-15 rounded-lg mt-1 sm:mb-0 xl:mb-4 2xl:mb-0"
          src={thumbnailToUpload
            ? URL.createObjectURL(thumbnailToUpload)
            : isEditMode && $form.thumbnailUrl
              ? $form.thumbnailUrl
              : ""}
          alt={$form.mediaName}
        />
      </div>
      <span class=" font-normal text-center">{$form.mediaName}</span>
    </div>
  </div>

  {#if errorMessage}
    <div class="mb-4">
      <Helper color="red">
        <span class="font-medium">{errorMessage}</span>
      </Helper>
    </div>
  {/if}

  <Button disabled={isMediaProcessing} type="submit">
    {#if isMediaProcessing}
      <Spinner class="me-3" size="4" color="white" /> Processing ...
    {:else}
      {isEditMode ? "Update" : "Save"} Media
    {/if}
  </Button>
</form>
