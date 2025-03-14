<script lang="ts">
  import { Loader } from "$components";
  type ViewMediaProps = {
    itemToView: Media;
    closeModal: any;
  };
  import { getUserState, type Media } from "$lib/state/user-state.svelte";
  import { Badge, Button } from "flowbite-svelte";
  import { DownloadOutline } from "flowbite-svelte-icons";

  let userContext = getUserState();
  const { folders, user } = $derived(userContext);
  let { closeModal, itemToView }: ViewMediaProps = $props();

  let isLoading = $state(false);
  let error = $state<string | null>(null);

  let folderInfoForMedia = $derived.by(() =>
    folders?.find(
      (folder) => folder.id === itemToView.folder_id && folder.media_type_name
    )
  );

  function handleError() {
    error = `Failed to load file`;
    isLoading = false;
  }

  let mediaContainer = $state<HTMLElement>();

  const getFolderPath = (parentFolderId: number) =>
    folders?.find((folder) => folder.id == parentFolderId)?.folder_path;

  const getTagNames = (folderId: number) =>
    folders?.find((folder) => folder.id === folderId)?.tag_names;

  const getMediaUrl = (parentFolderId: number, mediaFileName: string) => {
    const fileFolderPath = getFolderPath(parentFolderId);
    if (fileFolderPath) {
      const response = userContext.getMediaPublicUrl(
        `${user?.id}/${fileFolderPath}/${mediaFileName}`
      );
      return response?.data.publicUrl || "";
    }
    return "";
  };

  const mediaPublicUrl = $derived(
    getMediaUrl(itemToView.folder_id, itemToView.name)
  );

  const tagNames = $derived.by(
    () => folderInfoForMedia?.id && getTagNames(folderInfoForMedia.id)
  );

  function getMediaTypeIcon(mediaType: string): string {
    switch (mediaType) {
      case "Image":
        return "🖼️";
      case "Video":
        return "🎬";
      case "Audio":
        return "🎵";
      case "Document":
        return "📄";
      default:
        return "📁";
    }
  }

  const handleFileDownload = async () => {
    try {
      isLoading = true;
      const fileName = itemToView.name;
      const fileFolderPath = getFolderPath(itemToView.folder_id);
      const fileDownloadPath = `${user?.id}/${fileFolderPath}/${fileName}`;
      const response = await userContext.downloadMedia(fileDownloadPath);

      if (response?.data) {
        const url = URL.createObjectURL(response.data);

        const a = document.createElement("a");
        a.href = url;
        a.download = decodeURI(fileName);

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
      }
    } catch (error) {
    } finally {
      isLoading = false;
    }
  };
</script>

{#if isLoading}
  <Loader />
{/if}
<div class="media-viewer">
  <div class="info-container">
    <div class="media-metadata">
      <div class="file-info">
        <div class="info-item">
          <span class="label">File Name:</span>
          <span class="value">{itemToView.display_name}</span>
        </div>

        <div class="info-item">
          <span class="label">Type:</span>
          <span class="value">
            <span class="media-type-icon"
              >{getMediaTypeIcon(
                folderInfoForMedia?.media_type_name ?? ""
              )}</span
            >
            {folderInfoForMedia?.media_type_name}
          </span>
        </div>

        {#if tagNames}
          <div class="info-item">
            <span class="label">Tags:</span>
            <span class="value">
              <span class="media-type-icon">
                {#each tagNames?.split(",") as tagName}
                  <Badge class="mr-2" color="red">{tagName}</Badge>
                {/each}
              </span>
            </span>
          </div>
        {/if}

        <div class="info-item file-path">
          <span class="label">Path:</span>
          <span class="value path-value"
            >{getFolderPath(itemToView.folder_id) || "N/A"}</span
          >
        </div>
      </div>

      <Button
        size="md"
        on:click={handleFileDownload}
        class="download-button"
        target="_blank"
        rel="noopener noreferrer"
      >
        <DownloadOutline class="w-5 h-5 me-2" /> Download File
      </Button>
    </div>
    <div class="media-description w-full">
      <span class="label">Description:</span>
      <span class="value file-description">{itemToView.description}</span>
    </div>
  </div>
  {#if isLoading}
    <div class="loading">Loading...</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else}
    <div bind:this={mediaContainer} class="media-container">
      {#if folderInfoForMedia?.media_type_name === "Image"}
        <img
          src={decodeURI(mediaPublicUrl)}
          alt={itemToView.display_name}
          onerror={handleError}
        />
      {:else if folderInfoForMedia?.media_type_name === "Video"}
        <video controls onerror={handleError}>
          <source src={decodeURI(mediaPublicUrl)} type="video/mp4" />
          <track kind="captions" srclang="en" label="English" default />
          Your browser does not support the video tag.
        </video>
      {:else if folderInfoForMedia?.media_type_name === "Audio"}
        <div class="audio-container">
          <div class="audio-filename">{itemToView.display_name}</div>
          <audio controls onerror={handleError}>
            <source src={decodeURI(mediaPublicUrl)} type="audio/mpeg" />
            Your browser does not support the audio tag.
          </audio>
        </div>
      {:else if folderInfoForMedia?.media_type_name === "Documents"}
        <div class="document-viewer">
          <p class="mb-3">Preview not available for this file type.</p>
          <Button
            outline
            href={decodeURI(mediaPublicUrl)}
            target="_blank"
            rel="noopener noreferrer"
            class="download-button"
            >Open '{itemToView.display_name}' in the browser</Button
          >
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .media-viewer {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info-container {
    display: flex;
    border-radius: 4px;
    flex-direction: column;
    background-color: #f8f9fa;
  }

  .file-description {
    font-family: monospace;
    font-size: 0.85rem;
    padding-top: 0.75rem;
    display: inline-block;
    word-break: break-all;
  }

  .media-metadata {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;

    flex-wrap: wrap;
    gap: 1rem;
  }

  .media-description {
    padding: 0.75rem;
  }

  .file-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .label {
    font-weight: bold;
    min-width: 80px;
    color: #555;
  }

  .value {
    color: #222;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .path-value {
    font-family: monospace;
    font-size: 0.85rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 300px;
  }

  .media-type-icon {
    font-size: 1.2rem;
  }
  .media-container {
    max-width: 100%;
    max-height: 60vh;
    overflow: auto;
    margin-top: 0.5rem;
    display: flex;
    justify-content: center;
    border-radius: 4px;
    background-color: #f1f1f1;
    padding: 1rem;
  }

  img {
    max-width: 100%;
    max-height: 60vh;
    object-fit: contain;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  video {
    max-width: 100%;
    max-height: 60vh;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .audio-container {
    width: 100%;
    max-width: 500px;
    padding: 1.5rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .audio-filename {
    margin-bottom: 1rem;
    font-weight: 500;
  }

  audio {
    width: 100%;
  }

  .document-viewer {
    width: 100%;
    max-width: 500px;
    padding: 2rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .loading,
  .error {
    padding: 2rem;
    text-align: center;
  }

  .error {
    color: red;
  }

  @media (max-width: 768px) {
    .media-metadata {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
