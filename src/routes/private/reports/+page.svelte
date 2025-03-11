<script lang="ts">
  import { Stats } from "$components";
  import {
    getUserState,
    type Folder,
    type Media,
  } from "$lib/state/user-state.svelte";
  import {
    Heading,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  let userContext = getUserState();
  let { media, folders, user } = $derived(userContext);
</script>

<main class="relative h-full w-full overflow-y-aut dark:bg-gray-800 p-4">
  <div class="p-4">
    <Heading
      tag="h1"
      class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl"
    >
      List of Reports
    </Heading>
    <h3 class="text-base font-thin text-gray-500 dark:text-gray-400">
      Manage and view all available reports.
    </h3>
  </div>
  <div class="p4">
    <Table shadow hoverable={true}>
      <TableHead>
        <TableHeadCell>Report Title</TableHeadCell>
        <TableHeadCell>Description</TableHeadCell>
        <TableHeadCell>Actions</TableHeadCell>
      </TableHead>
      <TableBody tableBodyClass="divide-y">
        <TableBodyRow>
          <TableBodyCell>Top 5 Media by created date</TableBodyCell>
          <TableBodyCell
            >This report provides a listing of media items by created date in
            descending order.</TableBodyCell
          >
          <TableBodyCell>
            <button
              class="font-medium mr-2 text-primary-600 hover:underline dark:text-primary-500"
              >View</button
            >
          </TableBodyCell>
        </TableBodyRow>
        <TableBodyRow>
          <TableBodyCell>Top 5 Folders by created date</TableBodyCell>
          <TableBodyCell
            >This report provides a listing of folders by created date in
            descending order.</TableBodyCell
          >
          <TableBodyCell
            ><button
              class="font-medium mr-2 text-primary-600 hover:underline dark:text-primary-500"
              >View</button
            ></TableBodyCell
          >
        </TableBodyRow>
        <TableBodyRow>
          <TableBodyCell>Top 5 Media by media type</TableBodyCell>
          <TableBodyCell
            >This report provides a listing of media grouped by media type.</TableBodyCell
          >
          <TableBodyCell
            ><button
              class="font-medium mr-2 text-primary-600 hover:underline dark:text-primary-500"
              >View</button
            ></TableBodyCell
          >
        </TableBodyRow>
      </TableBody>
    </Table>
  </div>
</main>
<div class="mt-px space-y-4">
  <div class="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
    <Stats />
  </div>
</div>
