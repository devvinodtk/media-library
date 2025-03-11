import type { Folder } from "$lib/state/user-state.svelte";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// Set the worker source path
GlobalWorkerOptions.workerSrc = "/src/assets/pdf.worker.min.mjs";

export function generateFolderPaths(folders: Folder[]) {
  const folderMap = new Map();

  // Create a map for quick lookup
  folders.forEach((folder) => {
    folderMap.set(folder.id, folder);
  });

  // Function to construct folder path
  function getFolderPath(folder: Folder) {
    const path = [];
    while (folder) {
      path.unshift(folder.folder_name);
      folder = folderMap.get(folder.parent_folder_id) || null;
    }
    return path.join("/");
  }

  // Generate new array with folder_path
  return folders.map((folder) => ({
    ...folder,
    folder_path: getFolderPath(folder),
  }));
}

export async function generateImageThumbnail(file: File): Promise<File | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target || typeof e.target.result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }

      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const maxWidth = 100;
        const maxHeight = 100;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (aspectRatio > 1) {
            // Landscape image
            width = maxWidth;
            height = Math.round(maxWidth / aspectRatio);
          } else {
            // Portrait or square image
            height = maxHeight;
            width = Math.round(maxHeight * aspectRatio);
          }
        }

        // Create canvas and draw the resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Draw the image on the canvas with the new dimensions
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob and then to File
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to create image blob"));
            return;
          }

          // Create a new file with timestamp to ensure uniqueness
          const thumbnail = new File(
            [blob],
            `${new Date().getTime()}_thumbnail.png`,
            { type: "image/png" },
          );

          resolve(thumbnail);
        }, "image/png");
      };

      img.onerror = () => reject(new Error("Failed to load image"));
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export const generateVideoThumbnail = async (
  file: File,
): Promise<File | null> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = url;
    video.currentTime = 5; // Capture frame at 5 seconds

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      canvas.width = video.videoWidth / 2;
      canvas.height = video.videoHeight / 2;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to create image blob"));
          return;
        }

        // Create a new file with timestamp to ensure uniqueness
        const thumbnail = new File(
          [blob],
          `${new Date().getTime()}_thumbnail.png`,
          { type: "image/png" },
        );

        resolve(thumbnail);
      }, "image/png");
    };
  });
};

export async function generatePDFThumbnails(file: File): Promise<File | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (!e.target?.result) {
        reject(new Error("Failed to read file"));
        return;
      }

      if (e.target.result instanceof ArrayBuffer) {
        try {
          const pdf = await getDocument({
            data: new Uint8Array(e.target.result),
          }).promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 0.5 });

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: ctx, viewport }).promise;

          // Convert canvas to blob instead of DataURL
          canvas.toBlob((blob) => {
            if (blob) {
              // Create a new File from the blob
              const thumbnailFile = new File(
                [blob],
                `${file.name.split(".")[0]}_thumbnail.png`,
                { type: "image/png" },
              );
              resolve(thumbnailFile);
            } else {
              reject(new Error("Failed to convert canvas to blob"));
            }
          }, "image/png");
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error("Invalid file type: expected an ArrayBuffer"));
        return;
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

// Create a placeholder thumbnail based on file type
export const generatePlaceholderThumbnail = async (
  fileType: string,
): Promise<File> => {
  // This is a simplified example - in a real implementation you might want to
  // use actual icons for different file types or generate thumbnails for videos, etc.
  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#666666";
    ctx.font = "24px Arial";

    let fileTypeName = "File";
    if (fileType.startsWith("video/")) fileTypeName = "Video";
    else if (fileType.startsWith("audio/")) fileTypeName = "Audio";
    else if (
      fileType.startsWith("application/") ||
      fileType.startsWith("text/")
    )
      fileTypeName = "Document";

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fileTypeName, canvas.width / 2, canvas.height / 2);
  }

  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "thumbnail.png", { type: "image/png" });
        resolve(file);
      }
    }, "image/png");
  });
};

export const getFormattedDate = (timestamp: string) => {
  let dateObj = new Date(timestamp);
  let formattedDate = "";

  if (dateObj) {
    formattedDate = dateObj.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
  return formattedDate;
};

export const getFormattedTime = (timestamp: string) => {
  let dateObj = new Date(timestamp);
  let formattedTime = "";

  if (dateObj) {
    formattedTime = dateObj.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Use 24-hour format
    });
  }
  return formattedTime;
};
