<script lang="ts">
  import { Modal } from "$components";
  import type { Folder } from "$lib/state/user-state.svelte";
  import {
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
  } from "flowbite-svelte";
  import {
    ChevronLeftOutline,
    ChevronRightOutline,
    EditOutline,
    PlusOutline,
    TrashBinOutline,
  } from "flowbite-svelte-icons";

  import { getUserState } from "$lib/state/user-state.svelte";
  import { folderTableColumns } from "$lib/utils/constants";
  let userContext = getUserState();
  let { folders } = $derived(userContext);
  let openModal = $state(false);
  let itemToEdit = $state<Folder>();
  let currentForm = $state<"manage-folder" | "delete-confirmation">(
    "manage-folder",
  );
  let modalHeading = $state<string>("");

  // Search and filter states
  let searchTerm = $state<string>("");
  let filterColumn = $state<string>("all");
  let sortColumn = $state<string>("folderName");
  let sortDirection = $state<"asc" | "desc">("asc");

  // Track the last values to decide when to reset
  let lastSearchTerm = $state<string>("");
  let lastFilterColumn = $state<string>("all");

  // Pagination states
  let currentPage = $state<number>(1);
  let pageSize = $state<number>(10);
  let pageSizeOptions = [5, 10, 25, 50, 100];

  const getFilteredFolders = () => {
    if (!folders) return [];

    if (!searchTerm.trim()) return folders;

    return folders.filter((item) => {
      const term = searchTerm.toLowerCase();

      if (filterColumn === "all") {
        return folderTableColumns
          .filter((col) => col.id !== "actions") // Skip non-searchable columns
          .some((col) => {
            const value = col.accessor(item);
            return value && value.toLowerCase().includes(term);
          });
      }

      // Filter by specific column
      const column = folderTableColumns.find((col) => col.id === filterColumn);
      if (!column) return true; // If column not found, don't filter

      const value = column.accessor(item);
      return value && value.toLowerCase().includes(term);
    });
  };

  function handleSort(columnId: string) {
    const column = folderTableColumns.find((col) => col.id === columnId);
    if (!column || !column.sortable) return;

    if (sortColumn === columnId) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortColumn = columnId;
      sortDirection = "asc";
    }
  }

  function getSortedAndFilteredFolders() {
    const filtered = getFilteredFolders();

    return [...filtered].sort((a, z) => {
      const column = folderTableColumns.find((col) => col.id === sortColumn);
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

  const filteredAndSortedFolders = $derived.by(() =>
    getSortedAndFilteredFolders(),
  );

  const totalPages = $derived.by(() =>
    Math.ceil(filteredAndSortedFolders.length / pageSize),
  );

  const pages = $derived.by(() =>
    Array.from({ length: totalPages }, (_, i) => ({
      name: (i + 1).toString(),
      href: `#page-${i + 1}`,
      active: i + 1 === currentPage,
    })),
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
    return filteredAndSortedFolders.slice(startIndex, endIndex);
  }

  const filterOptions = folderTableColumns
    .filter(
      (col) => col.id !== "thumbnail" && col.id !== "actions" && col.sortable,
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
</script>

<main class="relative h-full w-full overflow-y-aut dark:bg-gray-800 p-4">
  <div class="p-4">
    <Heading
      tag="h1"
      class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl"
    >
      All Folders
    </Heading>
    <Toolbar embedded class="w-full py-4 text-gray-500  dark:text-gray-400">
      <div class="flex items-center">
        <Input
          type="text"
          on:input={updateSearchTerm}
          placeholder="Search for folders"
          class="me-2 w-64 border xl:w-80"
        />
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

    <div class="mb-4 flex flex-wrap items-center justify-between">
      <div class="text-sm text-gray-600 dark:text-gray-400">
        {#if searchTerm.trim()}
          Showing {filteredAndSortedFolders.length} of {folders?.length || 0} items
          {#if filterColumn !== "all"}
            | Filtering by: {folderTableColumns.find(
              (col) => col.id === filterColumn,
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
        {#each folderTableColumns as column}
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
      {#if folders}
        <TableBody tableBodyClass="divide-y">
          {#each paginatedData as item (item)}
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
          {#if filteredAndSortedFolders.length === 0}
            <TableBodyRow>
              <TableBodyCell
                colspan={folderTableColumns.length}
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
    {#if filteredAndSortedFolders.length > 0}
      <div class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(
            currentPage * pageSize,
            filteredAndSortedFolders.length,
          )} of {filteredAndSortedFolders.length} items
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
  item={itemToEdit as Folder}
  {currentForm}
  {modalHeading}
></Modal>
