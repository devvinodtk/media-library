import type { Folder, Media } from "$lib/state/user-state.svelte";

export const mediaTableColumns = [
  {
    id: "thumbnail",
    label: "",
    accessor: (item: Media) => item.thumbnail || "",
    sortable: false,
  },
  {
    id: "name",
    label: "Name",
    accessor: (item: Media) => item.display_name,
    sortable: true,
  },
  {
    id: "mediaType",
    label: "Media Type",
    accessor: (item: Media) => "Image", // Replace with actual media type when available
    sortable: true,
  },
  {
    id: "folderPath",
    label: "Folder Path",
    accessor: (item: Media) => item.folder_id || "",
    sortable: true,
  },
  {
    id: "description",
    label: "Description",
    accessor: (item: Media) => item.description || "",
    sortable: true,
  },
  {
    id: "actions",
    label: "",
    accessor: (item: Media) => "",
    sortable: false,
  },
];

export const allowedFileTypes = {
  image: {
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ],
    extensions: "JPG, PNG, GIF, WEBP, SVG",
    displayName: "Images",
  },
  video: {
    mimeTypes: ["video/mp4", "video/webm", "video/ogg"],
    extensions: "MP4, WEBM, OGV",
    displayName: "Videos",
  },
  audio: {
    mimeTypes: ["audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"],
    extensions: "MP3, OGG, WAV, WEBM",
    displayName: "Audio files",
  },
  documents: {
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    extensions: "PDF, DOC, DOCX, TXT, XLS, XLSX",
    displayName: "Documents",
  },
};
