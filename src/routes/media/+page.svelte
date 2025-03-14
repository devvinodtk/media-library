<script lang="ts">
  import { Modal } from "$components";
  import type { Media } from "$lib/state/user-state.svelte";
  import {
    Avatar,
    Badge,
    Button,
    Heading,
    Input,
    Pagination,
    Select,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Toolbar,
    Tooltip
  } from "flowbite-svelte";
  import {
    EditOutline,
    PlusOutline,
    TrashBinOutline,
    ChevronLeftOutline,
    ChevronRightOutline
  } from "flowbite-svelte-icons";
  import { getUserState } from "$lib/state/user-state.svelte";
  let userContext = getUserState();
  let { media, folders } = $derived(userContext);
  let openModal = $state(false);
  let itemToEdit = $state<Media>();
  let currentForm = $state<
    "manage-media" | "view-media" | "delete-confirmation"
  >("manage-media");
  let modalHeading = $state<string>("");

  export const mediaTableColumns = [
    {
      id: "thumbnail",
      label: "",
      accessor: (item: Media) => item.thumbnail || "",
      sortable: false
    },
    {
      id: "name",
      label: "Name",
      accessor: (item: Media) => item.display_name,
      sortable: true
    },
    {
      id: "mediaType",
      label: "Media Type",
      accessor: (item: Media) => getMediaType(item.folder_id),
      sortable: true
    },
    {
      id: "folderPath",
      label: "Folder Path",
      accessor: (item: Media) => getFolderPath(item.folder_id) || "",
      sortable: true
    },
    {
      id: "description",
      label: "Description",
      accessor: (item: Media) => item.description || "",
      sortable: true
    },
    {
      id: "tagNames",
      label: "Tags",
      accessor: (item: Media) => getTagNames(item.folder_id),
      sortable: true
    },
    {
      id: "actions",
      label: "",
      accessor: (item: Media) => "",
      sortable: false
    }
  ];

  // Search and filter states
  let searchTerm = $state<string>("");
  let filterColumn = $state<string>("all");
  let sortColumn = $state<string>("name");
  let sortDirection = $state<"asc" | "desc">("asc");

  // Track the last values to decide when to reset
  let lastSearchTerm = $state<string>("");
  let lastFilterColumn = $state<string>("all");

  // Pagination states
  let currentPage = $state<number>(1);
  let pageSize = $state<number>(10);
  let pageSizeOptions = [5, 10, 25, 50, 100];

  const getFolderPath = (parentFolderId: number) =>
    folders?.find((folder) => folder.id === parentFolderId)?.folder_path;

  const getMediaType = (parentFolderId: number) =>
    folders?.find((folder) => folder.id === parentFolderId)?.media_type_name;

  const getTagNames = (folderId: number) =>
    folders?.find((folder) => folder.id === folderId)?.tag_names;

  function getFilteredMedia() {
    if (!media) return [];

    if (!searchTerm.trim()) return media;

    return media.filter((item) => {
      const term = searchTerm.toLowerCase();

      // Filter across all searchable columns
      if (filterColumn === "all") {
        return mediaTableColumns
          .filter((col) => col.id !== "thumbnail" && col.id !== "actions") // Skip non-searchable columns
          .some((col) => {
            const value = col.accessor(item);
            return value && value.toLowerCase().includes(term);
          });
      }

      // Filter by specific column
      const column = mediaTableColumns.find((col) => col.id === filterColumn);
      if (!column) return true; // If column not found, don't filter

      const value = column.accessor(item);
      return value && value.toLowerCase().includes(term);
    });
  }

  function handleSort(columnId: string) {
    const column = mediaTableColumns.find((col) => col.id === columnId);
    if (!column || !column.sortable) return;

    if (sortColumn === columnId) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortColumn = columnId;
      sortDirection = "asc";
    }
  }

  function getSortedAndFilteredMedia() {
    const filtered = getFilteredMedia();

    return [...filtered].sort((a, z) => {
      const column = mediaTableColumns.find((col) => col.id === sortColumn);
      if (!column) return 0;

      const valA = column.accessor(a);
      const valZ = column.accessor(z);

      const result =
        typeof valA === "string" && typeof valZ === "string"
          ? valA.localeCompare(valZ)
          : 0;

      return sortDirection === "asc" ? result : -result;
    });
  }

  const filteredAndSortedMedia = $derived.by(() => getSortedAndFilteredMedia());

  const totalPages = $derived.by(() =>
    Math.ceil(filteredAndSortedMedia.length / pageSize)
  );

  // Create the pages array that Pagination component expects
  const pages = $derived.by(() =>
    Array.from({ length: totalPages }, (_, i) => ({
      name: (i + 1).toString(),
      href: `#page-${i + 1}`,
      active: i + 1 === currentPage
    }))
  );

  const paginatedData = $derived.by(() => getPaginatedData());

  // Handle page size change
  function handlePageSizeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    pageSize = parseInt(select.value);
    currentPage = 1; // Reset to first page when changing page size
  }

  // Get paginated data
  function getPaginatedData() {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedMedia.slice(startIndex, endIndex);
  }

  const filterOptions = mediaTableColumns
    .filter(
      (col) => col.id !== "thumbnail" && col.id !== "actions" && col.sortable
    )
    .map((col) => ({ value: col.id, label: col.label }));

  // Reset filters
  function resetFilters() {
    searchTerm = "";
    filterColumn = "all";
  }

  function updateSearchTerm(event: Event) {
    const input = event.target as HTMLInputElement;
    searchTerm = input.value;
    if (currentPage !== 1) {
      currentPage = 1;
    }
  }

  function updateFilterColumn(event: Event) {
    const select = event.target as HTMLSelectElement;
    filterColumn = select.value;
    if (currentPage !== 1) {
      currentPage = 1;
    }
  }

  $effect(() => {
    // Only reset pagination when these values actually change
    if (searchTerm !== lastSearchTerm || filterColumn !== lastFilterColumn) {
      currentPage = 1;
      lastSearchTerm = searchTerm;
      lastFilterColumn = filterColumn;
    }
  });

  const handleAvatarClick = (item: Media) => {
    openModal = true;
    modalHeading = "Preview Media File";
    currentForm = "view-media";
    itemToEdit = item;
  };
