<script lang="ts">
  import { getUserState, type Media } from "$lib/state/user-state.svelte";
  import { formatBytes, sortedItemsBySize } from "$lib/utils/utility-functions";
  import {
    Button,
    Heading,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Spinner
  } from "flowbite-svelte";
  import { DownloadOutline } from "flowbite-svelte-icons";
  let userContext = getUserState();
  let { media, folders, user } = $derived(userContext);
  let isZipLoading = $state(false);
  let isCSVLoading = $state(false);

  const getFolderPath = (parentFolderId: number) =>
    folders?.find((folder) => folder.id == parentFolderId)?.folder_path;

  const handleDownloadFilesReport = async () => {
    try {
      isZipLoading = true;
      const filePath: string[] = [];
      media?.forEach((file) => {
        const createdDate = new Date(file.created_at);
        const today = new Date();

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        if (createdDate >= sevenDaysAgo) {
          const fileFolderPath = getFolderPath(file.folder_id);
          if (fileFolderPath) {
            filePath.push(`${user?.id}/${fileFolderPath}/${file.name}`);
          }
        }
      });

      if (filePath?.length) {
        await userContext.downloadFilesAsZip(filePath);
      }
    } catch (error) {
      console.error("Error downloading one week media report", error);
    } finally {
      isZipLoading = false;
    }
  };

  const getMediaType = (parentFolderId: number) =>
    folders?.find((folder) => folder.id == parentFolderId)?.media_type_name;

  const exportMediaListToCsv = (sortedMedia: Media[]) => {
    const headers = [
      "Media Name",
      "Media Type",
      "File Size",
      "Folder Path",
      "Description",
      "Created At"
    ];

    let csvContent = headers.join(",") + "\n";
    sortedMedia.forEach((item) => {
      const formattedSize = item.size && formatBytes(item.size);
      const escapedName = item.display_name.includes(",")
        ? `"${item.display_name}"`
        : item.display_name;

      const escapedDescription =
        item.description && item.description.includes(",")
          ? `"${item.description}"`
          : item.description;

      const row = [
        escapedName,
        getMediaType(item.folder_id),
        formattedSize || "NA",
        getFolderPath(item.folder_id) || "",
        escapedDescription,
        item.created_at
      ].join(",");

      csvContent += row + "\n";
    });

    return csvContent;
  };

  const handleDownloadLargeMediaReport = () => {
    if (!media) {
      return;
    }
    try {
      isCSVLoading = true;
      const csvContent: string = exportMediaListToCsv(sortedItemsBySize(media));

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `media-list-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading csv report", error);
    } finally {
      isCSVLoading = false;
    }
  };
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
          <TableBodyCell>Recently uploaded files</TableBodyCell>
          <TableBodyCell
            >This report provides a view of media that are uploaded over the
            last week.</TableBodyCell
          >
          <TableBodyCell>
            <Button size="sm" on:click={handleDownloadFilesReport}>
              {#if isZipLoading}
                <Spinner class="me-3" size="4" color="white" /> Downloading ...
              {:else}
                <DownloadOutline class="w-5 h-5 me-2" />Download
              {/if}
            </Button>
          </TableBodyCell>
        </TableBodyRow>
        <TableBodyRow>
          <TableBodyCell>Large Media</TableBodyCell>
          <TableBodyCell>
            This report provides a view of media by its size in descending
            order.
          </TableBodyCell>
          <TableBodyCell>
            <Button size="sm" on:click={handleDownloadLargeMediaReport}>
              {#if isCSVLoading}
                <Spinner class="me-3" size="4" color="white" /> Downloading ...
              {:else}
                <DownloadOutline class="w-5 h-5 me-2" /> Download
              {/if}
            </Button>
          </TableBodyCell>
        </TableBodyRow>
      </TableBody>
    </Table>
  </div>
</main>
<!-- <div class="mt-px space-y-4">
  <div class="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
    <Stats />
  </div>
</div> -->