</script>

<main class="relative h-full w-full overflow-y-auto dark:bg-gray-800 p-4">
  <div class="p-4">
    <Heading
      tag="h1"
      class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl"
    >
      All Media
    </Heading>
    <Toolbar
      embedded
      class="w-full toolbar py-4 text-gray-500 dark:text-gray-400"
    >
      <div class="flex flex-col sm:flex-row w-full gap-2 justify-between">
        <div
          class="flex flex-col sm:flex-row items-start sm:items-center gap-2"
        >
          <Input
            type="text"
            on:input={updateSearchTerm}
            placeholder="Search for media"
            class="me-2 w-64 border xl:w-80"
          />
          <div class="flex flex-row gap-2 w-full sm:w-auto">
            <Select
              class="w-40 me-2"
              on:change={updateFilterColumn}
              bind:value={filterColumn}
            >
              <option value="all">All Columns</option>
              {#each filterOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </Select>
            <Button size="sm" color="light" on:click={resetFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </div>
      <div slot="end" class="flex">
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

    <!-- Display filter and pagination stats -->
    <div class="mb-4 flex flex-wrap items-center justify-between">
      <div class="text-sm text-gray-600 dark:text-gray-400">
        {#if searchTerm.trim()}
          Showing {filteredAndSortedMedia.length} of {media?.length || 0} items
          {#if filterColumn !== "all"}
            | Filtering by: {mediaTableColumns.find(
              (col) => col.id === filterColumn
            )?.label || filterColumn}
          {/if}
        {/if}
      </div>

      <div class="flex items-center space-x-2 mt-2 sm:mt-0">
        <span class="text-sm text-gray-600 dark:text-gray-400"
          >Items per page:</span
        >
        <Select
          class="w-16"
          bind:value={pageSize}
          on:change={handlePageSizeChange}
          size="sm"
        >
          {#each pageSizeOptions as option}
            <option value={option}>{option}</option>
          {/each}
        </Select>
      </div>
    </div>

    <Table shadow hoverable={true}>
      <TableHead>
        {#each mediaTableColumns as column}
          <TableHeadCell>
            {#if column.sortable}
              <button
                class="flex items-center"
                onclick={() => handleSort(column.id)}
              >
                {column.label}
                {#if sortColumn === column.id}
                  <span class="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span
                  >
                {/if}
              </button>
            {:else}
              <span class={column.id === "actions" ? "sr-only" : ""}
                >{column.label}</span
              >
            {/if}
          </TableHeadCell>
        {/each}
      </TableHead>
      {#if media}
        <TableBody tableBodyClass="divide-y">
          {#each paginatedData as item (item.id)}
            <TableBodyRow>
              <TableBodyCell>
                {#if item.thumbnail}
                  <button
                    type="button"
                    onclick={() => handleAvatarClick(item)}
                    aria-label="View Media"
                    class="p-0 border-none bg-transparent"
                  >
                    <Avatar
                      src={item.thumbnail}
                      class="w-11 h-11 min-w-[3rem]"
                    />
                  </button>
                {/if}
              </TableBodyCell>
              <TableBodyCell>{item.display_name}</TableBodyCell>
              <TableBodyCell>{getMediaType(item.folder_id)}</TableBodyCell>
              <TableBodyCell>{getFolderPath(item.folder_id)}</TableBodyCell>
              <TableBodyCell>{item.description}</TableBodyCell>
              <TableBodyCell>
                {#each getTagNames(item.folder_id)?.split(",") ?? [] as tagName}
                  <Badge class="mr-2" color="dark">{tagName}</Badge>
                {/each}
              </TableBodyCell>
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
          {#if filteredAndSortedMedia.length === 0}
            <TableBodyRow>
              <TableBodyCell
                colspan={mediaTableColumns.length}
                class="text-center py-4"
              >
                No media found matching your search criteria.
                <Button
                  size="xs"
                  color="light"
                  class="ml-2"
                  on:click={resetFilters}
                >
                  Clear Filters
                </Button>
              </TableBodyCell>
            </TableBodyRow>
          {/if}
        </TableBody>
      {/if}
    </Table>

    <!-- Pagination controls -->
    {#if filteredAndSortedMedia.length > 0}
      <div class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(
            currentPage * pageSize,
            filteredAndSortedMedia.length
          )} of {filteredAndSortedMedia.length} items
        </div>

        <Pagination
          {pages}
          on:next={() => (currentPage = Math.min(currentPage + 1, totalPages))}
          on:previous={() => (currentPage = Math.max(currentPage - 1, 1))}
        >
          <svelte:fragment slot="prev">
            <span class="sr-only">Previous</span>
            <ChevronLeftOutline class="w-6 h-6" />
          </svelte:fragment>
          <svelte:fragment slot="next">
            <span class="sr-only">Next</span>
            <ChevronRightOutline class="w-6 h-6" />
          </svelte:fragment>
        </Pagination>
      </div>
    {/if}
  </div>
</main>

<Modal
  bind:open={openModal}
  item={itemToEdit as Media}
  {currentForm}
  {modalHeading}
></Modal>
